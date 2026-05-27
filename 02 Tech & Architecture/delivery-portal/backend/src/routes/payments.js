const router = require('express').Router()
const auth = require('../middleware/auth')
const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController')

router.post('/create-order', auth(['customer']), createPaymentOrder)
router.post('/verify', auth(['customer']), verifyPayment)

module.exports = router
