const mcache = require('memory-cache');

const cache = (duration) => {
  return (req, res, next) => {
    var key = '__express__' + req.originalUrl || req.url
    var cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}

module.exports = cache
