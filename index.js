// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      SEQUELIZE SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Sequelize = require('sequelize')
const db = require('./models')

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      EXPRESS SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const express = require('express')
const path = require('path')
const app = express()

app.use(express.static('public'))

const port = process.env.PORT || 3000
app.listen(port, () => console.log('App listening on port ' + port))

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      PASSPORT SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const passport = require('passport')
app.use(passport.initialize())
app.use(passport.session())

app.get('/success', function (req, res) {
  res.send(buildAppPage())
})
app.get('/error', (req, res) => res.send('error logging in'))

passport.serializeUser(function (user, cb) {
  cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
  cb(null, obj)
})

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      FACEBOOK AUTH
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      EXPRESS ROUTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.get('/', function (req, res) {
  res.send(buildWelcomePage())
})

app.get('/myProfile', function (req, res) {
  res.send(buildMyProfilePage())
})

app.get('/appPage', function (req, res) {
  res.send(buildAppPage())
})

app.post('/myProfile', function (req, res) {

})

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      HTML Templating
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const defaultPhoto = "/style/profile.png"

function buildWelcomePage(){
  return `
  <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        <link rel="stylesheet" type="text/css" href="/style/welcome.css">
        <title>Timber</title>
    </head>
<body>
    <div class="card-body">
        <div class="text-center mb-4">
            <img class="mb-4" src="../../assets/brand/bootstrap-solid.svg" alt="" width="72" height="72">
            <h1 class="h3 mb-3 font-weight-normal">Timber-Lite</h1>
            <p>Fall in "like"</p>
        </div>
        <input type='checkbox' id='form-switch'>
        <form class="form-signin" id='login-form'>
            <div class="form-label-group">
                <input type="email" id="inputEmail" class="form-control" placeholder="Email address" autofocus>
            </div>
    
            <div class="form-label-group">
                <input type="password" id="inputPassword" class="form-control" placeholder="Password">
            </div>
    
            <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
            <button class="btn btn-lg btn-primary btn-block"><a href=auth/facebook>Sign in with Facebook</a></button>
            <button type="button" class="btn btn-lg btn-primary btn-block"><label for='form-switch'><span>Register</span></label></button>
        </form>

        <form class="form-signin" id='register-form'>
            <div class="form-label-group">
                <input type="text" class="form-control" placeholder="First Name" autofocus>
            </div>
            <div class="form-label-group">
                <input type="email" id="inputEmail" class="form-control" placeholder="Email address">
            </div>
    
            <div class="form-label-group">
                <input type="password" id="inputPassword" class="form-control" placeholder="Password">
            </div>
    
            <button class="btn btn-lg btn-primary btn-block" type="submit">Register</button>
            <button type="button" class="btn btn-primary btn-lg btn-block"><label for='form-switch'>Already a Member ? Sign In Now..</label></button>
        </form>
    </div>
</body>
</html>
`
 }

function buildAppPage (user) {
    user = {
        name: 'test name',
        age: 25,
        bio: 'bjkalsdhjklhsjl asjdfklsahjdfk hasjkfl hsjakd lfhjakl dfhjska fdhjska dasjfks',
        ID: 'testUserID',
        picture: defaultPhoto
    }
    // if (user.picture == "N/A"){user.picture = defaultPhoto}
    
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="/style/style.css">
    <title>Timber: Fall in "Like"</title>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <div class="sidenav">
                <a href="/myProfile"><h5 style="text-align:center; color: #000; font-weight: 800;"><i class="fas fa-fire"></i>   My Profile</h5></a>
                <p style="text-align:center; background-color:#ff5050;;">Matches</p>
            </div>
            
            <!-- Main Content -->
            <div class="main-content">
                    <div class="card profile-card">
                        <img class="card-img-top" src="${user.picture}" alt="Card image cap">
                        <div class="card-body">
                            <div class="d-flex justify-content-between" id="card-header">
                                <div class="card-title" id="profile-name">${user.name}</div>
                                <div class="card-title" id="profile-age">${user.age}</div>
                            </div>
                        <p class="card-text">${user.bio}</p>

                        <form action="/app_reaction/" method="post" id="currentProfile">
                            <input type="text" name="UserID" value="${user.ID}" style="display:none;">
                        </form>
                        <div class="d-flex justify-content-between" id="card-reactions">
                            <button type="submit" name="response" value="dislike" class="btn btn-light btn-reactions" id="dislike-btn"><i class="fa fa-times" aria-hidden="true"></i></button>
                            <button type="submit" name="response" value="like" class="btn btn-light btn-reactions" id="like-btn"><i class="fa fa-heart" aria-hidden="true"></i></button>
                        </div>
                        </div>
                    </div>
            </div>

        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
</body>
</html>
    `
}

function buildMyProfilePage () {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">

    <!-- CSS stylesheets -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" href="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css">
    <link rel="stylesheet" type="text/css" href="/style/style.css">
    
    <!-- Icons CDN -->
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous">
    <title>Timber: Fall in "Like"</title>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <div class="sidenav">
                <h5 style="text-align:center; color: #000; font-weight: 800;"><i class="fas fa-fire"></i>   My Profile</h5>
                <a href="/appPage"><button>Back</button></a>
                <p style="text-align:center; background-color:#ff5050;">Preferences</p>
                
                <div class="btn-group">
                        <button type="button" class="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          Looking for
                        </button>
                        <div class="dropdown-menu">
                          <a class="dropdown-item" href="#">Men</a>
                          <a class="dropdown-item" href="#">Women</a>
                          <a class="dropdown-item" href="#">Men & Women</a>
                        </div>
                </div>
                
                <form method="post" action="/myProfile">
                    <div data-role="rangeslider">
                      <label for="age-min">Min</label>
                      <input type="range" name="price-min" id="price-min" value="18" min="18" max="100">
                      <label for="age-max">Max</label>
                      <input type="range" name="price-max" id="price-max" value="100" min="18" max="100">
                    </div>
                      <input type="submit" data-inline="true" value="Submit">
                    </form>
                <p style="text-align:center; background-color:#ff5050;">Matches</p>
            </div>
            <div class="main-content">
                <h3 style="text-align:center;">Timber - Fall in <i class="far fa-heart"></i></h3>
            </div>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
    <script src="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>
    
    <!-- Bootstrap scripts -->
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
</body>
</html>
    `
}
