require('dotenv').config()

const express = require('express'),
  passport = require('passport'),

  database = require('./database'),
  mountRoutes = require('./routes'),
  initializePassport = require('./config/passport')

database.init(false)

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

initializePassport(app, passport)
mountRoutes(app)

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`)
})