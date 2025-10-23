'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sellers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      seller_FName: {
        type: Sequelize.STRING
      },
      seller_MName: {
        type: Sequelize.STRING
      },
      seller_LName: {
        type: Sequelize.STRING
      },
      seller_Email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      seller_Phone: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sellers');
  }
};