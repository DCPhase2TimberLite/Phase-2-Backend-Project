'use strict';
module.exports = (sequelize, DataTypes) => {
  const like = sequelize.define('like', {
    userid_A: DataTypes.INTEGER,
    userid_B: DataTypes.INTEGER,
    liked: DataTypes.BOOLEAN
  }, {});
  like.associate = function(models) {
    // associations can be defined here
  };
  return like;
};