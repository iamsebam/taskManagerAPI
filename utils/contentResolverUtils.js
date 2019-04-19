module.exports = {
  formatUpdateArray: valuesObject => {
    return Object.values(valuesObject)
  },
  formatUpdateParamsString: valuesObject => {
    return Object.keys(valuesObject)
      .map((value, index) => `${value} = $${index + 1}`)
      .join(', ')
  }
}