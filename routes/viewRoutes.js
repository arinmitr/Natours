const express = require('express')

const router = express.Router()

const viewsController = require('../controllers/viewController')
const securityController = require('../controllers/securityController')

router.get('/', securityController.isLoggedIn, viewsController.getOverview)

router.get('/tour/:slug', securityController.isLoggedIn, viewsController.getTour)

router.get('/login', securityController.isLoggedIn, viewsController.getLoginForm)

router.get('/me', securityController.protect, viewsController.getAccount)

module.exports = router
