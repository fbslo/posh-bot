const hive = require("@hiveio/hive-js")
const con = require('./database.js')

const register = require("./scripts/register.js")

// setInterval(() => {
//   register.new_registrations()
// }, 1000 * 60)

register.new_registrations()
