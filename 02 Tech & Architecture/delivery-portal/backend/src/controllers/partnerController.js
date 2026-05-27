const { PrismaClient } = require('@prisma/client')
const { notify } = require('../services/notificationService')

const prisma = new PrismaClient()

const getAvailableJobs = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'PENDING' },
      include: { customer: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(orders)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getMyJobs = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { partnerId: req.user.id },
      include: {
        customer: { select: { name: true, phone: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } }
      },
      orderBy: { updatedAt: 'desc' }
    })
    res.json(orders)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const acceptJob = async (req, res) => {
  const { orderId } = req.params
  const partnerId = req.user.id

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (order.status !== 'PENDING') return res.status(400).json({ error: 'Order is no longer available' })

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        partnerId,
        status: 'ASSIGNED',
        statusHistory: {
          create: { status: 'ASSIGNED', message: 'Delivery partner accepted the job' }
        }
      },
      include: {
        customer: { select: { name: true, phone: true } },
        partner: { select: { name: true, phone: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } }
      }
    })

    await prisma.deliveryPartner.update({
      where: { id: partnerId },
      data: { isAvailable: false }
    })

    await notify(updated.customer.phone, 'PARTNER_ASSIGNED', updated.trackingId, updated.partner.name, updated.partner.phone)
    res.json(updated)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params
  const { status, message } = req.body
  const partnerId = req.user.id

  const VALID_STATUSES = ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED']
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be PICKED_UP, IN_TRANSIT or DELIVERED' })
  }

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (order.partnerId !== partnerId) return res.status(403).json({ error: 'Not your order' })

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        statusHistory: {
          create: { status, message: message || `Status updated to ${status.replace('_', ' ')}` }
        }
      }
    })

    // Get customer phone for notification
    const fullOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: { select: { phone: true } } }
    })

    const notifyMap = { PICKED_UP: 'PICKED_UP', IN_TRANSIT: 'IN_TRANSIT', DELIVERED: 'DELIVERED' }
    if (notifyMap[status]) {
      await notify(fullOrder.customer.phone, notifyMap[status], order.trackingId)
    }

    if (status === 'DELIVERED') {
      const earning = parseFloat((order.price * 0.7).toFixed(2))
      await prisma.earning.create({
        data: { partnerId, orderId: order.id, amount: earning }
      })
      await prisma.deliveryPartner.update({
        where: { id: partnerId },
        data: { isAvailable: true, totalEarned: { increment: earning } }
      })
    }

    res.json(updated)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getEarnings = async (req, res) => {
  try {
    const earnings = await prisma.earning.findMany({
      where: { partnerId: req.user.id },
      include: {
        order: { select: { trackingId: true, dropAddress: true, price: true, createdAt: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0)
    res.json({ earnings, totalEarned })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getProfile = async (req, res) => {
  try {
    const partner = await prisma.deliveryPartner.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, vehicle: true, isAvailable: true, rating: true, totalEarned: true, createdAt: true }
    })
    const totalDeliveries = await prisma.order.count({
      where: { partnerId: req.user.id, status: 'DELIVERED' }
    })
    res.json({ ...partner, totalDeliveries })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = { getAvailableJobs, getMyJobs, acceptJob, updateOrderStatus, getEarnings, getProfile }
