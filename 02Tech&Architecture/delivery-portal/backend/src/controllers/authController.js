const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

const register = async (req, res) => {
  const { name, email, password, phone, role, vehicle } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' })
  }

  try {
    if (role === 'partner') {
      const exists = await prisma.deliveryPartner.findUnique({ where: { email } })
      if (exists) return res.status(400).json({ error: 'Email already registered' })

      const hashed = await bcrypt.hash(password, 10)
      const partner = await prisma.deliveryPartner.create({
        data: { name, email, password: hashed, phone: phone || '', vehicle: vehicle || 'Bike' }
      })

      const token = generateToken({ id: partner.id, email: partner.email, role: 'partner', name: partner.name })
      return res.json({
        token,
        user: { id: partner.id, name: partner.name, email: partner.email, role: 'partner' }
      })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(400).json({ error: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone: phone || '' }
    })

    const token = generateToken({ id: user.id, email: user.email, role: 'customer', name: user.name })
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: 'customer' }
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const login = async (req, res) => {
  const { email, password, role } = req.body

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password and role are required' })
  }

  try {
    if (role === 'admin') {
      const admin = await prisma.admin.findUnique({ where: { email } })
      if (!admin) return res.status(400).json({ error: 'Invalid credentials' })

      const valid = await bcrypt.compare(password, admin.password)
      if (!valid) return res.status(400).json({ error: 'Invalid credentials' })

      const token = generateToken({ id: admin.id, email: admin.email, role: 'admin', name: admin.name })
      return res.json({
        token,
        user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' }
      })
    }

    if (role === 'partner') {
      const partner = await prisma.deliveryPartner.findUnique({ where: { email } })
      if (!partner) return res.status(400).json({ error: 'Invalid credentials' })

      const valid = await bcrypt.compare(password, partner.password)
      if (!valid) return res.status(400).json({ error: 'Invalid credentials' })

      const token = generateToken({ id: partner.id, email: partner.email, role: 'partner', name: partner.name })
      return res.json({
        token,
        user: { id: partner.id, name: partner.name, email: partner.email, role: 'partner' }
      })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' })

    const token = generateToken({ id: user.id, email: user.email, role: 'customer', name: user.name })
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: 'customer' }
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const me = async (req, res) => {
  try {
    const { id, role } = req.user

    if (role === 'admin') {
      const admin = await prisma.admin.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, createdAt: true }
      })
      return res.json({ ...admin, role: 'admin' })
    }

    if (role === 'partner') {
      const partner = await prisma.deliveryPartner.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, phone: true, vehicle: true, isAvailable: true, rating: true, totalEarned: true, createdAt: true }
      })
      return res.json({ ...partner, role: 'partner' })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, createdAt: true }
    })
    return res.json({ ...user, role: 'customer' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = { register, login, me }
