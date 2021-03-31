var express = require('express')

var router = express.Router()

var svcListings = require('../service/ListingsService')

router.use(function timeLog (req, res, next) {
    console.log('ListingsController, Now: ', new Date().toString())
    next()
})

router.get('/', getListings)
router.get('/add/:address/:rent', addListing)
router.get('/rent/:id/:amount', rent)

router.get('/state', getState)

router.get('/add', addHouse)
router.post('/new', newHouse)

async function getListings(req, res, next) {

    console.log('LISTINGS GET: ALL')

    svcListings.getAll().then(listings => {

        res.render('listings', {
            title: 'Listings of Houses for Rent',
            houses: listings 
        })
    })
}


async function addListing(req, res, next) {

    let address = req.params.address
    let rent = req.params.rent

    console.log(`LISTINGS ADD: ${address} ${rent}`)

    svcListings.addHouse(address, rent).then(result => {

        console.log(result)
    })
}


async function rent(req, res, next) {

    let id = req.params.id
    let amount = req.params.amount

    console.log(`LISTINGS RENT: ${id} ${amount}`)

    svcListings.rentHouse(id, amount).then(result => {

        console.log(result)
    })
}

async function addHouse(req, res, next) {

    console.log('LISTINGS ADD_HOUSE:')

        res.render('add', {
            title: 'Add House'
        })
}


async function newHouse(req, res, next) {

    let address = req.body.txtAddress
    let rent = req.body.txtRent

    console.log(`LISTINGS NEW_HOUSE: ${address} ${rent}`)

    svcListings.addHouse(address, rent).then(result => {

        console.log(result)
    })
}


async function getState(req, res, next) {

    console.log('LISTINGS GET_STATE:')

    svcListings.getState().then(result => {

        console.log(result)
    })
}

module.exports = router