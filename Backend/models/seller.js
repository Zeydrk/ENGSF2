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
      }),

      Seller.belongsTo(models.Account,{
        foreignKey: 'account_Id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
      
    }
  }
  Seller.init({
    account_Id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Account",
        key: "id"
      }
    },
    seller_FName: DataTypes.STRING,
    seller_MName: DataTypes.STRING,
    seller_LName: DataTypes.STRING,
    seller_Email: DataTypes.STRING,
    seller_Password: DataTypes.STRING,
    seller_ContactNo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Seller',
    updatedAt: false,
    createdAt: false,
  });
  return Seller;
};