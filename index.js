const con = require('./database.js')
const config = require("./config.json")

const register = require("./scripts/register.js")
const search = require("./scripts/search.js")
const score = require("./scripts/score.js")
const points = require("./scripts/points.js")

// setInterval(() => {
//   register.new_registrations()
// }, 1000 * 60) //every minute

// setInterval(() => {
  search.start()
// }, 1000 * 60 * 60 * 6) //every 6 hours

// setInterval(() => {
//   score.calculate()
// }, 1000 * 60 * 60 * 24) //every 1 day

// setInterval(() => {
//   points.give()
// }, 1000 * 60 * 60 * 24) //every 30 minutes
