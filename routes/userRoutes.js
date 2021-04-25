const express = require('express')

const userController = require('./../controllers/userController')

const securityController = require('./../controllers/securityController')

const { route } = require('./tourRoutes')

const router = express.Router()

router.post('/signup', securityController.signUp)
router.post('/login', securityController.login)
router.get('/logout', securityController.logout)

router.post('/forgotPassword', securityController.forgotPassword)
router.patch('/resetPassword/:token', securityController.resetPassword)

//Protect all routes
router.use(securityController.protect)

router.patch('/updateMyPassword/', securityController.updatePassword)
router.get('/me', userController.getMe, userController.getUser)
router.patch('/updateMe', userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)

//Restrict actions only to admins
router.use(securityController.RestrictTo('admin'))

router.route('/').get(userController.getAllUsers).post(userController.createUser)

router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser)

module.exports = router
