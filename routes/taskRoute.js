const router = require('express').Router()

const Task = require('../models/task')
const contentResolver = Task.getContentResolver(require('../models/contentResolver'))
const formatResponseData = require('../utils/formatResponseData')

// TODO provide proper status codes for each request
// TODO provide proper messages for unsuccessful requests

router.post('/task', async (req, res) => {
  const { name, creator_id } = req.body

  try {
    let responseData
    if (name && creator_id) {
      const task = new Task(name, creator_id)
      responseData = await contentResolver.insert(task)
    } else {
      responseData = {
        message: 'Cannot insert empty Task'
      }
    }
    if (responseData) {
      res.json(formatResponseData(responseData))
    }
  } catch (err) {
    console.log(err)
  }
})

router.get('/:creator_id', async (req, res) => {
  const { creator_id } = req.params
  try {
    const responseData = await contentResolver.getAll(creator_id)
    if (responseData) {
      res.json(formatResponseData(responseData))
    }
  } catch (err) {
    console.log(err)
  }
})

router.get('/task/:task_id', async (req, res) => {
  const { task_id } = req.params
  try {
    const responseData = await contentResolver.getOne({ _id: task_id })
    if (responseData) {
      res.json(formatResponseData(responseData))
    }
  } catch (err) {
    console.log(err)
  }

})

router.patch('/task/:task_id', async (req, res) => {
  const { task_id } = req.params
  const values = req.body
  try {
    const responseData = await contentResolver.update(task_id, values)
    if (responseData) {
      res.json(formatResponseData(responseData))
    }
  } catch (err) {
    console.log(err)
  }
})

router.delete('/task/:task_id', async (req, res) => {
  const { task_id } = req.params
  try {
    const responseData = await contentResolver.delete(task_id)
    if (responseData) {
      res.json(formatResponseData(responseData))
    }
  } catch (err) {
    console.log(err)
  }
})

module.exports = router

