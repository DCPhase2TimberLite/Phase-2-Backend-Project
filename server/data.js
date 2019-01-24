'use strict'
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      SEQUELIZE SETUP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const Sequelize = require('sequelize')
const {or, and, gt, gte, lt, lte, ne, notIn, in:opIn} = Sequelize.Op
const db = require('../models')


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                        EXPORTS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
module.exports = {
    getAccountByEmail: (myEmail) => {
        return findAccountByEmail(myEmail)
    },
    getAccountByFbId: (facebookid) => {
        return findAccountByFbId(facebookid)
    },
    getProfileById: (myUserId) => {
        return findProfileById(myUserId)
    },
    getListOfProfiles: (myUserId) => {
        return findListOfProfilesById(myUserId)
    },
    getMatchesById: (myUserId) => {
        return findMyMatchesById (myUserId)
    },
    createAccountByEmail: (email,password) => {
        return db.account.create({ email: email, pass: password })
    },
    createAccountByFbId: (facebookid) => {
        return db.account.create({facebookid: facebookid})
    },
    createProfileData: (profiledata, account) => {
        return createProfileData(profiledata, account)
    },
    createProfileDataFb: (profiledata, account) => {
        return createProfileDataFb(profiledata, account)
    },
    createALikeDbEntry: (myUserId, theirUserId, liked) => {
        return upsertLike(myUserId, theirUserId, liked).then(() => {
            return isItAMatch(myUserId, theirUserId)}).then((result) => {
                if(result.length==2){
                    return Promise.all([createMatches(myUserId, theirUserId),createMatches(theirUserId, myUserId)])}})
    },
    updatePreferences: (req) => {
        return updatePreferences(req)
    },
    updateProfile: (req) => {
        return updateProfile(req)
    },
    createAllMatchesById: (myUserId) => {
        return createAllMatchesById(myUserId)
    }
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      OFFLINE TESTS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

if(process.argv[2]!==undefined && process.argv[3]!==undefined){
    for(var i=process.argv[2]; i<process.argv[3];i++){
        // Run this to populate matches data
        // Run with: node server/data.js <userfrom> <userto>
        createAllMatchesById(i).then((result) => {console.log(result)})
    }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      SEQUELIZE FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function findAccountByEmail (email) {
    return db.account.findOne({
        where: {email:email}
    })
}

function findAccountByFbId (facebookid) {
    return db.account.findOne({
        where: {facebookid: facebookid}
    })
}

function findProfileById (id) {
    return db.profiledata.findOne({where: {userid:id}})
        .then((userData) => {
            userData.age = getAge(userData.birthday)
            return userData
        })
}

function findMyLikesById (myUserId) {
    return db.like.findAll({
        where: {
            userid_A:myUserId,
            liked: true
        }
    })  
}

function findMyMatchesById (myUserId) {
    return db.matches.findAll({
        where: {
            userid_A: myUserId
        }
    })
    .then((resultArray) => {
        var userBArray = []
        resultArray.forEach((object) => {
            userBArray.push(object.userid_B)
        })
        return userBArray
    })
    .then((results) => {
        return db.profiledata.findAll({where: {userid: results}})
    })
    .then((array) => {
        var resultArray = []
        array.forEach((object) => {
            object.age = getAge(object.birthday)
            resultArray.push(object)
        })
        return resultArray
    })
}

function findSeenProfilesById (myUserId) {
    return db.like.findAll({
        where: {
            userid_A:myUserId
        }
    })
    .then((resultArray) => {
        var userBArray = []
        resultArray.forEach((object) => {
            userBArray.push(object.userid_B)
        })
        return userBArray
    })
}

function findListOfProfilesById (myUserId){
    return findProfileById(myUserId)
            .then((myData) => {
                return findSeenProfilesById(myData.userid)
                .then((seenArr) => {return filterProfilesByPreferences(myData, seenArr)})
            })
            .then((resultArray) => {
                resultArray.forEach((object) => {
                    object.age = getAge(object.birthday)
                    console.log(object.userid, object.f_name, object.l_name, object.gender, object.age, object.birthday,object.city)
                })
                return resultArray[0]
            })
}

function filterProfilesByPreferences(myData, seenArr){
    if(!seenArr){seenArr=[]}
    const myAge = getAge(myData.birthday)
    const newestBirthdate = getBirthday(myData.pref_age_min)
    const oldestBirthdate = getBirthday(myData.pref_age_max)
    console.log('My name is',myData.f_name, myData.l_name, ', I am a',myAge,'year old',myData.gender,'living in',myData.city,'and I am looking for a',myData.pref_gender,'born between the dates of',oldestBirthdate,'and',newestBirthdate)
    // Create Gender Arrays
    var myGenderArr
    if (myData.gender=='B'){
        myGenderArr = ['M','F','B']
    } else {
        myGenderArr = [myData.gender, 'B']
    }
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
            userid: {
                [ne]:myData.userid,
                [notIn]: seenArr
            }
        }
    })
}

function createProfileData (profiledata, account) {
    return db.profiledata.create({
        userid: account.id,
        f_name: profiledata.first_name,
        gender: profiledata.genderOptions,
        // profile_picture: userProfile.profile_picture
        birthday: profiledata.birthday
    })
}

function createProfileDataFb (profiledata, account) {
    var fbFirstName = profiledata.displayName
    fbFirstName = fbFirstName.slice(0, fbFirstName.indexOf(' '))
    return db.profiledata.create({
        userid: account.id,
        f_name: fbFirstName,
        gender: profiledata.gender
        // profile_picture: userProfile.profile_picture
        // birthday: profiledata.birthday
    })
}

function updatePreferences(req) {
    console.log(req)
    return db.profiledata.update({
        pref_gender: req.body.pref_gender,
        pref_age_min: req.body.pref_age_min,
        pref_age_max: req.body.pref_age_max
    }, {where: { userid:req.session.passport.user }})
}

function updateProfile(req) {
    console.log(req)
    return db.profiledata.update({
        bio: req.body.bio
    }, {where: { userid:req.session.passport.user }})
}

function createMatches (myUserId, theirUserId){
    return db.matches.create({
        userid_A: myUserId,
        userid_B: theirUserId
    }, {ignoreDuplicates:true})
}

function upsertLike(myUserId, theirUserId, liked) {
    return db.like
        .findOne({ where: {
            userid_A: myUserId,
            userid_B: theirUserId
        }})
        .then((obj) => {
            if(obj) { // update
                return obj.update({
                    liked: liked
                })
            }
            else { // insert
                return db.like.create({
                    userid_A: myUserId,
                    userid_B: theirUserId,
                    liked: liked
                })
            }
        })
    }

function isItAMatch (myUserId, theirUserId){
    return db.like.findAll({
        where: {
            userid_A: [myUserId, theirUserId],
            userid_B: [myUserId, theirUserId]
        }
    })
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                BULK SEQUELIZE FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function createAllMatchesById (myUserId) {
    return findMyLikesById(myUserId)
    .then((resultArray) => {
        var userBArray = []
        resultArray.forEach((object) => {
            userBArray.push(object.userid_B)
        })
        return userBArray
    })
    .then ((resultBArray) => {
        return db.like.findAll({
            where: {
                userid_A:resultBArray,
                userid_B:myUserId,
                liked: true
            }
        })
    })
    .then ((result) => {return likesResultToArray(result)})
    .then ((result) => {return createBulkMatches(result)})
}

function createBulkMatches (entries) {
    return db.matches.bulkCreate(entries, {ignoreDuplicates:true})
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

function likesResultToArray (result) {
    // Also inverts the results A-B B-A
    var array = []
    result.forEach((object) => {
        array.push({userid_A: object.userid_B, userid_B: object.userid_A})
        array.push({userid_A: object.userid_A, userid_B: object.userid_B})
    })
    return array
}