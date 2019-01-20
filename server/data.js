// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      SEQUELIZE SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Sequelize = require('sequelize')
const {or, and, gt, gte, lt, lte, ne, in:opIn} = Sequelize.Op
const db = require('../models')


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      OFFLINE TESTS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

userEmail = 'gmcilhatton0@google.ca'

// findAccountByEmail(userEmail)
//     .then(function(user){
//         console.log(user.id)
//         return findProfileById(user.id)
//     })
//     .then(function(profile){
//         // console.log(profile)
//         console.log(profile.userid)
//         console.log(profile.f_name)
//         console.log(profile.l_name)
//     })

filterProfilesByPreferences('B', 18, 23, 'Toshloq')
    .then(function(resultArray){
        resultArray.forEach(function (object) {
            console.log(object.f_name, object.l_name, object.gender, object.birthday,object.city)
        })
    })


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      SEQUELIZE FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function findAccountByEmail (email) {
    return db.account.findOne({
        where: {email:email}
    })
}

function findProfileById (id) {
    return db.profiledata.findOne({
        where: {userid:id}
    })
}

function filterProfilesByPreferences(gender, ageMin, ageMax, city){
    console.log(gender, ageMin, ageMax, city)
    // to-do: convert age into dates to compare against birthday
    var notgender
    if (gender=='F'){notgender='M'} else if (gender=='M'){notgender='F'} else {notgender='none'}
    console.log(gender,notgender)
    return db.profiledata.findAll({
        where: {
            gender: {[ne]:notgender},
            pref_age_min: {[gte]:ageMin},
            pref_age_min: {[lte]:ageMax},
            city: city
        }
    })
}

// function findAllProfiles (column, value) {
    
//     db.profiledata.findAll({where: })
// }


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                SEQUELIZE REFERENCE QUERIES
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// db.accounts.findAll()
//     .then((results) => {
//         results.forEach(function(index){
//             console.log(index.userid, index.f_name)
//         })
//     })

// models.post.findByID(10).then(function(post){
//     console.log(post)
// })

// db.accounts.create({email:'testemail@email.com',password:'this-is-a-password-hash'})
// .then(function(user){
//     console.log(user)
// })

// db.accounts.findAll({where: {l_name: 'Ashard'}})
//   .then((results) => {
//     results.forEach(function(index){
//             console.log(index.userid, index.f_name, index.l_name);
//         })
//   });
