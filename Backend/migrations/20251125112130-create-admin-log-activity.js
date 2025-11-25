'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AdminLogActivities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      adminId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Admins', // Matches your Admins table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products', // Matches your Products table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      action: {
        type: Sequelize.ENUM('ADD', 'EDIT', 'DELETE', 'ARCHIVE', 'UNARCHIVE'),
        allowNull: false
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('AdminLogActivities', ['adminId']);
    await queryInterface.addIndex('AdminLogActivities', ['productId']);
    await queryInterface.addIndex('AdminLogActivities', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AdminLogActivities');
  }
};