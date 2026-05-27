const router = require('express').Router()
const auth = require('../middleware/auth')
const { getAvailableJobs, getMyJobs, acceptJob, updateOrderStatus, getEarnings, getProfile } = require('../controllers/partnerController')

router.get('/jobs/available', auth(['partner']), getAvailableJobs)
router.get('/jobs/mine', auth(['partner']), getMyJobs)
router.post('/jobs/:orderId/accept', auth(['partner']), acceptJob)
router.patch('/orders/:orderId/status', auth(['partner']), updateOrderStatus)
router.get('/earnings', auth(['partner']), getEarnings)
router.get('/profile', auth(['partner']), getProfile)

module.exports = router
