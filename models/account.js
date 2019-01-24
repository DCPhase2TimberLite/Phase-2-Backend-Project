'use strict';
module.exports = (sequelize, DataTypes) => {
  const account = sequelize.define('account', {
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: false,
      }
    },
    pass: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: false,
      }
    },
    facebookid: {
      type: DataTypes.BIGINT,
      validate: {
        notEmpty: false,
      }
    },
  }, {});
  account.associate = function(models) {
    // associations can be defined here
  };
  return account;
};