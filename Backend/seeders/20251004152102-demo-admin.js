'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('admins', [
      {
        id: 1,
        email: 'admin@gmail.com',
        password: 'admin123',
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', {
      admin_id: {
        [Sequelize.Op.in]: [1],
      }
    });
  }
};
