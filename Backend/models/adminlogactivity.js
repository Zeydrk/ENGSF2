'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdminLogActivity extends Model {
    static associate(models) {
      // Associate with Admin
      AdminLogActivity.belongsTo(models['Admin'], {
        foreignKey: 'adminId',
        as: 'admin'
      });
      // Associate with Product
      AdminLogActivity.belongsTo(models['Products'], {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }
  AdminLogActivity.init({
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Admin',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.ENUM('ADD', 'EDIT', 'DELETE', 'ARCHIVE', 'UNARCHIVE'),
      allowNull: false
    },
    details: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'AdminLogActivity',
    tableName: 'AdminLogActivities'
  });
  return AdminLogActivity;
};