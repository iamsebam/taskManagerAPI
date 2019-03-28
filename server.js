require('dotenv').config()

const express = require('express')

const database = require('./database')
const mountRoutes = require('./routes')

database.init(false)

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

mountRoutes(app)

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`)
})