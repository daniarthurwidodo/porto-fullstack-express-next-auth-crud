import { Router, Response } from 'express';
import { User } from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { userLogger } from '../config/logger';

const router = Router();

// Get all users (protected route)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      users,
      count: users.length,
    });
  } catch (error) {
    userLogger.error({ error, userId: req.user?.id }, 'Get users failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID (protected route)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    userLogger.error({ error, targetUserId: req.params.id, userId: req.user?.id }, 'Get user by ID failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user by ID (protected route)
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({ error: 'Email already in use' });
        return;
      }
    }

    // Update user fields
    const updateData: Partial<{ firstName: string; lastName: string; email: string; isActive: boolean }> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (isActive !== undefined) updateData.isActive = isActive;

    await user.update(updateData);
    await user.reload();

    userLogger.info({ targetUserId: user.id, updatedFields: Object.keys(updateData), userId: req.user?.id }, 'User updated successfully');

    const userResponse = user.toJSON();
    delete (userResponse as any).password;

    res.status(200).json({
      message: 'User updated successfully',
      user: userResponse,
    });
  } catch (error) {
    userLogger.error({ error, targetUserId: req.params.id, userId: req.user?.id }, 'Update user failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile (protected route)
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { firstName, lastName, email } = req.body;

    // Update user fields
    const updateData: Partial<{ firstName: string; lastName: string; email: string }> = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({ error: 'Email already in use' });
        return;
      }
    }

    await req.user.update(updateData);
    await req.user.reload();

    userLogger.info({ userId: req.user.id, updatedFields: Object.keys(updateData) }, 'Profile updated successfully');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: req.user.toJSON(),
    });
  } catch (error) {
    userLogger.error({ error, userId: req.user?.id }, 'Update profile failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user password (protected route)
router.put('/password', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await req.user.checkPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Validate new password length
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long' });
      return;
    }

    // Update password
    await req.user.update({ password: newPassword });

    userLogger.info({ userId: req.user.id }, 'Password updated successfully');

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    userLogger.error({ error, userId: req.user?.id }, 'Update password failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user by ID (protected route)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent users from deleting themselves
    if (req.user && req.user.id === parseInt(id)) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    await user.destroy();

    userLogger.info({ targetUserId: user.id, deletedBy: req.user?.id }, 'User deleted successfully');

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    userLogger.error({ error, targetUserId: req.params.id, userId: req.user?.id }, 'Delete user failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user (protected route)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      isActive: true,
    });

    userLogger.info({ newUserId: user.id, email, createdBy: req.user?.id }, 'User created successfully');

    const userResponse = user.toJSON();
    delete (userResponse as any).password;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
    });
  } catch (error) {
    userLogger.error({ error, email: req.body.email, userId: req.user?.id }, 'Create user failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deactivate user account (protected route)
router.delete('/account', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    await req.user.update({ isActive: false });

    userLogger.info({ userId: req.user.id }, 'Account deactivated successfully');

    res.status(200).json({ message: 'Account deactivated successfully' });
  } catch (error) {
    userLogger.error({ error, userId: req.user?.id }, 'Deactivate account failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
