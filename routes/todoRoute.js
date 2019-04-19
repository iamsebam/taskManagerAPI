const router = require('express').Router()

const Todo = require('../models/Todo')
const Task = require('../models/Task')
const Response = require('../models/Response')
const todosContentResolver = Todo.getContentResolver(require('../models/ContentResolver'))
const tasksContentResolver = Task.getContentResolver(require('../models/ContentResolver'))

const { validateCreateTodo, validateUpdateTodo, validateTaskId, validateTodoId } = require('../utils/validator')
const executeValidation = require('../utils/executeValidation')


router.post('/todos', validateCreateTodo, executeValidation, async (req, res, next) => {
  const { body, task_id } = req.body
  try {
    const task = await tasksContentResolver.getOne({ _id: task_id })
    if (task.data[0] && task.data[0].creator_id === req.user._id) {
      const todo = new Todo(body, task_id)
      const responseData = await todosContentResolver.insert(todo)
      return new Response(201, responseData, ['Todo successfully created.']).send(res)
    }
    return new Response(404, {}, ['Resource not found.']).send(res)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.get('/tasks/:task_id/todos', validateTaskId, executeValidation, async (req, res, next) => {
  const { task_id } = req.params
  try {
    const task = await tasksContentResolver.getOne({ _id: task_id })
    if (task.data[0] && task.data[0].creator_id === req.user._id) {
      const responseData = await todosContentResolver.getAll(task_id)
      return new Response(200, responseData, ['Todos successfully fetched.']).send(res)
    }
    return new Response(404, {}, ['Resource not found.']).send(res)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.get('/todos/:todo_id', validateTodoId, executeValidation, async (req, res, next) => {
  const { todo_id } = req.params
  try {
    const todo = await todosContentResolver.getOne({ _id: todo_id })

    if (todo.data[0] && todo.data[0].task_id) {
      const task = await tasksContentResolver.getOne({ _id: todo.data[0].task_id })

      if (task.data[0] && task.data[0].creator_id === req.user._id) {
        return new Response(200, todo, ['Todo successfully fetched']).send(res)
      }
    }
    return new Response(404, {}, ['Resource not found.']).send(res)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.patch('/todos/:todo_id', validateTodoId, validateUpdateTodo, executeValidation, async (req, res, next) => {
  const { todo_id } = req.params
  const values = req.body
  try {
    const todo = await todosContentResolver.getOne({ _id: todo_id })
    if (todo.data[0] && todo.data[0].task_id) {
      const task = await tasksContentResolver.getOne({ _id: todo.data[0].task_id })

      if (task && task.data[0] && task.data[0].creator_id === req.user._id) {
        const responseData = await todosContentResolver.update(todo_id, values)

        return new Response(200, responseData, ['Todo successfully updated.']).send(res)
      }
    }
    return new Response(404, {}, ['Resource not found.']).send(res)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.delete('/todos/:todo_id', validateTodoId, executeValidation, async (req, res, next) => {
  const { todo_id } = req.params
  try {
    const todo = await todosContentResolver.getOne({ _id: todo_id })
    if (todo.data[0] && todo.data[0].task_id) {
      const task = await tasksContentResolver.getOne({ _id: todo.data[0].task_id })

      if (task && task.data[0] && task.data[0].creator_id === req.user._id) {
        const responseData = await todosContentResolver.delete(todo_id)

        return new Response(200, responseData, ['Todo successfully deleted.']).send(res)
      }
    }
    return new Response(404, {}, ['Resource not found.']).send(res)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

module.exports = router