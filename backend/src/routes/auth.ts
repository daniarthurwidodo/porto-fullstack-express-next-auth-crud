import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';
import { authLogger } from '../config/logger';

const router = Router();

// Register route
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'User already exists with this email' });
      return;
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
    });

    authLogger.info({ userId: user.id, email: user.email }, 'User registered successfully');

    // Generate token
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    authLogger.error({ error, email: req.body.email }, 'Registration failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      authLogger.warn({ email }, 'Login attempt with non-existent email');
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      authLogger.warn({ userId: user.id, email }, 'Login attempt on deactivated account');
      res.status(401).json({ error: 'Account is deactivated' });
      return;
    }

    // Verify password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      authLogger.warn({ userId: user.id, email }, 'Login attempt with invalid password');
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    authLogger.info({ userId: user.id, email }, 'User logged in successfully');

    // Generate token
    const token = generateToken(user.id, user.email);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    authLogger.error({ error, email: req.body.email }, 'Login failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    res.status(200).json({
      user: req.user.toJSON(),
    });
  } catch (error) {
    authLogger.error({ error, userId: req.user?.id }, 'Get profile failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout route (client-side token removal)
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({ message: 'Logout successful' });
});

export default router;
