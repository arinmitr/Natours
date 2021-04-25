const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if (!doc) {
      return next(new AppError(404, 'No document found with that Id'))
    }
    res.status(204).json({
      status: 'Success',
      data: null,
    })
  })

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)

    res.status(201).json({
      status: 'success',
      data: {
        document: doc,
      },
    })
  })

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!doc) {
      return next(new AppError(404, 'No document found with that Id'))
    }
    res.status(200).json({
      status: 'Success',
      data: {
        doc,
      },
    })
  })

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOptions) query.populate(popOptions)
    const doc = await query

    if (!doc) {
      return next(new AppError(404, 'No tour found with that ID'))
    }
    res.status(200).json({
      status: 'success',
      data: {
        document: doc,
      },
    })
  })

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To al nested reviews for tour
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate()
    const doc = await features.query //.explain()

    //SEND RESPONSE
    res.status(200).json({
      requestedAt: req.requestTime,
      status: 'success',
      results: doc.length,
      data: {
        document: doc,
      },
    })
  })
