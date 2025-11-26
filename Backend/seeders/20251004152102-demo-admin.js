'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // First, make sure you have run the account seeder
    // This assumes the first account has id: 1
    await queryInterface.bulkInsert('Admins', [{
      account_Id: 1, // ADD THIS - must match an existing account ID
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'admin123',
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Admins', {
      id: {
        [Sequelize.Op.in]: [1],
      }
    });
  }
};