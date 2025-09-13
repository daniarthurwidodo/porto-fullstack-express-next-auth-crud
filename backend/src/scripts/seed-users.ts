import { sequelize } from '../config/database';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

const seedUsers = async () => {
  try {
    // Check if users already exist
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log(`Database already has ${existingUsers} users. Skipping seed...`);
      return;
    }

    console.log('Seeding 25 users...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = [
      { email: 'john.doe@example.com', password: hashedPassword, firstName: 'John', lastName: 'Doe' },
      { email: 'jane.smith@example.com', password: hashedPassword, firstName: 'Jane', lastName: 'Smith' },
      { email: 'michael.johnson@example.com', password: hashedPassword, firstName: 'Michael', lastName: 'Johnson' },
      { email: 'sarah.wilson@example.com', password: hashedPassword, firstName: 'Sarah', lastName: 'Wilson' },
      { email: 'david.brown@example.com', password: hashedPassword, firstName: 'David', lastName: 'Brown' },
      { email: 'emily.davis@example.com', password: hashedPassword, firstName: 'Emily', lastName: 'Davis' },
      { email: 'james.miller@example.com', password: hashedPassword, firstName: 'James', lastName: 'Miller' },
      { email: 'lisa.garcia@example.com', password: hashedPassword, firstName: 'Lisa', lastName: 'Garcia' },
      { email: 'robert.martinez@example.com', password: hashedPassword, firstName: 'Robert', lastName: 'Martinez' },
      { email: 'jennifer.anderson@example.com', password: hashedPassword, firstName: 'Jennifer', lastName: 'Anderson' },
      { email: 'william.taylor@example.com', password: hashedPassword, firstName: 'William', lastName: 'Taylor' },
      { email: 'amanda.thomas@example.com', password: hashedPassword, firstName: 'Amanda', lastName: 'Thomas' },
      { email: 'christopher.white@example.com', password: hashedPassword, firstName: 'Christopher', lastName: 'White' },
      { email: 'michelle.harris@example.com', password: hashedPassword, firstName: 'Michelle', lastName: 'Harris' },
      { email: 'daniel.clark@example.com', password: hashedPassword, firstName: 'Daniel', lastName: 'Clark' },
      { email: 'stephanie.lewis@example.com', password: hashedPassword, firstName: 'Stephanie', lastName: 'Lewis' },
      { email: 'matthew.walker@example.com', password: hashedPassword, firstName: 'Matthew', lastName: 'Walker' },
      { email: 'nicole.hall@example.com', password: hashedPassword, firstName: 'Nicole', lastName: 'Hall' },
      { email: 'anthony.allen@example.com', password: hashedPassword, firstName: 'Anthony', lastName: 'Allen' },
      { email: 'kimberly.young@example.com', password: hashedPassword, firstName: 'Kimberly', lastName: 'Young' },
      { email: 'joshua.king@example.com', password: hashedPassword, firstName: 'Joshua', lastName: 'King' },
      { email: 'ashley.wright@example.com', password: hashedPassword, firstName: 'Ashley', lastName: 'Wright' },
      { email: 'andrew.lopez@example.com', password: hashedPassword, firstName: 'Andrew', lastName: 'Lopez' },
      { email: 'megan.hill@example.com', password: hashedPassword, firstName: 'Megan', lastName: 'Hill' },
      { email: 'kevin.green@example.com', password: hashedPassword, firstName: 'Kevin', lastName: 'Green' }
    ];

    // Use bulkCreate to insert all users at once
    await User.bulkCreate(users, {
      validate: true,
      individualHooks: false // Skip individual hooks since we're pre-hashing passwords
    });

    console.log('✅ Successfully seeded 25 users');
    console.log('📧 All users have email format: [name]@example.com');
    console.log('🔑 All users have password: password123');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await sequelize.close();
  }
};

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedUsers();
}

export { seedUsers };
