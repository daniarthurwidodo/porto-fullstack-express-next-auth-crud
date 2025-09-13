'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const users = [
      {
        email: 'john.doe@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'jane.smith@example.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'michael.johnson@example.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Johnson',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'sarah.wilson@example.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Wilson',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'david.brown@example.com',
        password: hashedPassword,
        firstName: 'David',
        lastName: 'Brown',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'emily.davis@example.com',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Davis',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'james.miller@example.com',
        password: hashedPassword,
        firstName: 'James',
        lastName: 'Miller',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'lisa.garcia@example.com',
        password: hashedPassword,
        firstName: 'Lisa',
        lastName: 'Garcia',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'robert.martinez@example.com',
        password: hashedPassword,
        firstName: 'Robert',
        lastName: 'Martinez',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'jennifer.anderson@example.com',
        password: hashedPassword,
        firstName: 'Jennifer',
        lastName: 'Anderson',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'william.taylor@example.com',
        password: hashedPassword,
        firstName: 'William',
        lastName: 'Taylor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'amanda.thomas@example.com',
        password: hashedPassword,
        firstName: 'Amanda',
        lastName: 'Thomas',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'christopher.white@example.com',
        password: hashedPassword,
        firstName: 'Christopher',
        lastName: 'White',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'michelle.harris@example.com',
        password: hashedPassword,
        firstName: 'Michelle',
        lastName: 'Harris',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'daniel.clark@example.com',
        password: hashedPassword,
        firstName: 'Daniel',
        lastName: 'Clark',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'stephanie.lewis@example.com',
        password: hashedPassword,
        firstName: 'Stephanie',
        lastName: 'Lewis',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'matthew.walker@example.com',
        password: hashedPassword,
        firstName: 'Matthew',
        lastName: 'Walker',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'nicole.hall@example.com',
        password: hashedPassword,
        firstName: 'Nicole',
        lastName: 'Hall',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'anthony.allen@example.com',
        password: hashedPassword,
        firstName: 'Anthony',
        lastName: 'Allen',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'kimberly.young@example.com',
        password: hashedPassword,
        firstName: 'Kimberly',
        lastName: 'Young',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'joshua.king@example.com',
        password: hashedPassword,
        firstName: 'Joshua',
        lastName: 'King',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'ashley.wright@example.com',
        password: hashedPassword,
        firstName: 'Ashley',
        lastName: 'Wright',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'andrew.lopez@example.com',
        password: hashedPassword,
        firstName: 'Andrew',
        lastName: 'Lopez',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'megan.hill@example.com',
        password: hashedPassword,
        firstName: 'Megan',
        lastName: 'Hill',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'kevin.green@example.com',
        password: hashedPassword,
        firstName: 'Kevin',
        lastName: 'Green',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
