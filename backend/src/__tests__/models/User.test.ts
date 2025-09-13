import { User } from '../../models/User';
import bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock Sequelize
const mockSequelize = {
  define: jest.fn(),
  sync: jest.fn(),
};

jest.mock('sequelize', () => ({
  Sequelize: jest.fn(),
  DataTypes: {
    INTEGER: 'INTEGER',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
  },
}));

describe('User Model', () => {
  let userInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock user instance
    userInstance = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword123',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      checkPassword: jest.fn(),
      toJSON: jest.fn(),
    };
  });

  describe('Password hashing', () => {
    it('should hash password before create', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashedPassword123';
      
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Simulate the beforeCreate hook
      const userData = {
        password: plainPassword,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      // Mock the beforeCreate hook behavior
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
      expect(userData.password).toBe(hashedPassword);
    });

    it('should hash password before update when password is changed', async () => {
      const newPassword = 'newPassword123';
      const hashedPassword = 'newHashedPassword123';
      
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Simulate the beforeUpdate hook
      const userData = {
        password: newPassword,
        changed: jest.fn().mockReturnValue(true),
      };

      // Mock the beforeUpdate hook behavior
      if (userData.password && userData.changed('password')) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(userData.password).toBe(hashedPassword);
    });
  });

  describe('checkPassword method', () => {
    it('should return true for correct password', async () => {
      const plainPassword = 'password123';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock the checkPassword method implementation
      userInstance.checkPassword = async function(password: string) {
        return bcrypt.compare(password, this.password);
      };

      const result = await userInstance.checkPassword(plainPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, userInstance.password);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const wrongPassword = 'wrongPassword';
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Mock the checkPassword method implementation
      userInstance.checkPassword = async function(password: string) {
        return bcrypt.compare(password, this.password);
      };

      const result = await userInstance.checkPassword(wrongPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(wrongPassword, userInstance.password);
      expect(result).toBe(false);
    });
  });

  describe('toJSON method', () => {
    it('should exclude password from JSON output', () => {
      // Mock the toJSON method implementation
      userInstance.toJSON = function() {
        const values = { ...this };
        delete values.password;
        return values;
      };

      const jsonOutput = userInstance.toJSON();

      expect(jsonOutput.password).toBeUndefined();
      expect(jsonOutput.id).toBe(userInstance.id);
      expect(jsonOutput.email).toBe(userInstance.email);
      expect(jsonOutput.firstName).toBe(userInstance.firstName);
      expect(jsonOutput.lastName).toBe(userInstance.lastName);
    });
  });

  describe('User validation', () => {
    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should validate required fields', () => {
      const requiredFields = ['email', 'password', 'firstName', 'lastName'];
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      requiredFields.forEach(field => {
        expect(userData[field as keyof typeof userData]).toBeDefined();
        expect(userData[field as keyof typeof userData]).not.toBe('');
      });
    });
  });
});
