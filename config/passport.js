const LocalStrategy = require('passport-local').Strategy
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

const bcrypt = require('bcryptjs')

const User = require('../models/User')
const contentResolver = User.getContentResolver(require('../models/ContentResolver'))

module.exports = (app, passport) => {

  passport.use('login', new LocalStrategy({}, async (username, password, done) => {
    try {
      const user = await contentResolver.getOne({ username })
      const userExists = user.recordsCount !== 0
      if (!userExists || !bcrypt.compareSync(password, user.data[0].password)) {
        return done(null, false)
      }
      return done(null, user)
    } catch (err) {
      done(err)
    }
  }))

  passport.use('jwt', new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET
  }, async (jwtPayload, done) => {
    try {
      const response = await contentResolver.getOne({ _id: jwtPayload._id })
      const userExists = response.recordsCount !== 0
      if (!userExists) {
        return done(null, false)
      }
      return done(null, {_id: response.data[0]._id})
    } catch (err) {
      return done(err, false)
    }
  }))

  app.use(passport.initialize())
}