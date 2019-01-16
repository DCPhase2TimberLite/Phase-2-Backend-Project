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

app.post('/myProfile', function (req, res) {

}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      HTML Templating
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function buildWelcomePage(){
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
  <title>Timber</title>
  <style>
      :root {
          --input-padding-x: .75rem;
          --input-padding-y: .75rem;
      }

      html,
      body {
          height: 100%;
      }

      body {
          display: -ms-flexbox;
          display: flex;
          -ms-flex-align: center;
          align-items: center;
          padding-top: 40px;
          padding-bottom: 40px;
          background-color: #f5f5f5;
      }

      .form-signin {
          width: 100%;
          max-width: 420px;
          padding: 15px;
          margin: auto;
      }

      .form-label-group {
          position: relative;
          margin-bottom: 1rem;
      }

      .form-label-group > input,
      .form-label-group > label {
          padding: var(--input-padding-y) var(--input-padding-x);
      }

      .form-label-group > label {
          position: absolute;
          top: 0;
          left: 0;
          display: block;
          width: 100%;
          margin-bottom: 0;
          line-height: 1.5;
          color: #495057;
          cursor: text; /* Match the input under the label */
          border: 1px solid transparent;
          border-radius: .25rem;
          transition: all .1s ease-in-out;
      }

      .form-label-group input::-webkit-input-placeholder {
          color: transparent;
      }

      .form-label-group input:-ms-input-placeholder {
          color: transparent;
      }

      .form-label-group input::-ms-input-placeholder {
          color: transparent;
      }

      .form-label-group input::-moz-placeholder {
          color: transparent;
      }

      .form-label-group input::placeholder {
          color: transparent;
      }

      .form-label-group input:not(:placeholder-shown) {
          padding-top: calc(var(--input-padding-y) + var(--input-padding-y) * (2 / 3));
          padding-bottom: calc(var(--input-padding-y) / 3);
      }

      .form-label-group input:not(:placeholder-shown) ~ label {
          padding-top: calc(var(--input-padding-y) / 3);
          padding-bottom: calc(var(--input-padding-y) / 3);
          font-size: 12px;
          color: #777;
      }

      /* Fallback for Edge
      -------------------------------------------------- */
      @supports (-ms-ime-align: auto) {
      .form-label-group > label {
          display: none;
      }
      .form-label-group input::-ms-input-placeholder {
          color: #777;
      }
      }

      /* Fallback for IE
      -------------------------------------------------- */
      @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
      .form-label-group > label {
          display: none;
      }
      .form-label-group input:-ms-input-placeholder {
          color: #777;
      }
      }

  </style>
</head>
<body>
  <form class="form-signin">
      <div class="text-center mb-4">
        <img class="mb-4" src="../../assets/brand/bootstrap-solid.svg" alt="" width="72" height="72">
        <h1 class="h3 mb-3 font-weight-normal">Timber-Lite</h1>
        <p>Fall in "like"</p>
      </div>

      <div class="form-label-group">
        <input type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>
        <label for="inputEmail">Email address</label>
      </div>

      <div class="form-label-group">
        <input type="password" id="inputPassword" class="form-control" placeholder="Password" required>
        <label for="inputPassword">Password</label>
      </div>

      <div class="checkbox mb-3">
        <label>
          <input type="checkbox" value="remember-me"> Remember me
        </label>
      </div>
      <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
      <a href=auth/facebook>Sign in with Facebook</a>
    </form>
</body>
</html>
  `
}



function buildAppPage (userID) {
    userID = '12ASDvsdfsdf'
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="../style/style.css">
    <title>Timber: Fall in "Like"</title>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <div class="sidenav">
                <a href="/myProfile"><h5 style="text-align:center; color: #000; font-weight: 800;">My Profile</h5></a>
                <p style="text-align:center; background-color:#ff5c33;">Preferences</p>
                <p style="text-align:center; background-color:#ff5c33;">Matches</p>
            </div>
            
            <!-- Main Content -->
            <div class="main-content">
                    <div class="card profile-card">
                        <img class="card-img-top" src="profile.png" alt="Card image cap">
                        <div class="card-body">
                            <div class="d-flex justify-content-between" id="card-header">
                                <div class="card-title" id="profile-name">Name</div>
                                <div class="card-title" id="profile-age">25</div>
                            </div>
                        <p class="card-text">Some info.</p>

                        <form action="/app_reaction/" method="post" id="currentProfile">
                            <input type="text" name="UserID" value="${userID}" style="display:none;">
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
    <link rel="stylesheet" type="text/css" href="../style/style.css">
    
    <!-- Icons CDN -->
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous">
    <title>Timber: Fall in "Like"</title>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <div class="sidenav">
                <h5 style="text-align:center; color: #000; font-weight: 800;"><i class="fas fa-fire"></i>   My Profile</h5>
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