import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '@shared/schema';
import session from 'express-session';

declare module 'express-session' {
  interface Session {
    user?: {
      id: number;
      username: string;
    };
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    // Simplified login that only requires password
    const { password } = req.body;
    
    console.log('Server received login attempt with password:', password);
    
    if (!password) {
      return res.status(400).json({ 
        message: 'Password is required'
      });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'root';

    if (password !== adminPassword) {
      console.log('Password validation failed');
      return res.status(401).json({ 
        message: 'Invalid credentials'
      });
    }

    // Set session
    req.session.user = {
      id: 1,
      username: 'admin'
    };

    console.log('Login successful, session created:', req.session.user);
    
    return res.status(200).json({ 
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Server error'
    });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(200).json({ user: null });
  }
  return res.status(200).json({ user: req.session.user });
};