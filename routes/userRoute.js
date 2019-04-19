const router = require('express').Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const Response = require('../models/Response')
const contentResolver = User.getContentResolver(require('../models/ContentResolver'))
const formatTokenPayload = require('../utils/formatTokenPayload')
const { validateCreateUser } = require('../utils/validator')
const executeValidation = require('../utils/executeValidation')


router.post('/users', validateCreateUser, executeValidation, async (req, res, next) => {
  const { username, password } = req.body

  try {
    let responseData

    let user = await contentResolver.getOne({ username })
    let userExists = user.recordsCount !== 0
    if (!userExists) {
      user = new User(username, password)

      responseData = await contentResolver.insert(user)
      return new Response(201, responseData, ['User successfully created.']).send(res)
    }
    return new Response(400, {}, ['Username already taken.']).send(res)

  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.post('/login', (req, res, next) => {
  login(req, res, next)
})

// TODO logout route

function login(req, res, next) {
  return passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return new Response(400, {}, ['Wrong username/password.']).send(res)
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        return next(err)
      }
      const token = jwt.sign(formatTokenPayload(user), process.env.SECRET)

      return new Response(200, {}, ['Logged in successfully']).setToken(token).send(res)
    })
  })(req, res, next)
}

module.exports = router

