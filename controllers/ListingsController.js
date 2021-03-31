var express = require('express')

var router = express.Router()

var svcListings = require('../service/ListingsService')

router.use(function timeLog (req, res, next) {
    console.log('ListingsController, Now: ', new Date().toString())
    next()
})

router.get('/', getListings)

async function getListings(req, res, next) {

    console.log('LISTINGS GET: ALL')

    svcListings.getAll()
        .then(listings => res.json(listings))
        .catch(err => res.json({message: err}))
}


module.exports = router