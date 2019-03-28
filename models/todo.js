class Todo{

  constructor(body, taskId) {
    this.body = body
    this.taskId = taskId
    this.isCompleted = false
  }

}

Todo.TABLE = {
  TABLE_NAME: 'Todos',
  COLUMNS: {
    BODY: 'body',
    TASK_ID: 'task_id',
    IS_COMPLETED: 'is_completed'
  }
}

Object.freeze(Todo.TABLE)

Todo.getContentResolver = contentResolver => {
  return new contentResolver(Todo.TABLE)
}

module.exports = Todo