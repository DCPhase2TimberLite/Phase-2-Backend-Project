// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      SEQUELIZE SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Sequelize = require('sequelize')
const db = require('../models')

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      SEQUELIZE SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

userEmail = 'gmcilhatton0@google.ca'

findAccountByEmail(userEmail)
    .then(function(user){
        console.log(user.id)
        return findProfileById(user.id)
    })
    .then(function(profile){
        console.log(profile)
        console.log(profile.userid)
        console.log(profile.f_name)
        console.log(profile.l_name)
    })

function findAccountByEmail (email) {
    return db.account.findOne({where: {email:email}})
}

function findProfileById (id) {
    return db.profiledata.findOne({where: {userid:id}})
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
