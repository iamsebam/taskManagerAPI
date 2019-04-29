const { Pool } = require('pg')

const USERS = require('../models/User').TABLE
const TASKS = require('../models/Task').TABLE
const TODOS = require('../models/Todo').TABLE
const INACTIVE_TOKENS = require('../models/InactiveToken').TABLE

const BASECOLUMNS = {
  _ID: '_id',
  CREATED_AT: 'created_at',
  LAST_MODIFIED: 'last_modified'
}

const createTablesString = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  
  CREATE TABLE IF NOT EXISTS ${USERS.TABLE_NAME}(
  ${BASECOLUMNS._ID} UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ${USERS.COLUMNS.USERNAME} VARCHAR(30) NOT NULL UNIQUE,
  ${USERS.COLUMNS.PASSWORD} VARCHAR NOT NULL,
  ${BASECOLUMNS.CREATED_AT} TIMESTAMP DEFAULT NOW(),
  ${BASECOLUMNS.LAST_MODIFIED} TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS ${TASKS.TABLE_NAME}(
  ${BASECOLUMNS._ID} UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ${TASKS.COLUMNS.NAME} VARCHAR NOT NULL,
  ${TASKS.COLUMNS.IS_COMPLETED} BOOLEAN,
  ${TASKS.COLUMNS.CREATOR_ID} UUID REFERENCES ${USERS.TABLE_NAME}(${BASECOLUMNS._ID}) ON DELETE CASCADE,
  ${BASECOLUMNS.CREATED_AT} TIMESTAMP DEFAULT NOW(),
  ${BASECOLUMNS.LAST_MODIFIED} TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS ${TODOS.TABLE_NAME}(
  ${BASECOLUMNS._ID} UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ${TODOS.COLUMNS.BODY} VARCHAR NOT NULL,
  ${TODOS.COLUMNS.IS_COMPLETED} BOOLEAN,
  ${TODOS.COLUMNS.TASK_ID} UUID REFERENCES ${TASKS.TABLE_NAME}(${BASECOLUMNS._ID}) ON DELETE CASCADE,
  ${BASECOLUMNS.CREATED_AT} TIMESTAMP DEFAULT NOW(),
  ${BASECOLUMNS.LAST_MODIFIED} TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS ${INACTIVE_TOKENS.TABLE_NAME}(
  ${BASECOLUMNS._ID} UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ${INACTIVE_TOKENS.COLUMNS.TOKEN} VARCHAR NOT NULL,
  ${BASECOLUMNS.CREATED_AT} TIMESTAMP DEFAULT NOW(),
  ${BASECOLUMNS.LAST_MODIFIED} TIMESTAMP
  );
  
  
  `
const createLastModifiedTrigger = `
  CREATE OR REPLACE FUNCTION last_modified_trigger_function()
  RETURNS TRIGGER AS $$
  BEGIN
  NEW.${BASECOLUMNS.LAST_MODIFIED} = NOW();
  RETURN NEW; 
  END;
  $$ language 'plpgsql';
  
  
  DROP TRIGGER IF EXISTS last_modified_trigger ON ${USERS.TABLE_NAME};
  CREATE TRIGGER last_modified_trigger
  BEFORE UPDATE OR INSERT ON ${USERS.TABLE_NAME}
  FOR EACH ROW 
  EXECUTE PROCEDURE last_modified_trigger_function();
  
  DROP TRIGGER IF EXISTS last_modified_trigger ON ${TASKS.TABLE_NAME};
  CREATE TRIGGER last_modified_trigger
  BEFORE UPDATE OR INSERT ON ${TASKS.TABLE_NAME}
  FOR EACH ROW 
  EXECUTE PROCEDURE last_modified_trigger_function();
  
  DROP TRIGGER IF EXISTS last_modified_trigger ON ${TODOS.TABLE_NAME};
  CREATE TRIGGER last_modified_trigger
  BEFORE UPDATE OR INSERT ON ${TODOS.TABLE_NAME} 
  FOR EACH ROW 
  EXECUTE PROCEDURE last_modified_trigger_function();
  
  DROP TRIGGER IF EXISTS last_modified_trigger ON ${INACTIVE_TOKENS.TABLE_NAME};
  CREATE TRIGGER last_modified_trigger
  BEFORE UPDATE OR INSERT ON ${INACTIVE_TOKENS.TABLE_NAME} 
  FOR EACH ROW 
  EXECUTE PROCEDURE last_modified_trigger_function();
  `

const createCleanExpiredTokensTrigger = `

  CREATE OR REPLACE FUNCTION clean_expired_tokens()
  RETURNS TRIGGER AS $$
  BEGIN
  DELETE FROM ${INACTIVE_TOKENS.TABLE_NAME} WHERE ${BASECOLUMNS.CREATED_AT} < NOW() - INTERVAL '32 days';
  RETURN NEW;
  END;
  $$ language 'plpgsql';

  DROP TRIGGER IF EXISTS clean_expired_tokens_trigger ON ${INACTIVE_TOKENS.TABLE_NAME};
  CREATE TRIGGER clean_expired_tokens_trigger
  BEFORE INSERT ON ${INACTIVE_TOKENS.TABLE_NAME}
  FOR EACH ROW
  EXECUTE PROCEDURE clean_expired_tokens();

`
const createTodoSummaryViewString = `
  CREATE OR REPLACE VIEW TodoSummary AS
  SELECT ${USERS.TABLE_NAME}.${USERS.COLUMNS.USERNAME} AS Username,
  ${TASKS.TABLE_NAME}.${TASKS.COLUMNS.NAME} AS Task,
  ${TODOS.TABLE_NAME}.${TODOS.COLUMNS.BODY} AS Todo,
  ${TODOS.TABLE_NAME}.${TODOS.COLUMNS.IS_COMPLETED} AS todo_is_completed FROM ${TODOS.TABLE_NAME} 
  JOIN ${TASKS.TABLE_NAME} ON ${TODOS.TABLE_NAME}.${TODOS.COLUMNS.TASK_ID} = ${TASKS.TABLE_NAME}.${BASECOLUMNS._ID}
  JOIN ${USERS.TABLE_NAME} ON ${TASKS.TABLE_NAME}.${TASKS.COLUMNS.CREATOR_ID} = ${USERS.TABLE_NAME}.${BASECOLUMNS._ID}
  ORDER BY ${USERS.TABLE_NAME}.${USERS.COLUMNS.USERNAME}, ${TASKS.TABLE_NAME}.${TASKS.COLUMNS.NAME}, ${TODOS.TABLE_NAME}.${TODOS.COLUMNS.BODY}; 
`
const createTaskSummaryViewString = `
  CREATE OR REPLACE VIEW TaskSummary AS
  SELECT ${USERS.TABLE_NAME}.${USERS.COLUMNS.USERNAME} AS Username,
  ${TASKS.TABLE_NAME}.${TASKS.COLUMNS.NAME} AS Task,
  ${TASKS.TABLE_NAME}.${TASKS.COLUMNS.IS_COMPLETED} AS Is_Completed FROM ${TASKS.TABLE_NAME}
  JOIN ${USERS.TABLE_NAME} ON ${TASKS.TABLE_NAME}.${TASKS.COLUMNS.CREATOR_ID} = ${USERS.TABLE_NAME}.${BASECOLUMNS._ID}
  ORDER BY ${USERS.TABLE_NAME}.${USERS.COLUMNS.USERNAME}, ${TASKS.TABLE_NAME}.${TASKS.COLUMNS.NAME};
`
const dropEverything = `
  DROP VIEW TodoSummary, TaskSummary;
  DROP TRIGGER IF EXISTS last_modified_trigger ON ${USERS.TABLE_NAME};
  DROP TRIGGER IF EXISTS last_modified_trigger ON ${TASKS.TABLE_NAME};
  DROP TRIGGER IF EXISTS last_modified_trigger ON ${TODOS.TABLE_NAME};
  DROP TRIGGER IF EXISTS last_modified_trigger ON ${INACTIVE_TOKENS.TABLE_NAME};
  DROP TRIGGER IF EXISTS clean_expired_tokens_trigger ON ${INACTIVE_TOKENS.TABLE_NAME};
  DROP TABLE ${USERS.TABLE_NAME}, ${TASKS.TABLE_NAME}, ${TODOS.TABLE_NAME}, ${INACTIVE_TOKENS.TABLE_NAME};
`

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

module.exports = {
  /**
   *
   * @param queryString
   * @param valuesArray
   * @returns {Promise<*>}
   */
  query: (queryString, valuesArray) => {
    try {
      return pool.query(queryString, valuesArray)
    } catch (err) {
      console.error(err)
    }
  },
  /**
   * Called once, to create tables
   * @returns {Promise<void>}
   */
  init: async (forceClear) => {
    try {
      
      if (forceClear) {
        await pool.query(dropEverything)
      }
      await pool.query(createTablesString)
      await pool.query(createLastModifiedTrigger)
      await pool.query(createCleanExpiredTokensTrigger)
      await pool.query(createTaskSummaryViewString)
      await pool.query(createTodoSummaryViewString)
      console.log('Database initialized...')
    } catch (err) {
      console.error(err)
    }
  },
  BASECOLUMNS,
  USERS,
  TASKS,
  TODOS,
  INACTIVE_TOKENS
}