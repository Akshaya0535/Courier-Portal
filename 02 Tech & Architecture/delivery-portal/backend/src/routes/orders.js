const router = require('express').Router()
const auth = require('../middleware/auth')
const { createOrder, getMyOrders, getOrderById, trackOrder, getPriceEstimate } = require('../controllers/orderController')

router.get('/estimate', getPriceEstimate)
router.get('/track/:trackingId', trackOrder)
router.post('/', auth(['customer']), createOrder)
router.get('/my', auth(['customer']), getMyOrders)
router.get('/:id', auth(), getOrderById)

module.exports = router
