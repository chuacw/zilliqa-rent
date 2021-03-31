const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  
    CFG_HOST: process.env.HOST,
    CFG_PORT: process.env.PORT
}