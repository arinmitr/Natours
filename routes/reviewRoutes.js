const express = require('express')

const reviewController = require('./../controllers/reviewController')

const securityController = require('./../controllers/securityController')

const router = express.Router({ mergeParams: true })

router.use(securityController.protect)
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(securityController.RestrictTo('user'), reviewController.setTourUserIds, reviewController.createReview)

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(securityController.RestrictTo('user', 'admin'), reviewController.deleteReview)
  .patch(securityController.RestrictTo('user', 'admin'), reviewController.updateReview)

module.exports = router
