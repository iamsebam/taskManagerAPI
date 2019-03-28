const router = require('express').Router()

const User = require('../models/user')
const contentResolver = User.getContentResolver(require('../models/contentResolver'))
const formatResponseData = require('../utils/formatResponseData')

// TODO provide proper status codes for each request
// TODO provide proper messages for unsuccessful requests
// TODO login route and authentication with jwt

router.post('/user', async (req, res) => {
  const { username, password } = req.body

  try {
    let responseData
    let userExists = formatResponseData(await contentResolver.getOne({ username })).success

    if (!userExists) {

      const user = new User(username, password)

      responseData = await contentResolver.insert(user)

    } else {
      responseData = {
        message: "Username already exists"
      }
    }
    if (responseData) {
      res.json(formatResponseData(responseData))
    }
  } catch (err) {
    console.log(err)
  }
})

router.get('/user/:username', async (req, res) => {
  const { username } = req.params
  try {
    const responseData = await contentResolver.getOne({ username })
    if (responseData) {
      res.json(formatResponseData(responseData))
    }
  } catch (err) {
    console.log(err)
  }
})

module.exports = router