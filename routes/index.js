const userRoute = require('./userRoute')
const taskRoute = require('./taskRoute')
const todoRoute = require('./todoRoute')

module.exports = (app) => {
  app.use('/users', userRoute)
  app.use('/tasks', taskRoute)
  app.use('/todos', todoRoute)
}
