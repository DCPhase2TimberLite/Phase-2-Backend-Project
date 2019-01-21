// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      SEQUELIZE SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Sequelize = require('sequelize')
const db = require('../models')
const data = require('./data')

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
app.use(express.urlencoded())
app.use(passport.session())

passport.serializeUser(function (user, cb) {
  cb(null, user.id)
})

passport.deserializeUser(function (email, cb) {
  db.account.findOne({ where: { email: email } })
    .then(function (user) {
      cb(null, user.id)
    })
})

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//              PASSPORT LOCAL AUTHENTICATION
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const LocalStrategy = require('passport-local').Strategy

passport.use('login-local', new LocalStrategy(function (email, password, done) {
    console.log('logging in user')
        db.account.findOne({ where: { email: email } })
            .then(function (user) {
                // if (err) {
                //     console.log("error signing user in")
                // return done(err)
                // }

                if (!user) {
                console.log('account not found')
                return done(null, false)
                }

                if (user.pass != password) {
                console.log('!=pass')
                return done(null, false)
                }
                console.log('success')
                return done(null, user)
            })
    }
))

passport.use('register-local', new LocalStrategy(function (email, password, done) {
        db.account.findOne({ where: { email: email } })
            .then(function (user) {
            if (!user) {
                console.log('registering new account')
                db.account.create({ email: email, pass: password }).then(function(user){
                    console.log('success')
                    return done(null, user)
                })
            } else {
                    console.log("error creating account")
                    return
                }
    
            // if (user.pass != password) {
            //     console.log('!=pass')
            //     return done(null, false)
            // }

            // console.log('success')
            // return done(null, user)
            })
    }
))

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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      EXPRESS ROUTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.get('/', function (req, res) {
    res.send(buildWelcomeHTML())
})

app.post('/', function (req, res) {
    res.send(buildMyProfileHTML())
})

app.get('/app', function (req, res) {
    getListOfProfiles(66) // replace with user ID
    res.send(buildAppHTML())
})

app.get('/myProfile', function (req, res) {
    res.send(buildMyProfileHTML())
})
  
app.post('/myProfile', function (req, res) {
})

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      OAUTH ROUTES
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/auth/facebook',
  passport.authenticate('facebook'))

app.get('/auth/facebook/callback',passport.authenticate('facebook', { failureRedirect: '/error' }),function (req, res) {
    res.redirect('/app')
  })

app.post('/login', passport.authenticate('login-local', { failureRedirect: '/error' }), function(req, res) {
    res.redirect('/app')
})

app.post('/register', passport.authenticate('register-local', { failureRedirect: '/error2' }), function(req, res) {
    res.redirect('/app')
})

app.get('/error', (req, res) => res.send('error logging in'))
app.get('/error2', (req, res) => res.send('error creating account'))


//~~~~~~~~~~~~~~~~~~~~~~~auth logout~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      HTML Templating
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const defaultPhoto = '/style/profile.png'

function buildWelcomeHTML () {
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



        <form class="form-signin" id='login-form' action="/login" method="post">
            <div class="form-label-group">
                <input type="email" id="inputEmail" name="username" class="form-control" placeholder="Email address" autofocus>
            </div>
            <div class="form-label-group">
                <input type="password" id="inputPassword" name="password" class="form-control" placeholder="Password">
            </div>
            <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
            <button class="btn btn-lg btn-primary btn-block action-button"><a href=auth/facebook>Sign in with Facebook</a></button>
            <button type="button" class="btn btn-lg btn-primary btn-block"><label for='form-switch'><span>Register</span></label></button>
        </form>




        <form id="register-form" class="center-div form-signin" style="width: 65%; max-width: 80%;" action="/register" method="post">
          <div id="header" class="form-group centered-stuff form-label-group">
            <h1> Create Account</h1>
          </div>
          <!-- row -->
          <div class="form-group form-row form-label-group">
              <div class="form-group col" style="padding-right: 15px;">
                <label for="inputName">First Name</label>
                <input type="text" class="form-control" id="inputName" name="first_name" placeholder="First Name">
              </div>
              <div class="form-group col" style="padding-left: 15px;">
                <label for="gender">Gender</label>
                <div class="form-group" id="gender"> 
                    <div class="form-check form-check-inline" >
                      <input class="form-check-input" type="radio" name="genderOptions" id="genderOption1" value="option1">
                      <label class="form-check-label" for="genderOption1">Man</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="radio" name="genderOptions" id="genderOption2" value="option2">
                      <label class="form-check-label" for="genderOption2">Woman</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="radio" name="genderOptions" id="genderOption3" value="option3">
                      <label class="form-check-label" for="genderOption3">Other</label>
                    </div>
                </div>
              </div>
          </div>
          <!-- row -->
          <div class="form-group row form-label-group">
              <div class="form-group col">
                <label for="exampleInputEmail1">Email address</label>
                <input type="email" class="form-control" id="exampleInputEmail1" name="username" placeholder="Enter email">
              </div>
              <div class="form-group col">
                <label for="birthday">Birthday</label>
                <input type="email" class="form-control" id="birthday" placeholder="01/20/1995">
              </div>
          </div>
          <!-- row -->
          <div class="form-group row form-label-group">
              <div class="form-group col">
                <label for="inputPassword">Password</label>
                <input type="password" class="form-control" name="password" id="inputPassword" placeholder="Password">
              </div>
              <div class="form-group col">
                <label for="uploadPhoto">Upload Photo</label>
                <div class="custom-file" id="uploadPhoto">
                  <input type="file" class="custom-file-input" id="inputGroupFile01" aria-describedby="inputGroupFileAddon01">
                  <label class="custom-file-label" for="inputGroupFile01">Choose file</label>
                </div>
              </div>
          </div>
          <div class="form-group row form-label-group">
            <div class="form-group col">
              <button type="button" class="btn btn-primary centered-stuff"><label for='form-switch'>Already a Member? Sign In Now..</label></button>
            </div>
            <div class="form-group col">
              <button type="submit" class="btn btn-primary centered-stuff ">Submit</button>
            </div>
          </div>
        </form>
    </div>
</body>
</html>
`
}

function buildAppHTML (user) {
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

function buildMyProfileHTML () {
    user = {
        name: 'test name',
        age: 25,
        bio: 'bjkalsdhjklhsjl asjdfklsahjdfk hasjkfl hsjakd lfhjakl dfhjska fdhjska dasjfks',
        ID: 'testUserID',
        picture: defaultPhoto
    }
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">


    <!-- CSS stylesheets -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="/style/style.css">
    
    <!-- Icons CDN -->
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous">
    
    <!-- Title-bar Icon -->
    <link rel="shortcut icon" type="image/png" href="/public/style/flame.png" />

        <title>Timber | Fall in "Like"</title>
    </head>
    <body style="background-color:#686868">
        <div class="container-fluid">
            <div class="row">
                <div class="sidenav" style="background-color:#f9f3f2;">
                    <h4 style="text-align:center; color: #fff; font-weight: 800; background-color:#ff5050; padding:25px;"><i class="fas fa-fire"></i>   My Profile</h5>
                    <a href="/app"><button>Back</button></a>
                    <p style="text-align:center; background-color:#ff5050;">Preferences</p>
                    
                    <form method="post" action="/myProfile">
                
                        <div class="col-auto my-1">
                            <label style="color:#000;" class="mr-sm-2" for="inlineFormCustomSelect">I am looking for:</label>
                            <select class="custom-select mr-sm-2" id="inlineFormCustomSelect">
                            <option selected>Choose one</option>
                            <option value="1">Men &#9794;</option>
                            <option value="2">Women &#9792;</option>
                            <option value="3">Both</option>
                            </select>
                        </div>

                        <div class="form-row">
                                <div class="col">
                                    <input type="integer" class="form-control" id="age-min" placeholder="Minimum Age">
                                </div>
                                <div class="col">
                                    <input type="integer" class="form-control" id="age-max" placeholder="Maximum Age">
                                </div>
                        </div>

                        <input type="submit" class="btn-block" data-inline="true" value="Submit">
                        </form><hr />

                </div>
                <div class="main-content">
                    <h3 style="text-align:center;">Timber - Fall in <i class="far fa-heart"></i></h3>
                    
                    <div class="card profile-card">
                        <!-- <img class="card-img-top" src="profile.png" alt="Card image cap"> -->
                        <img class="card-img-top" src="${user.picture}" alt="Card image cap">
                        <div class="card-body">
                            <div class="d-flex justify-content-between" id="card-header">
                                <div class="card-title" id="profile-name">${user.name}</div>
                                <div class="card-title" id="profile-age">${user.age}</div>
                            </div>
                        
                        <form method="post" action="/myProfile">
                        <div class="input-group">
                            <div class="input-group-prepend">
                            <span class="input-group-text">About you:</span>
                            </div>
                            <textarea class="form-control" aria-label="With textarea"></textarea>

                            <button type="button" class="btn-danger">Save</button>
                        </div>
                        </form>

                        </div>
                    </div>
                    </div>

                    </div>
                
                
                </div>
            </div>
        </div>

    </div> 
    <!-- Bootstrap scripts -->
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
</body>
</html>
    `
}
