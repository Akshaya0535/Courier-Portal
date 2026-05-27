const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { notify } = require('../services/notificationService')

const prisma = new PrismaClient()

const getDashboard = async (req, res) => {
  try {
    const [totalOrders, pendingOrders, assignedOrders, inTransitOrders, deliveredOrders, cancelledOrders, totalCustomers, totalPartners, revenueData] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'ASSIGNED' } }),
        prisma.order.count({ where: { status: 'IN_TRANSIT' } }),
        prisma.order.count({ where: { status: 'DELIVERED' } }),
        prisma.order.count({ where: { status: 'CANCELLED' } }),
        prisma.user.count(),
        prisma.deliveryPartner.count(),
        prisma.earning.aggregate({ _sum: { amount: true } })
      ])

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true } },
        partner: { select: { name: true } }
      }
    })

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        assignedOrders,
        inTransitOrders,
        deliveredOrders,
        cancelledOrders,
        totalCustomers,
        totalPartners,
        totalRevenue: revenueData._sum.amount || 0
      },
      recentOrders
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const where = status && status !== 'ALL' ? { status } : {}

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { name: true, email: true, phone: true } },
          partner: { select: { name: true, phone: true, vehicle: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ])

    res.json({ orders, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getAvailablePartners = async (req, res) => {
  try {
    const partners = await prisma.deliveryPartner.findMany({
      where: { isAvailable: true },
      select: { id: true, name: true, vehicle: true, rating: true }
    })
    res.json(partners)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const assignPartner = async (req, res) => {
  const { orderId } = req.params
  const { partnerId } = req.body

  if (!partnerId) return res.status(400).json({ error: 'partnerId required' })

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        partnerId,
        status: 'ASSIGNED',
        statusHistory: {
          create: { status: 'ASSIGNED', message: 'Assigned by admin' }
        }
      },
      include: { partner: { select: { name: true } } }
    })

    await prisma.deliveryPartner.update({
      where: { id: partnerId },
      data: { isAvailable: false }
    })

    // Notify customer
    const customer = await prisma.user.findUnique({ where: { id: order.customerId }, select: { phone: true } })
    const partner = await prisma.deliveryPartner.findUnique({ where: { id: partnerId }, select: { name: true, phone: true } })
    await notify(customer.phone, 'PARTNER_ASSIGNED', order.trackingId, partner.name, partner.phone)

    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params
  const { status, message } = req.body

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        statusHistory: {
          create: { status, message: message || 'Status updated by admin' }
        }
      }
    })

    if (status === 'CANCELLED' && order.partnerId) {
      await prisma.deliveryPartner.update({
        where: { id: order.partnerId },
        data: { isAvailable: true }
      })
    }

    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
    const withOrderCount = await Promise.all(
      users.map(async (u) => ({
        ...u,
        orderCount: await prisma.order.count({ where: { customerId: u.id } })
      }))
    )
    res.json(withOrderCount)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getAllPartners = async (req, res) => {
  try {
    const partners = await prisma.deliveryPartner.findMany({
      select: { id: true, name: true, email: true, phone: true, vehicle: true, isAvailable: true, rating: true, totalEarned: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
    const withDeliveries = await Promise.all(
      partners.map(async (p) => ({
        ...p,
        totalDeliveries: await prisma.order.count({ where: { partnerId: p.id, status: 'DELIVERED' } })
      }))
    )
    res.json(withDeliveries)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const createPartner = async (req, res) => {
  const { name, email, password, phone, vehicle } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' })
  try {
    const exists = await prisma.deliveryPartner.findUnique({ where: { email } })
    if (exists) return res.status(400).json({ error: 'Email already registered' })
    const hashed = await bcrypt.hash(password, 10)
    const partner = await prisma.deliveryPartner.create({
      data: { name, email, password: hashed, phone: phone || '', vehicle: vehicle || 'Bike' }
    })
    res.json({ id: partner.id, name: partner.name, email: partner.email, vehicle: partner.vehicle })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = { getDashboard, getAllOrders, getAvailablePartners, assignPartner, updateOrderStatus, getAllUsers, getAllPartners, createPartner }
