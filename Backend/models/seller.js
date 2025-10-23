'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Seller extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Seller.hasMany(models.Package,{
        foreignKey: 'seller_Id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    }
  }
  Seller.init({
    seller_FName: DataTypes.STRING,
    seller_MName: DataTypes.STRING,
    seller_LName: DataTypes.STRING,
    seller_Phone: DataTypes.STRING,
    seller_Email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Seller',
    updatedAt: false,
    createdAt: false,
  });
  return Seller;
};