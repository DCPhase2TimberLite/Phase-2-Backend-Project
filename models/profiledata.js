'use strict';
module.exports = (sequelize, DataTypes) => {
  const profiledata = sequelize.define('profiledata', {
    userid: DataTypes.INTEGER,
    f_name: DataTypes.STRING,
    l_name: DataTypes.STRING,
    gender: DataTypes.STRING,
    profile_picture: DataTypes.STRING,
    birthday: DataTypes.DATEONLY,
    occupation: DataTypes.STRING,
    city: DataTypes.STRING,
    bio: DataTypes.STRING,
    pref_gender: DataTypes.STRING,
    pref_age_min: DataTypes.INTEGER,
    pref_age_max: DataTypes.INTEGER
  }, {});
  profiledata.associate = function(models) {
    // associations can be defined here
  };
  return profiledata;
};