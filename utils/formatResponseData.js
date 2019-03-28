module.exports = data => {
  let responseBody = {
    operation: data.command
  }
  if (data.rowCount >= 1) {
    responseBody = {
      ...responseBody,
      success: true,
      data: data.rows
    }
  } else {
    responseBody = {
      ...responseBody,
      success: false,
      message: data.message,
      data: []
    }
  }
  return responseBody
}