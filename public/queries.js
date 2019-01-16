const db = require('./db')

// load the user's preferences
const UserPreferencesQuery = `
    SELECT Pref_Gender, Pref_AgeHigh, Pref_AgeLow
    FROM Profile_Data
    Where UserID = [current user's ID]
`
function getUserPreferences() {
    return db.query(UserPreferencesQuery)
}

// load all profiles
const AllProfilesQuery = `
    SELECT Photo, FName, Birth_Yr, Bio
    FROM Profile_Data
    WHERE Gender = [current user's Pref_Gender]
    AND [current user's Pref_AgeLow] < Age > [current user's Pref_AgeHigh]
`
function getAllProfiles() {
    return db.query(AllProfilesQuery)
}

module.exports = {
    getUserPreferences: getUserPreferences,
    getAllProfiles: getAllProfiles,
}