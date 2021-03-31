const path = require('path')

const {CFG_HOST, CFG_PORT} = require('./helpers/config')

// -------------------------------------------
// ExpressJS configuration
// -------------------------------------------

const express = require('express')
const app = express()

app.use(express.static('public'))

// -------------------------------------------
// Middlewares configuration
// -------------------------------------------

const bodyParser = require('body-parser')
app.use(bodyParser.json({ limit: '50mb' })) // For parsing application/json
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })) // For parsing application/xwww-form-urlencoded

const cors = require('cors')
app.use(cors())

// -------------------------------------------
// Handlebars template engine configuration
// -------------------------------------------

const hbs = require('handlebars')
const exphbs = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

app.engine(
  'hbs',
  exphbs({
    handlebars: allowInsecurePrototypeAccess(hbs),
    defaultLayout: 'main',
    extname: '.hbs'
  })
)

app.set('view engine', 'hbs')
app.set('views', './views')

var ctlrListings = require(path.join(__dirname, '/controllers/ListingsController'))
app.use('/listings', ctlrListings)





app.listen(CFG_PORT, () => {
  console.log(`ExpressJS listening at http://${CFG_HOST}:${CFG_PORT}`)
})
