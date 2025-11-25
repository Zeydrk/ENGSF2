'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    static associate(models) {
      Package.belongsTo(models.Seller, {
        foreignKey: 'seller_Id',
      });
    }
  }

  Package.init({
    seller_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Sellers",
        key: "id"
      }
    },
    description: DataTypes.STRING,
    customer_Name: DataTypes.STRING,
    package_Size: DataTypes.STRING,
    price: DataTypes.DECIMAL(10,2),
    handling_Fee: DataTypes.DECIMAL(10,2),
    payment_Status: DataTypes.STRING,       // paid / unpaid
    payment_Method: DataTypes.STRING,       // cash / gcash
    package_Status: DataTypes.STRING        // pending / claimed
  }, {
    sequelize,
    modelName: 'Package',
    updatedAt: false,
    createdAt: false
  });

  return Package;
};
