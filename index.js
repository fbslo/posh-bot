const con = require('./database.js')
const config = require("./config.json")

const register = require("./scripts/register.js")
const search = require("./scripts/search.js")
const score = require("./scripts/score.js")
const tokens = require("./scripts/tokens.js")
const daily = require("./scripts/daily_post.js")

// setInterval(() => {
//   register.new_registrations()
// }, 1000 * 60) //every minute
//
// setInterval(() => {
//  search.start()
// }, 1000 * 60 * 60 * 6) //every 6 hours
//
// setInterval(() => {
//   score.calculate()
// }, 1000 * 60 * 60 * 24) //every 1 day
//
// setInterval(() => {
//   tokens.give()
// }, 1000 * 60 * 60 * 24) //every 30 minutes
//
// setInterval(() => {
//   daily.post()
// }, 1000 * 60 * 60 * 24) //every 1 day
