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
      account_Id: {
          type: Sequelize.INTEGER,
          allowNull:false,
          references:{
            model: "Accounts",
            key: "id"
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
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
        allowNull: false
      },

    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sellers');
  }
};