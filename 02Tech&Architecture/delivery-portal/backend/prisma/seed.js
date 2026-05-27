require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const hash = (pw) => bcrypt.hash(pw, 10)

async function main() {
  console.log('🌱 Seeding database...')

  // Admin
  await prisma.admin.upsert({
    where: { email: 'admin@delivery.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@delivery.com', password: await hash('admin123') }
  })

  // Customers
  const c1 = await prisma.user.upsert({
    where: { email: 'rahul@gmail.com' },
    update: {},
    create: { name: 'Rahul Sharma', email: 'rahul@gmail.com', password: await hash('password123'), phone: '9876543210' }
  })

  const c2 = await prisma.user.upsert({
    where: { email: 'priya@gmail.com' },
    update: {},
    create: { name: 'Priya Patel', email: 'priya@gmail.com', password: await hash('password123'), phone: '9812345678' }
  })

  const c3 = await prisma.user.upsert({
    where: { email: 'arjun@gmail.com' },
    update: {},
    create: { name: 'Arjun Mehta', email: 'arjun@gmail.com', password: await hash('password123'), phone: '9898989898' }
  })

  // Delivery Partners
  const p1 = await prisma.deliveryPartner.upsert({
    where: { email: 'raju@partner.com' },
    update: {},
    create: { name: 'Raju Kumar', email: 'raju@partner.com', password: await hash('partner123'), phone: '9001234567', vehicle: 'Bike', totalEarned: 4200, rating: 4.8 }
  })

  const p2 = await prisma.deliveryPartner.upsert({
    where: { email: 'suresh@partner.com' },
    update: {},
    create: { name: 'Suresh Singh', email: 'suresh@partner.com', password: await hash('partner123'), phone: '9007654321', vehicle: 'Van', totalEarned: 7800, rating: 4.6 }
  })

  const p3 = await prisma.deliveryPartner.upsert({
    where: { email: 'mohan@partner.com' },
    update: {},
    create: { name: 'Mohan Das', email: 'mohan@partner.com', password: await hash('partner123'), phone: '9009998888', vehicle: 'Scooter', totalEarned: 1500, rating: 4.9, isAvailable: true }
  })

  // Order 1 — In Transit
  const o1 = await prisma.order.create({
    data: {
      trackingId: 'TRKABC001',
      customerId: c1.id,
      partnerId: p1.id,
      pickupAddress: '14 MG Road, Bengaluru, Karnataka',
      dropAddress: '7 Connaught Place, New Delhi',
      packageType: 'MEDIUM',
      weight: 2.5,
      price: 124,
      status: 'IN_TRANSIT',
      statusHistory: {
        create: [
          { status: 'PENDING', message: 'Order placed successfully' },
          { status: 'ASSIGNED', message: 'Delivery partner assigned' },
          { status: 'PICKED_UP', message: 'Package picked up from customer' },
          { status: 'IN_TRANSIT', message: 'Package is on the way' }
        ]
      }
    }
  })

  // Order 2 — Pending (unassigned)
  await prisma.order.create({
    data: {
      trackingId: 'TRKDEF002',
      customerId: c2.id,
      pickupAddress: '22 FC Road, Pune, Maharashtra',
      dropAddress: '88 Anna Salai, Chennai, Tamil Nadu',
      packageType: 'SMALL',
      weight: 1.0,
      price: 89,
      status: 'PENDING',
      notes: 'Handle with care — fragile electronics inside',
      statusHistory: { create: [{ status: 'PENDING', message: 'Order placed successfully' }] }
    }
  })

  // Order 3 — Delivered
  const o3 = await prisma.order.create({
    data: {
      trackingId: 'TRKGHI003',
      customerId: c1.id,
      partnerId: p2.id,
      pickupAddress: '5 Baner Road, Pune, Maharashtra',
      dropAddress: '12 Jubilee Hills, Hyderabad, Telangana',
      packageType: 'LARGE',
      weight: 5.0,
      price: 199,
      status: 'DELIVERED',
      statusHistory: {
        create: [
          { status: 'PENDING', message: 'Order placed' },
          { status: 'ASSIGNED', message: 'Partner assigned' },
          { status: 'PICKED_UP', message: 'Picked up' },
          { status: 'IN_TRANSIT', message: 'In transit' },
          { status: 'DELIVERED', message: 'Delivered successfully' }
        ]
      }
    }
  })

  await prisma.earning.create({
    data: { partnerId: p2.id, orderId: o3.id, amount: parseFloat((199 * 0.7).toFixed(2)) }
  })

  // Order 4 — Assigned
  await prisma.order.create({
    data: {
      trackingId: 'TRKJKL004',
      customerId: c3.id,
      partnerId: p3.id,
      pickupAddress: '101 Park Street, Kolkata, West Bengal',
      dropAddress: '9 Relief Road, Ahmedabad, Gujarat',
      packageType: 'DOCUMENT',
      weight: 0.5,
      price: 54,
      status: 'ASSIGNED',
      statusHistory: {
        create: [
          { status: 'PENDING', message: 'Order placed' },
          { status: 'ASSIGNED', message: 'Partner assigned and heading to pickup' }
        ]
      }
    }
  })

  // Order 5 — Pending
  await prisma.order.create({
    data: {
      trackingId: 'TRKMNO005',
      customerId: c2.id,
      pickupAddress: '45 Lajpat Nagar, New Delhi',
      dropAddress: '78 Salt Lake, Kolkata, West Bengal',
      packageType: 'FRAGILE',
      weight: 3.0,
      price: 229,
      notes: 'Glassware — very fragile',
      status: 'PENDING',
      statusHistory: { create: [{ status: 'PENDING', message: 'Order placed successfully' }] }
    }
  })

  console.log('\n✅ Seed complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('TEST ACCOUNTS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('ADMIN     admin@delivery.com   / admin123')
  console.log('CUSTOMER  rahul@gmail.com      / password123')
  console.log('CUSTOMER  priya@gmail.com      / password123')
  console.log('CUSTOMER  arjun@gmail.com      / password123')
  console.log('PARTNER   raju@partner.com     / partner123')
  console.log('PARTNER   suresh@partner.com   / partner123')
  console.log('PARTNER   mohan@partner.com    / partner123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
