const RateLimit = require("express-rate-limit");
const {MemoryStore} = require("express-rate-limit");
const SlowDown = require("express-slow-down");

function Limiter() {
  return RateLimit({
    max: 10,
    windowMs: 15 * 60 * 1000,
    legacyHeaders: false,
    store: new MemoryStore(),
    skip: (request, response) => false,
    message: {
      status: false,
      message: "Too Many requests, try again 15 minutes",
      data: null,
    }
  });
}

function SpeedLimiter() {
  return new SlowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 3,
    delayMs: 500,
    maxDelayMs: 20000,
  });
}

module.exports = {Limiter, SpeedLimiter};
