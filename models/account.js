'use strict';
module.exports = (sequelize, DataTypes) => {
  const account = sequelize.define('account', {
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      }
    },
    pass: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      }
    },
  }, {});
  account.associate = function(models) {
    // associations can be defined here
  };
  return account;
};