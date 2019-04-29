class InactiveToken {
  constructor(token) {
    this.token = token
  }
}

InactiveToken.TABLE = {
  TABLE_NAME: 'InactiveTokens',
  COLUMNS: {
    TOKEN: 'token'
  }
}

Object.freeze(InactiveToken.TABLE)

InactiveToken.getContentResolver = contentResolver => {
  return new contentResolver(InactiveToken.TABLE)
}

module.exports = InactiveToken