'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      role:{
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
<<<<<<<< HEAD:Backend/migrations/20250925092045-create-account.js
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
========
      product_QrCodeValue:{ 
        type: Sequelize.STRING
      },
      product_QrCodePath: {
        type: Sequelize.STRING
      },
>>>>>>>> 372e365fbdf671ba332218d310481e04fd82c2e0:Backend/migrations/20251005095218-create-products.js
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Accounts');
  }
};