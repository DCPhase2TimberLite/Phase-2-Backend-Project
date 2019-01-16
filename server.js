const express = require('express')
const bodyParser = require('body-parser')
const queries = require('./public/queries')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'))

// get user's preferences
app.get('api/getpreferences', (req, res, nextFn) => {
    queries.getUserPreferences()
    .then(function (data) {
        res.send(preferences)
    })
})

// load all profiles
app.get('api/allprofiles', (req, res, nextFn) => {
    queries.getAllProfiles()
    .then(function (data) {
        res.send(profiles)
    })
})