'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_Name: {
        type: Sequelize.STRING
      },
      product_Price: {
        type: Sequelize.DECIMAL(10,2)
      },
      product_Stock: {
        type: Sequelize.INTEGER
      },
      product_Expiry: {
        type: Sequelize.DATE
      },
      product_QrCodeValue:{ 
        type: DataTypes.STRING
      },
      product_QrCodePath: {
        type: DataTypes.STRING
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};