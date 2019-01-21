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

const myUserId = 66


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      SEQUELIZE FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

findProfileById(myUserId)
    .then(function(myData){return filterProfilesByPreferences(myData)})
        .then(function(resultArray){
            resultArray.forEach(function (object) {
                console.log(object.f_name, object.l_name, object.gender, object.birthday,object.city)
            })
        })

function findProfileById (id) {
    return db.profiledata.findOne({
        where: {userid:id}
    })
}

function filterProfilesByPreferences(myData){
    const myAge = getAge(myData.birthday)
    const pref_min_birthdate = getBirthday(myData.pref_age_min)
    const pref_max_birthdate = getBirthday(myData.pref_age_max)
    console.log(myData.f_name, myData.l_name)
    console.log(myData.gender, myData.pref_gender)
    console.log(myAge)
    console.log(myData.pref_age_min, myData.pref_age_max)
    console.log(pref_min_birthdate, pref_max_birthdate)
    console.log(myData.city)
    
    // Create Gender Arrays
    const myGenderArr = [myData.gender, 'B']
    var prefGenderArr
    if (myData.pref_gender=='B') {
        prefGenderArr=['M','F','B']
    } else {
        prefGenderArr=[myData.pref_gender]
    }
    console.log(myGenderArr, prefGenderArr)
    
    // Run Sequelize Query to find users that match my preferences and I match theirs
    return db.profiledata.findAll({
        where: {
            city: myData.city,
            gender: {
                [or]: [prefGenderArr]
            },
            birthday: {$between: [pref_max_birthdate,pref_min_birthdate]},
            pref_gender: {
                [or]: [myGenderArr]
            }, 
            pref_age_min: {[lte]:myAge},
            pref_age_max: {[gte]:myAge}
        }
    })
}

function findAccountByEmail (email) {
    return db.account.findOne({
        where: {email:email}
    })
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                UTILITY FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function getAge(dateString) {
    var today = new Date()
    var birthDate = new Date(dateString)
    var age = today.getFullYear() - birthDate.getFullYear()
    var m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }
    return age
}

function getBirthday(age) {
    var agems = age*365*24*60*60*1000
    var today = new Date()
    var birthDate = new Date(today.getTime() - agems)
    return birthDate.getFullYear()+'-'+(1+birthDate.getMonth())+'-'+birthDate.getDate()
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
