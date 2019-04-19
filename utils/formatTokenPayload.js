module.exports = (user) => {
  return {
    username: user.data[0].username,
    _id: user.data[0]._id
  }
}