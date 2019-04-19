const { body, param } = require('express-validator/check')

module.exports = {
  validateCreateUser: [
    body('username')
      .not().isEmpty().withMessage('Username field is required.')
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.')
      .isLength({ max: 30 }).withMessage('Username must be shorter than 30 characters.')
      .isAlphanumeric().withMessage('Username must contain of only letters and numbers.'),
    body('password')
      .not().isEmpty().withMessage('Password field is required.')
      .isLength({ min: 4 }).withMessage('Password must be at least 4 characters long.')
  ],
  validateTaskId: [
    param('task_id')
      .isUUID().withMessage('Incorrect id type.')
  ],
  validateTodoId: [
    param('todo_id')
      .isUUID().withMessage('Incorrect id type')
  ],
  validateCreateTask: [
    body('name')
      .not().isEmpty().withMessage('Task name cannot be empty.')
      .isLength({ max: 255 }).withMessage('Task name too long.')
  ],
  validateCreateTodo: [
    body('body')
      .not().isEmpty().withMessage('Todo body cannot be empty.')
      .isLength({ max: 255 }).withMessage('Todo body too long.'),
    body('task_id')
      .not().isEmpty().withMessage('Todo must be assigned to a task.')
      .isUUID()
  ],
  validateUpdateTask: [
    body('name')
      .not().isEmpty().withMessage('Task name cannot be empty.')
      .isLength({max: 255}).withMessage('Task name too long.'),
    body('is_completed')
      .isBoolean().withMessage('Value must be a boolean.')
  ],
  validateUpdateTodo: [
    body('body')
      .not().isEmpty().withMessage('Todo body cannot be empty.')
      .isLength({ max: 255 }).withMessage('Todo body too long.'),
    body('is_completed')
      .isBoolean().withMessage('Value must be a boolean.')
  ]
}