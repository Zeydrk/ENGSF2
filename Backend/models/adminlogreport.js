'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdminLogReport extends Model {
    static associate(models) {
      // Define associations here
      AdminLogReport.belongsTo(models['Admin'], {
        foreignKey: 'adminId',
        as: 'admin'
      });
      AdminLogReport.belongsTo(models['Products'], {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }
  AdminLogReport.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
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
      type: DataTypes.ENUM('add', 'delete', 'edit', 'archive', 'unarchive'),
      allowNull: false
    },
    details: {
      type: DataTypes.TEXT
    },
    dateCreated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'AdminLogReport',
    tableName: 'AdminLogReports',
    timestamps: true
  });
  return AdminLogReport;
};