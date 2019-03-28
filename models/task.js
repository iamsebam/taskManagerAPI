class Task {

  constructor(name, creatorId) {
    this.name = name
    this.creatorId = creatorId
    this.isCompleted = false
  }

}

Task.TABLE = {
  TABLE_NAME: 'Tasks',
  COLUMNS: {
    NAME: 'name',
    CREATOR_ID: 'creator_id',
    IS_COMPLETED: 'is_completed'
  }
}

Object.freeze(Task.TABLE)

Task.getContentResolver = contentResolver => {
  return new contentResolver(Task.TABLE)
}

module.exports = Task