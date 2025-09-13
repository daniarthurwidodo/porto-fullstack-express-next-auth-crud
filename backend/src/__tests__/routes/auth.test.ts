import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth';
import { User } from '../../models/User';
import { generateToken } from '../../middleware/auth';

// Mock User model
jest.mock('../../models/User', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const mockUser = {
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  checkPassword: jest.fn(),
  toJSON: jest.fn().mockReturnValue({
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
  }),
};

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...userData,
        toJSON: jest.fn().mockReturnValue({ ...mockUser, ...userData }),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(User.create).toHaveBeenCalledWith(userData);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // missing password, firstName, lastName
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('All fields are required');
    });

    it('should return 409 when user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User already exists with this email');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUser.checkPassword.mockResolvedValue(true);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: loginData.email } });
      expect(mockUser.checkPassword).toHaveBeenCalledWith(loginData.password);
    });

    it('should return 400 when email or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' }); // missing password

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });

    it('should return 401 when user does not exist', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      (User.findOne as jest.Mock).mockResolvedValue(inactiveUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Account is deactivated');
    });

    it('should return 401 when password is invalid', async () => {
      mockUser.checkPassword.mockResolvedValue(false);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
      expect(mockUser.checkPassword).toHaveBeenCalledWith('wrongpassword');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile when authenticated', async () => {
      const token = generateToken(1, 'test@example.com');
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
    });

    it('should return 401 when no token provided', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully when authenticated', async () => {
      const token = generateToken(1, 'test@example.com');
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');
    });
  });
});
