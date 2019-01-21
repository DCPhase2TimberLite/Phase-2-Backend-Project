// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      SEQUELIZE SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Sequelize = require('sequelize')
const {or, and, gt, gte, lt, lte, ne, in:opIn} = Sequelize.Op
const db = require('../models')


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      OFFLINE TESTS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const email = 'gmcilhatton0@google.ca'

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
    const newestBirthdate = getBirthday(myData.pref_age_min)
    const oldestBirthdate = getBirthday(myData.pref_age_max)
    console.log('My name is',myData.f_name, myData.l_name, ', I am a',myAge,'year old',myData.gender,'living in',myData.city,'and I am looking for a',myData.pref_gender,'born between the dates of',oldestBirthdate,'and',newestBirthdate)
    
    // Create Gender Arrays
    const myGenderArr = [myData.gender, 'B']
    var prefGenderArr
    if (myData.pref_gender=='B') {
        prefGenderArr=['M','F','B']
    } else {
        prefGenderArr=[myData.pref_gender]
    }
    
    // Run Sequelize Query to find users that match my preferences and I match theirs
    return db.profiledata.findAll({
        where: {
            city: myData.city,
            gender: {
                [or]: [prefGenderArr]
            },
            birthday: {$between: [oldestBirthdate,newestBirthdate]},
            pref_gender: {
                [or]: [myGenderArr]
            }, 
            pref_age_min: {[lte]:myAge},
            pref_age_max: {[gte]:myAge},
            userid: {[ne]:myData.userid}
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
