/* eslint-disable import/no-useless-path-segments */
const express = require('express')

const tourController = require('./../controllers/tourController')

const securityController = require('./../controllers/securityController')

// const reviewController = require('./../controllers/reviewController')

const reviewRouter = require('./../routes/reviewRoutes')

const router = express.Router()

//router.param('id', tourController.checkId)

router.use('/:tourId/reviews', reviewRouter)

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats)

router
  .route('/monthly-plan/:year')
  .get(
    securityController.protect,
    securityController.RestrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  )

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

router
  .route('/')
  .get(tourController.getAllTours)
  .post(securityController.protect, securityController.RestrictTo('admin', 'lead-guide'), tourController.createTour)

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(securityController.protect, securityController.RestrictTo('admin', 'lead-guide'), tourController.updateTour)
  .delete(securityController.protect, securityController.RestrictTo('admin', 'lead-guide'), tourController.deleteTour)

// router
//   .route('/:tourId/reviews')
//   .post(securityController.protect, securityController.RestrictTo('user'), reviewController.createReview)

module.exports = router
