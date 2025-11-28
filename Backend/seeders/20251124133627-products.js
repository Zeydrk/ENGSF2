'use strict';
const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const products = [];

    for (let i = 0; i < 20; i++) { 
      products.push({
        product_Name: faker.commerce.productName(),
        product_Description: faker.commerce.productDescription(),
        product_RetailPrice: parseFloat(faker.commerce.price(10, 2000, 2)),
        product_BuyingPrice: parseFloat(faker.commerce.price(5, 1500, 2)),
        product_Stock: faker.number.int({ min: 0, max: 100 }),
        product_Expiry: faker.date.future(),
        product_Category: faker.commerce.department(),
        product_QrCodeValue: faker.string.uuid(),
        product_QrCodePath: `/qrcodes/${faker.string.uuid()}.png`,
        isArchived: faker.datatype.boolean(0.1),
      });
    }

    await queryInterface.bulkInsert('Products', products, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  }
};
