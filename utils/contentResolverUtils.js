module.exports = {
  formatUpdateArray: valuesObject => {
    return Object.values(valuesObject)
  },
  formatUpdateString: valuesObject => {
    return Object.keys(valuesObject)
      .map((value, index) => `${value} = $${index + 1}`)
      .join(', ')
  }
}