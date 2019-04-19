module.exports = (err, req, res, next) => {
  if (err) {
    console.log(err)
    return res.status(500).json({ message: "Oops! Something went wrong!" })
  }
}
