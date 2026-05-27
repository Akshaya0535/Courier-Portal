const router = require('express').Router()
const auth = require('../middleware/auth')
const { getDashboard, getAllOrders, getAvailablePartners, assignPartner, updateOrderStatus, getAllUsers, getAllPartners, createPartner } = require('../controllers/adminController')

router.get('/dashboard', auth(['admin']), getDashboard)
router.get('/orders', auth(['admin']), getAllOrders)
router.get('/partners/available', auth(['admin']), getAvailablePartners)
router.patch('/orders/:orderId/assign', auth(['admin']), assignPartner)
router.patch('/orders/:orderId/status', auth(['admin']), updateOrderStatus)
router.get('/users', auth(['admin']), getAllUsers)
router.get('/partners', auth(['admin']), getAllPartners)
router.post('/partners', auth(['admin']), createPartner)

module.exports = router
