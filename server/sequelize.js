// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      SEQUELIZE SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Sequelize = require('sequelize')
const db = require('./models')

db.accounts.findAll()
  .then((results) => {
    results.forEach(function (index) {
      console.log(index.userid, index.f_name)
    })
  })

models.post.findByID(10).then(function (post) {
  console.log(post)
})

db.accounts.create({ email: 'testemail@email.com', password: 'this-is-a-password-hash' })
  .then(function (user) {
    console.log(user)
  })

db.accounts.findAll({ where: { l_name: 'Ashard' } })
  .then((results) => {
    results.forEach(function (index) {
      console.log(index.userid, index.f_name, index.l_name)
    })
  })
