'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // Remove old columns
    await queryInterface.removeColumn('Packages', 'package_Name');
    await queryInterface.removeColumn('Packages', 'recipient_Name');
    await queryInterface.removeColumn('Packages', 'descrtion');

    // Add new columns
    await queryInterface.addColumn('Packages', 'customer_Name', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'description', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Packages', 'package_Size', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'price', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'handling_Fee', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'payment_Method', {
      type: Sequelize.STRING, // 'cash' or 'gcash'
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'payment_Status', {
      type: Sequelize.STRING, // 'paid' or 'unpaid'
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'package_Status', {
      type: Sequelize.STRING, // e.g., 'pending', 'in transit', 'delivered'
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    // Revert new columns
    await queryInterface.dropTable('Packages');
  }
};
