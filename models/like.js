'use strict';
module.exports = (sequelize, DataTypes) => {
  const like = sequelize.define('like', {
    userid: DataTypes.INTEGER,
    liked_userid: DataTypes.INTEGER
  }, {});
  like.associate = function(models) {
    // associations can be defined here
  };
  return like;
};