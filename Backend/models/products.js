'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Products.init({
    product_Name: DataTypes.STRING,
    product_Price: DataTypes.DECIMAL,
    product_Stock: DataTypes.INTEGER,
    product_Expiry: DataTypes.DATE,
    product_QrCodeValue: DataTypes.STRING,
    product_QrCodePath: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Products',
    updatedAt: false,
    createdAt: false,
  });
  return Products;
};