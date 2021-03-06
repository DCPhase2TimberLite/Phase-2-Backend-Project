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
var session = require('express-session')
var cookieParser = require('cookie-parser')
const passport = require('passport')
const path = require('path')
const app = express()

const port = process.env.PORT || 3000
app.listen(port, () => console.log('App listening on port ' + port))

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      PASSPORT SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.urlencoded())
app.use(session({ secret: 'timber-log-piece-of-wood' }))
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function (user, cb) {
    console.log('~~~~~Serializing User~~~~')
    cb(null, user.id)
})

passport.deserializeUser(function (userid, cb) {
    console.log('~~~~~Deserializing User~~~~')
    data.getProfileById(userid)
        .then(function (user) {
            cb(null, user.id)
        })
        .catch((err) => {
            console.log('error logging in: ', err)
        })
})

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//              PASSPORT LOCAL AUTHENTICATION
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const LocalStrategy = require('passport-local').Strategy

passport.use('login-local', new LocalStrategy(function (email, password, done) {
    console.log('logging in user')
    data.getAccountByEmail(email)
    .then(function (user) {
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
}))

passport.use('register-local', new LocalStrategy(function (email, password, done) {
    console.log('registering locally')
    data.getAccountByEmail(email)
    .then(function (user) {
        if (!user) {
            console.log('registering new account')
            data.createAccountByEmail(email, password)
            .then(function(user){
                return done(null, user)
                })
        } else {
            console.log("error creating account")
        }
    })
}))

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
//                      OAUTH ROUTES
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Register
app.post('/register', passport.authenticate('register-local', { failureRedirect: '/error2' }), function (req, res) {
  var profiledata = req.body
  var account = req.user
  data.createProfileData(profiledata, account)
  res.redirect('/myProfile')
})

// Login
app.post('/login', passport.authenticate('login-local', { failureRedirect: '/error' }), function (req, res) {
  res.redirect('/app')
})

// Facebook
app.get('/auth/facebook', passport.authenticate('facebook'))
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/error' }), function (req, res) {
    console.log('callback', 'req.user: ',req.user)
    // req.user.id is facebook id
    data.getAccountByFbId(req.user.id)
    .then((account) => {
        if (!account) {
            console.log('registering new account from facebook...')
            data.createAccountByFbId(req.user.id)
            .then((account) => {
                data.createProfileDataFb(req.user, account)
                .then((profile) => {
                    console.log('setting session id from: ', req.session.passport.user)
                    req.session.passport.user = profile.userid
                    console.log('setting session id to: ', req.session.passport.user)
                })
                .then(() => {
                    console.log('going to /myProfile')
                    res.redirect('/myProfile')})
            })
        } else if (account) {
            console.log('user found, logging in...')
            console.log('setting session id from: ', req.session.passport.user)
            req.session.passport.user = account.id
            console.log('setting session id to: ', req.session.passport.user)
            console.log('going to /app')
            res.redirect('/app')
        } else {
            console.log('error handling fb user')
            return
        }
    })
})

// Logout
app.post('/logout', function (req, res) {
  console.log('logging out')
  req.logout()  
  res.redirect('/')
})

// Errors
app.get('/error', (req, res) => res.send('error logging in'))
app.get('/error2', (req, res) => res.send('error creating account'))

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      EXPRESS ROUTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Welcome (skips if session exists)
app.get('/', function (req, res) {
    if(req.session.passport!==undefined){
        if(req.session.passport.user!==undefined){
        res.redirect('/app')
        } else {
            res.send(buildWelcomeHTML())
        }
    } else {
            res.send(buildWelcomeHTML())
    }
})

app.post('/', function (req, res) {
    res.send(
        buildHeaderHTML() +
            buildMyProfileHTML() +
            buildFooterHTML()
    )
})

// My Profile
app.get('/myProfile', function (req, res) {
    data.getProfileById(req.session.passport.user)
    .then(function (result) {
        res.send(
            buildHeaderHTML() +
            buildMyProfileHTML(result) +
            buildFooterHTML()
        )
    })
})

app.post('/Preferences', function (req, res) {
    data.updatePreferences(req)
    .then(() => {
        res.redirect('/myProfile')
    })
})

app.post('/myProfile', function (req, res) {
    data.updateProfile(req)
    .then(() => {
        res.redirect('/myProfile')
    })
})

// App
app.get('/app', function (req, res) {
    if(req.session.passport!==undefined){
        Promise.all([data.getListOfProfiles(req.session.passport.user), data.getMatchesById(req.session.passport.user)])
        .then(function (results) {
            res.send(
                buildHeaderHTML() +
                buildAppHTML(req.session.passport.user, results[0], results[1]) +
                buildFooterHTML()
            )
        })
    } else {
        res.send(buildWelcomeHTML())
    }
})

app.post('/app_reaction', function (req, res) {
    data.createALikeDbEntry(req.session.passport.user, req.body.theiruserID, req.body.liked)
        .then(res.redirect('/app'))
})

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      HTML Templating
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const defaultPhoto = '../style/profile.png'

function createCardsHTML(myuserid, user) {
    var Card
    console.log("Creating cards", user)   
    if (user.userid !== undefined) {
        Card =     
            `
            <div class="card profile-card">
            <img class="card-img-top" src="${user.profile_picture}" onerror="this.onerror=null;this.src='${defaultPhoto}';">
                <div class="card-body">
                    <div class="d-flex justify-content-between" id="card-header">
                        <div class="card-title" id="profile-name">${user.f_name}</div>
                        <div class="card-title" id="profile-age">${user.age}</div>
                    </div>
                <p class="card-text">${user.bio}</p>
                <form action="/app_reaction" method="post" id="currentProfile">
                    <input type="text" name="myuserID" value="${myuserid}" style="display:none;">
                    <input type="text" name="theiruserID" value="${user.userid}" style="display:none;">
                    <div class="d-flex justify-content-between" id="card-reactions">
                        <button type="submit" name="liked" value="false" class="btn btn-light btn-reactions" id="dislike-btn"><i class="fa fa-times" aria-hidden="true"></i></button>
                        <button type="submit" name="liked" value="true" class="btn btn-light btn-reactions" id="like-btn"><i class="fa fa-heart" aria-hidden="true"></i></button>
                    </div>
                    </form>
                </div>
            </div>
            `
        return Card;
    } 
    else {      
        return `
        <div class="card profile-card">
            "Whoa Casanova! We're fresh out of results! Check back later"
        </div>
        `
    }
}

function createMatchesHTML(arrayOfMatches) {
    console.log('creating MatchesHTML...')
    if (arrayOfMatches){
        var arrayHTML = arrayOfMatches.map(function (user, index) {
            var matchesCard =     
                `
                <div class="card matches" style="width: 150px; max-height: 250px; overflow-y:hidden;">
                    <img class="card-img-top" src="${user.profile_picture}" onerror="this.onerror=null;this.src='${defaultPhoto}';">
                    <div class="card-body">
                        <h6 class="card-text" style="font-weight:bold";>${user.f_name}, ${user.age}</h6>
                        <div class="card-text email-text">${user.occupation}, ${user.city}</div>
                    </div>
                </div>`

            return matchesCard;
        })
        return arrayHTML.join('')
    } else {
        
    }
}

function buildHeaderHTML () {
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
    <link rel="shortcut icon" type="image/png" href="../style/flame.png" />
    <title>Timber | Fall in "Like"</title>

    </head>
    `
}

function buildFooterHTML () {
  return `
    <!-- Bootstrap scripts -->
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
    </body>
    </html>
    `
}

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
                      <input class="form-check-input" type="radio" name="genderOptions" id="genderOption1" value="M">
                      <label class="form-check-label" for="genderOption1">Man</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="radio" name="genderOptions" id="genderOption2" value="F">
                      <label class="form-check-label" for="genderOption2">Woman</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="radio" name="genderOptions" id="genderOption3" value="B">
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
                <input class="form-control" id="birthday" name="birthday" placeholder="01/20/1995">
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

function buildAppHTML (myuserid, user, arrayOfMatches) {
  if (!user) { user = {} }
  if (user.profile_picture == '') { user.profile_picture = defaultPhoto }

  return `
    <body>
      <div class="container-fluid">
          <div class="row">
              <div class="sidenav">
                <form class="form-signout" id='logout-form' action="/logout" method="post">  
                      <button class="btn-md btn-danger btn-block" type="submit">Sign out</button>
                  </form>
              <h4 style="text-align:center; color: #fff; font-weight: 800; background-color:#ff5050; padding:25px;"><i class="fas fa-fire"></i>   Timber</h4>
              <a href="/myProfile"><h4 style="text-align:center; color: #fff; font-weight: 800; background-color:#ff5050; padding:25px;"><i class="fas fa-fire"></i>   My Profile</h4></a>
                  <p style="text-align:center; background-color:#ff5050;;">Matches</p><br />
                
                  <div class="d-flex flex-row" id="matchesContainer" style="flex-wrap: wrap; justify-content:space-around;">
                    ${createMatchesHTML(arrayOfMatches)}
                  </div>

              </div>
              
              <!-- Main Content -->
              <div class="main-content">
                ${createCardsHTML(myuserid, user)}
              </div>
  
          </div>
      </div>
    `
}

function buildMyProfileHTML (user) {
  return `            
    <body style="background-color:#686868">
        <div class="container-fluid">
            <div class="row">
                <div class="sidenav" style="background-color:#f9f3f2;">
                    <form class="form-signout" id='logout-form' action="/logout" method="post">  
                        <button class="btn-md btn-danger btn-block" type="submit">Sign out</button>
                    </form>
                    <h4 style="text-align:center; color: #fff; font-weight: 800; background-color:#ff5050; padding:25px;"><i class="fas fa-fire"></i>   Timber</h4>
                    <form method="get" action="/">
                    <button class="btn-md btn-light btn-block" type="submit">Back</button>
                    </form>
                    <p style="text-align:center; background-color:#ff5050;">Preferences</p>
                    
                    <form method="post" action="/Preferences"><br />
                
                        <div class="col-auto my-1">
                            <label style="color:#000;" class="mr-sm-2" for="inlineFormCustomSelect">I am looking for:</label>
                            <select class="custom-select mr-sm-2" id="inlineFormCustomSelect" name="pref_gender">
                            <option selected value="${user.pref_gender}">Choose one</option>
                            <option value="M">Men &#9794;</option>
                            <option value="F">Women &#9792;</option>
                            <option value="B">Both</option>
                            </select>
                        </div><br /><br />

                        <div class="form-row">
                                <div class="col">
                                    <label for="age-min">Minimum Age:</label>
                                    <input type="integer" class="form-control" id="age-min" name="pref_age_min" value="${user.pref_age_min}">
                                </div>
                                <div class="col">
                                    <label for="age-max">Maximum Age:</label>
                                    <input type="integer" class="form-control" id="age-max" name="pref_age_max" value="${user.pref_age_max}">
                                </div>
                        </div><br /><br /><br />

                        <input type="submit" class="btn-block btn-danger" data-inline="true" value="Submit">
                        </form>
                        <hr />
                </div>
                <div class="main-content">
                    <h3 style="text-align:center;">Timber - Fall in <i class="far fa-thumbs-up"></i></h3>
                    
                    <div class="card profile-card">
                    <img class="card-img-top" src="${user.profile_picture}" onerror="this.onerror=null;this.src='${defaultPhoto}';">
                        <div class="card-body">
                            <div class="d-flex justify-content-between" id="card-header">
                                <div class="card-title" id="profile-name">${user.f_name}</div>
                                <div class="card-title" id="profile-age">${user.age}</div>
                            </div>
                        
                        <form method="post" action="/myProfile">
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">About Me:</span>
                            </div>
                            <textarea class="form-control" aria-label="With textarea" name="bio" >${user.bio}</textarea>
                            <input type="submit" class="btn-block btn-danger" data-inline="true" value="Save">
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
    `
}
