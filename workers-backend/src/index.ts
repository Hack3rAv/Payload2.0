import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { authRoutes } from './routes/auth';
import { payloadRoutes } from './routes/payloads';
import { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware - allow your frontend domain
app.use('*', cors({
  origin: ['https://your-frontend.pages.dev', 'http://localhost:5173'], // Add your Pages domain here
  credentials: true,
}));

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'Payload API is running on Cloudflare Workers',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (no JWT required)
app.route('/api/auth', authRoutes);

// Protected routes - require JWT
app.use('/api/payloads/*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ message: 'No token provided' }, 401);
  }

  try {
    const secret = c.env.JWT_SECRET;
    const decoded = await jwt({ secret }).verify(token);
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ message: 'Invalid token' }, 401);
  }
});

// Payload routes (protected)
app.route('/api/payloads', payloadRoutes);

export default app;
