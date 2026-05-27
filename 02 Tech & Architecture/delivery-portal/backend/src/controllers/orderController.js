const { PrismaClient } = require('@prisma/client')
const { notify } = require('../services/notificationService')

const prisma = new PrismaClient()

const BASE_PRICES = { DOCUMENT: 49, SMALL: 79, MEDIUM: 99, LARGE: 149, FRAGILE: 199 }

const calculatePrice = (packageType, weight) =>
  (BASE_PRICES[packageType] || 99) + parseFloat(weight || 1) * 10

const generateTrackingId = () =>
  'TRK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase()

const createOrder = async (req, res) => {
  const { pickupAddress, dropAddress, packageType, weight, notes } = req.body

  if (!pickupAddress || !dropAddress || !packageType) {
    return res.status(400).json({ error: 'Pickup, drop address and package type are required' })
  }

  try {
    const price = calculatePrice(packageType, weight)
    const order = await prisma.order.create({
      data: {
        trackingId: generateTrackingId(),
        customerId: req.user.id,
        pickupAddress,
        dropAddress,
        packageType,
        weight: parseFloat(weight) || 1,
        price,
        notes: notes || '',
        statusHistory: {
          create: { status: 'PENDING', message: 'Order placed successfully' }
        }
      },
      include: {
        customer: { select: { name: true, email: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } }
      }
    })
    // Notify customer
    await notify(order.customer.phone, 'ORDER_PLACED', order.trackingId)
    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user.id },
      include: {
        partner: { select: { name: true, phone: true, vehicle: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(orders)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        partner: { select: { name: true, phone: true, vehicle: true, rating: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } }
      }
    })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const trackOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { trackingId: req.params.trackingId },
      include: {
        partner: { select: { name: true, vehicle: true, phone: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } }
      }
    })
    if (!order) return res.status(404).json({ error: 'No order found with this tracking ID' })
    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getPriceEstimate = (req, res) => {
  const { packageType, weight } = req.query
  if (!packageType) return res.status(400).json({ error: 'packageType required' })
  const price = calculatePrice(packageType, weight)
  res.json({ price })
}

module.exports = { createOrder, getMyOrders, getOrderById, trackOrder, getPriceEstimate }
