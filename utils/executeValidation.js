const { validationResult } = require('express-validator/check')
const Response = require('../models/Response')

module.exports = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return new Response(400, {}, errors.array().map(err => err.msg)).send(res)
  }
  next()
}