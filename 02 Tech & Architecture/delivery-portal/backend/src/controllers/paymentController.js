const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')
const { notify } = require('../services/notificationService')

const prisma = new PrismaClient()

const getRazorpay = () => {
  if (
    !process.env.RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID.includes('PASTE')
  ) return null
  const Razorpay = require('razorpay')
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

const createPaymentOrder = async (req, res) => {
  const { orderId } = req.body
  if (!orderId) return res.status(400).json({ error: 'orderId required' })

  const razorpay = getRazorpay()
  if (!razorpay) {
    return res.status(503).json({ error: 'Payment gateway not configured. Add RAZORPAY keys to .env' })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: { select: { name: true } } }
    })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (order.customerId !== req.user.id) return res.status(403).json({ error: 'Not your order' })
    if (order.isPaid) return res.status(400).json({ error: 'Order already paid' })

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(order.price * 100),
      currency: 'INR',
      receipt: order.trackingId,
      notes: { orderId: order.id, trackingId: order.trackingId }
    })

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      orderId: order.id,
      trackingId: order.trackingId,
      customerName: order.customer.name,
      keyId: process.env.RAZORPAY_KEY_ID
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid payment signature — possible fraud attempt' })
  }

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { isPaid: true, paymentId: razorpay_payment_id },
      include: { customer: { select: { name: true, phone: true } } }
    })

    await notify(order.customer.phone, 'PAYMENT_SUCCESS', order.trackingId, order.price)
    res.json({ success: true, order })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = { createPaymentOrder, verifyPayment }
