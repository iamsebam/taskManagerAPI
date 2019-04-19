const router = require('express').Router()

const Task = require('../models/Task')
const Response = require('../models/Response')
const contentResolver = Task.getContentResolver(require('../models/ContentResolver'))

const { validateCreateTask, validateUpdateTask, validateTaskId } = require('../utils/validator')
const executeValidation = require('../utils/executeValidation')


router.post('/tasks', validateCreateTask, executeValidation, async (req, res, next) => {
    const { name } = req.body
    const creator_id = req.user._id
    try {
      const task = new Task(name, creator_id)
      const result = await contentResolver.insert(task)

      return new Response(201, result, ['Task successfully created.']).send(res)
    } catch (err) {
      console.log(err)
      next(err)
    }
  }
)

router.get('/tasks', async (req, res, next) => {
  const creator_id = req.user._id
  try {
    const result = await contentResolver.getAll(creator_id)
    if (result.data[0] && result.data[0].creator_id === creator_id) {
      return new Response(200, result, ['Tasks successfully fetched.']).send(res)
    }
    return new Response(404, {}, ['Resource not found.']).send(res)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.get('/tasks/:task_id', validateTaskId, executeValidation, async (req, res, next) => {
  const { task_id } = req.params
  try {
    const result = await contentResolver.getOne({ _id: task_id })

    if (result.data[0] && result.data[0].creator_id === req.user._id) {
      return new Response(200, result, ['Task successfully fetched.']).send(res)
    }
    return new Response(404, {}, ['Resource not found.']).send(res)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.patch('/tasks/:task_id', validateTaskId, validateUpdateTask, executeValidation, async (req, res, next) => {
  const { task_id } = req.params
  const values = req.body
  try {
    const result = await contentResolver.getOne({ _id: task_id })
    if (result.data[0] && result.data[0].creator_id === req.user._id) {
      const responseData = await contentResolver.update(task_id, values)
      if (responseData.recordsCount !== 0) {
        return new Response(200, responseData, ['Task successfully updated.']).send(res)
      }
    }
    return new Response(404, {}, ['Resource not found.']).send(res)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.delete('/tasks/:task_id', validateTaskId, executeValidation, async (req, res, next) => {
  const { task_id } = req.params
  try {
    const result = await contentResolver.getOne({ _id: task_id })
    if (result.data[0] && result.data[0].creator_id === req.user._id) {
      const responseData = await contentResolver.delete(task_id)
      if (responseData.recordsCount !== 0) {
        return new Response(200, responseData, ['Task successfully deleted.']).send(res)
      }
    }
    return new Response(404, {}, ['Resource not found.']).send(res)

  } catch (err) {
    console.log(err)
    next(err)
  }
})

module.exports = router

