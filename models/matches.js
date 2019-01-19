'use strict';
module.exports = (sequelize, DataTypes) => {
  const matches = sequelize.define('matches', {
    userid_A: DataTypes.INTEGER,
    userid_B: DataTypes.INTEGER
  }, {});
  matches.associate = function(models) {
    // associations can be defined here
  };
  return matches;
};