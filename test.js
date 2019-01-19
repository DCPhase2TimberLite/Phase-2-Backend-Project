const db = require('./models')

// db.account.create({
//     email: 'abc@gmail.com'
// })

db.sequelize.query("COPY userAccounts FROM '/home/gwin333/DigitalCrafts/groupproject3_Phase-2-Backend-Project/server/rawData/userAccounts.csv' CSV HEADER")