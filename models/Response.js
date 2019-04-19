/**
 * Creates an instance of Response object
 *
 * @param status Status code for response
 * @param data Data to return or empty obj
 * @param messages Array of messages for the client
 */
class Response {
  constructor(status, data, messages) {
    this.status = status
    this.result = {
      ...data,
      messages
    }
  }

  /**
   * Sends the formatted response
   * @param res Response object
   */
  send(res) {
    res.status(this.status).json(this.result)
  }

  /**
   * Sets the token for the login response
   * @param token
   */
  setToken(token) {
    this.result = {
      ...this.result,
      token
    }
    return this
  }
}

module.exports = Response