// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      SEQUELIZE SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Sequelize = require('sequelize')
const db = require('./models')

db.userdata.findAll()
    .then((results) => {
        results.forEach(function(index){
            console.log(index.userid, index.f_name)
        })
    })

models.post.findByID(10).then(function(post){
    console.log(post)
})

db.useraccounts.create({email:'testemail@email.com',password:'this-is-a-password-hash'})
.then(function(user){
    console.log(user)
})

db.userdata.findAll({where: {l_name: 'Ashard'}})
  .then((results) => {
    results.forEach(function(index){
            console.log(index.userid, index.f_name, index.l_name);
        })
  });

