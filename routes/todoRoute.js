const router = require('express').Router()

const Todo = require('../models/todo')
const contentResolver = Todo.getContentResolver(require('../models/contentResolver'))
const formatResponseData = require('../utils/formatResponseData')

// TODO provide proper status codes for each request
// TODO provide proper messages for unsuccessful requests

router.post('/todo', async (req, res) => {
  const { body, task_id } = req.body

  try {
    let responseData
    if (body && task_id) {
      const todo = new Todo(body, task_id)
      responseData = await contentResolver.insert(todo)

    } else {
      responseData = {
        message: 'Cannot insert empty todo'
      }
    }
    if (responseData) {
      res.json(formatResponseData(responseData))
    }
  } catch (err) {
    console.log(err)
  }
})

router.get('/:task_id', async (req, res) => {
  const { task_id } = req.params
  try {
    const responseData = await contentResolver.getAll(task_id)
    if (responseData) {
      res.json(formatResponseData(responseData))
    }
  } catch (err) {
    console.log(err)
  }
})

router.get('/todo/:todo_id', async (req, res) => {
  const { todo_id } = req.params
  try {
    const responseData = await contentResolver.getOne({ _id: todo_id })
    if (responseData) {
      res.json(formatResponseData(responseData))
    }
  } catch (err) {
    console.log(err)
  }
})

router.patch('/todo/:todo_id', async (req, res) => {
  const { todo_id } = req.params
  const values = req.body
  try {
    const responseData = await contentResolver.update(todo_id, values)
    if (responseData) {
      res.json(formatResponseData(responseData))
    }
  } catch (err) {
    console.log(err)
  }
})

router.delete('/todo/:todo_id', async (req, res) => {
  const { todo_id } = req.params
  try {
    const responseData = await contentResolver.delete(todo_id)
    if (responseData) {
      res.json(formatResponseData(responseData))
    }
  } catch (err) {
    console.log(err)
  }
})

module.exports = router