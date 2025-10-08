'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Package.belongsTo(models.Seller, {
        foreignKey: 'seller_Id',
      });
    }
  }
  Package.init({
    seller_Id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Seller", 
        key: "id"
      }},
    package_Name: DataTypes.STRING,
    recipient_Name: DataTypes.STRING,
    descrtion: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Package',
    updatedAt:false,
    createdAt:false
  });
  return Package;
};