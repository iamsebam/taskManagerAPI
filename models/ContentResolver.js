const database = require('../database'),
  utils = require('../utils/contentResolverUtils'),
  formatResult = require('../utils/formatResponseData')

/**
 * Responsible for querying the database
 */
class ContentResolver {
  constructor(table) {
    this.TABLE = table
  }

  /**
   * Performs an Insert query on the database
   * @param item Object to insert
   * @returns a data row of inserted record
   */
  insert(item) {
    const valuesArray = Object.values(item)
    let paramsString = valuesArray.map((value, index) => `$${index + 1}`).join(', ')
    let columnsString = Object.values(this.TABLE.COLUMNS).join(', ')
    const queryString = `
      INSERT INTO ${this.TABLE.TABLE_NAME}(${columnsString}) 
      VALUES(${paramsString})
      RETURNING *;
    `
    return sendRequest(queryString, valuesArray)

  }

  /**
   * Performs a select query on record with given object parameter
   * @param item an object specifying condition eg. { _id: your_item_id }
   * @returns {*|Promise<*>} one object fulfilling the condition
   */
  getOne(item) {
    const itemParameterName = Object.keys(item)[0]
    let whereString
    switch (itemParameterName) {
      case database.BASECOLUMNS._ID:
        whereString = database.BASECOLUMNS._ID
        break
      case database.USERS.COLUMNS.USERNAME:
        whereString = database.USERS.COLUMNS.USERNAME
        break
      case database.INACTIVE_TOKENS.COLUMNS.TOKEN:
        whereString = database.INACTIVE_TOKENS.COLUMNS.TOKEN
        break
      default:
        return {
          command: 'SELECT',
          rowCount: 0,
          message: 'Invalid parameter name',
          rows: []
        }
    }
    const queryString = `
      SELECT * FROM ${this.TABLE.TABLE_NAME}
      WHERE ${whereString} = $1;
    `
    const valuesArray = Object.values(item)

    return sendRequest(queryString, valuesArray)

  }

  /**
   * Performs a select query on records with the given id
   * @param id creatorId or TaskId of records to return
   * @returns {*|Promise<*>} all records fulfilling the condition
   */
  getAll(id) {
    let whereString
    switch (this.TABLE.TABLE_NAME) {
      case database.TASKS.TABLE_NAME:
        whereString = `${this.TABLE.COLUMNS.CREATOR_ID}`
        break
      case database.TODOS.TABLE_NAME:
        whereString = `${this.TABLE.COLUMNS.TASK_ID}`
        break
      default:
        return {
          command: 'SELECT',
          rowCount: 0,
          message: 'Invalid table',
          rows: []
        }
    }
    let queryString = `
      SELECT * FROM ${this.TABLE.TABLE_NAME}
      WHERE ${whereString} = $1;
      `
    const valuesArray = [id]
    return sendRequest(queryString, valuesArray)

  }

  /**
   * Performs an update query on a record with given id, with specified values
   * @param id id of the record to update
   * @param values key-value pairs of data to update
   * @returns {*|Promise<*>} a data row of updated record
   */
  update(id, values) {
    const valuesArray = utils.formatUpdateArray(values)
    valuesArray.push(id)
    const updateParamsString = utils.formatUpdateParamsString(values)
    const paramsString = `$${valuesArray.length}`

    const queryString = `
      UPDATE ${this.TABLE.TABLE_NAME}
      SET ${updateParamsString}
      WHERE ${database.BASECOLUMNS._ID} = ${paramsString}
      RETURNING *;
    `
    return sendRequest(queryString, valuesArray)
  }

  /**
   * Performs a delete query on a record with specified id
   * @param id id of the record to delete
   * @returns {*|Promise<*>} a data row of deleted record
   */
  delete(id) {
    const queryString = `
      DELETE FROM ${this.TABLE.TABLE_NAME}
      WHERE ${database.BASECOLUMNS._ID} = $1
      RETURNING *;
    `
    const valuesArray = [id]
    return sendRequest(queryString, valuesArray)
  }

}

async function sendRequest(queryString, valuesArray) {
  try {
    const result = await database.query(queryString, valuesArray)
    if (result !== null) {
      return formatResult(result)
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = ContentResolver