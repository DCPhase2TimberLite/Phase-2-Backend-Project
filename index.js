/* EXPRESS SETUP */
const express = require('express')
const path = require('path')
const app = express()

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/html', 'welcome.html')))
const port = process.env.PORT || 3000
app.listen(port, () => console.log('App listening on port ' + port))

/*  PASSPORT SETUP  */
const passport = require('passport')
app.use(passport.initialize())
app.use(passport.session())

app.get('/success', (req, res) => res.send('You have successfully logged in'))
app.get('/error', (req, res) => res.send('error logging in'))

passport.serializeUser(function (user, cb) {
  cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
  cb(null, obj)
})

/*  FACEBOOK AUTH  */
const FacebookStrategy = require('passport-facebook').Strategy
const FACEBOOK_APP_ID = '2188899751372256'
const FACEBOOK_APP_SECRET = '0092f4fc9e900f72929fc85c3061737b'

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: '/auth/facebook/callback'
},
function (accessToken, refreshToken, profile, cb) {
  return cb(null, profile)
}
))

app.get('/auth/facebook',
  passport.authenticate('facebook'))

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/error' }),
  function (req, res) {
    res.redirect('/success')
  })
