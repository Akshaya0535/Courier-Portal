const twilio = require('twilio')

// Gracefully skip if keys not set
const client =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  !process.env.TWILIO_ACCOUNT_SID.includes('PASTE')
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null

const MESSAGES = {
  ORDER_PLACED: (trackingId) =>
    `Hi! Your DeliverEase order has been placed 📦\nTracking ID: *${trackingId}*\nWe'll notify you when a partner is assigned.`,

  PARTNER_ASSIGNED: (trackingId, partnerName, partnerPhone) =>
    `Great news! *${partnerName}* has been assigned to your order *${trackingId}* 🚴\nPartner contact: ${partnerPhone || 'N/A'}\nThey'll pick up your package soon!`,

  PICKED_UP: (trackingId) =>
    `Your package has been picked up! 📦\nOrder *${trackingId}* is now with our delivery partner and heading to the facility.`,

  IN_TRANSIT: (trackingId) =>
    `Your package is on the move! 🚚\nOrder *${trackingId}* is in transit. We'll notify you when it's out for delivery.`,

  DELIVERED: (trackingId) =>
    `Delivered! ✅\nYour order *${trackingId}* has been successfully delivered. Thank you for using DeliverEase!`,

  CANCELLED: (trackingId) =>
    `Your order *${trackingId}* has been cancelled. Contact support if this was a mistake.`,

  PAYMENT_SUCCESS: (trackingId, amount) =>
    `Payment confirmed ✅\nAmount: ₹${amount} received for order *${trackingId}*. Your delivery is now being processed.`,
}

const toIndianPhone = (phone) => {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`
  if (cleaned.length === 10) return `+91${cleaned}`
  return `+${cleaned}`
}

const sendSMS = async (phone, message) => {
  if (!client || !phone) return
  try {
    const to = toIndianPhone(phone)
    if (!to) return
    await client.messages.create({
      body: message.replace(/\*/g, ''),
      from: process.env.TWILIO_PHONE,
      to,
    })
    console.log(`✉️  SMS sent to ${to}`)
  } catch (e) {
    console.error('SMS error:', e.message)
  }
}

const sendWhatsApp = async (phone, message) => {
  if (!client || !phone) return
  try {
    const to = toIndianPhone(phone)
    if (!to) return
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      to: `whatsapp:${to}`,
    })
    console.log(`💬 WhatsApp sent to ${to}`)
  } catch (e) {
    console.error('WhatsApp error:', e.message)
  }
}

const notify = async (phone, messageKey, ...args) => {
  if (!client) {
    console.log(`[Notification skipped — Twilio not configured] ${messageKey}`)
    return
  }
  const message = MESSAGES[messageKey]?.(...args)
  if (!message || !phone) return
  await Promise.allSettled([sendSMS(phone, message), sendWhatsApp(phone, message)])
}

module.exports = { notify }
