'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Admins',[
      {
        username:'NewAdmin',
        password:'newadmin123',
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    
    await queryInterface.bulkDelete('Admins', {
      username:'NewAdmin'
    });
   
  }
};
