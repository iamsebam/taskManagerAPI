module.exports = data => {
  return {
    operation: data.command,
    recordsCount: data.rowCount || 0,
    data: data.rows || [],
  }
}