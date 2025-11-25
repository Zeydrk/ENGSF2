'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('admins', [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', {
      id: {
        [Sequelize.Op.in]: [1],
      }
    });
  }
};
