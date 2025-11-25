'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('admins', [
      {
        username: 'newadmin',
        password: 'newadmin123',
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
