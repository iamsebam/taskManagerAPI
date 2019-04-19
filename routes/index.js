const passport = require('passport')

const userRoute = require('./userRoute'),
  taskRoute = require('./taskRoute'),
  todoRoute = require('./todoRoute'),
  errorHandler = require('../utils/errorHandler')

module.exports = (app) => {
  app.use('/api', userRoute)
  app.use('/api', passport.authenticate('jwt', { session: false }), taskRoute)
  app.use('/api', passport.authenticate('jwt', { session: false }), todoRoute)
  app.use(errorHandler)
}
