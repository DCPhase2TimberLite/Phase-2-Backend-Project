'use strict';
module.exports = (sequelize, DataTypes) => {
  const dislike = sequelize.define('dislike', {
    userid: DataTypes.INTEGER,
    disliked_userid: DataTypes.INTEGER
  }, {});
  dislike.associate = function(models) {
    // associations can be defined here
  };
  return dislike;
};