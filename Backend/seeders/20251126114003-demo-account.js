'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Accounts', [{
      email: 'admin@example.com',
      password: 'hashed_password_here', // Make sure to hash passwords
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    },], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Accounts', null, {});
  }
};