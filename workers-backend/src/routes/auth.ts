import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { Bindings } from '../types';

export const authRoutes = new Hono<{ Bindings: Bindings }>();

// Login endpoint
authRoutes.post('/login', async (c) => {
  try {
    const { password } = await c.req.json();

    if (!password) {
      return c.json({ message: 'Password is required' }, 400);
    }

    const adminPassword = c.env.ADMIN_PASSWORD || 'root';

    if (password !== adminPassword) {
      return c.json({ message: 'Invalid credentials' }, 401);
    }

    // Create JWT token
    const payload = {
      sub: '1',
      username: 'admin',
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    return c.json({
      message: 'Login successful',
      token,
      user: { id: 1, username: 'admin' }
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ message: 'Server error' }, 500);
  }
});

// Get current user
authRoutes.get('/current-user', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ user: null });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = await c.env.JWT_SECRET ? 
      await import('hono/jwt').then(({ verify }) => verify(token, c.env.JWT_SECRET)) :
      null;

    if (decoded) {
      return c.json({ 
        user: { 
          id: parseInt(decoded.sub as string), 
          username: decoded.username 
        } 
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
  }

  return c.json({ user: null });
});

// Logout endpoint (client-side token removal)
authRoutes.post('/logout', (c) => {
  return c.json({ message: 'Logged out successfully' });
});
