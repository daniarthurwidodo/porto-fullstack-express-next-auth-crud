import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, generateToken, AuthRequest } from '../../middleware/auth';
import { User } from '../../models/User';

// Mock User model
jest.mock('../../models/User', () => ({
  User: {
    findByPk: jest.fn(),
  },
}));

const mockUser = {
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
};

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(1, 'test@example.com');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      expect(decoded.userId).toBe(1);
      expect(decoded.email).toBe('test@example.com');
    });

    it('should throw error when JWT_SECRET is not configured', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => generateToken(1, 'test@example.com')).toThrow('JWT secret not configured');

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token and set user', async () => {
      const token = generateToken(1, 'test@example.com');
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await authenticateToken(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no token provided', async () => {
      mockRequest.headers = {};

      await authenticateToken(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      await authenticateToken(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user not found', async () => {
      const token = generateToken(999, 'nonexistent@example.com');
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await authenticateToken(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token or user not found' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is inactive', async () => {
      const token = generateToken(1, 'test@example.com');
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      const inactiveUser = { ...mockUser, isActive: false };
      (User.findByPk as jest.Mock).mockResolvedValue(inactiveUser);

      await authenticateToken(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token or user not found' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', async () => {
      // Test token expiration by mocking jwt.verify to throw the correct error
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      await authenticateToken(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token expired' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 when JWT_SECRET is not configured', async () => {
      const token = 'some-token';
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      await authenticateToken(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'JWT secret not configured' });
      expect(mockNext).not.toHaveBeenCalled();

      process.env.JWT_SECRET = originalSecret;
    });
  });
});
