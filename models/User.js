const bcrypt = require('bcryptjs')

class User {

  constructor(username, password) {
    this.username = username
    this.password = bcrypt.hashSync(password, 10)
  }

}

User.TABLE = {
  TABLE_NAME: 'Users',
  COLUMNS: {
    USERNAME: 'username',
    PASSWORD: 'password'
  }
}

Object.freeze(User.TABLE)

User.getContentResolver = contentResolver => {
  return new contentResolver(User.TABLE)
}

module.exports = User