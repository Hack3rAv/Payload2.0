// Complete Cloudflare Workers Code - Copy and paste this entire file into Workers dashboard

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: ['*'], // Will update this later with your Pages URL
  credentials: true,
}));

// Types and interfaces
interface Payload {
  id: number;
  filename: string;
  originalName: string;
  framework: string;
  description: string;
  listeningDetails: string;
  fileSize: number;
  createdAt: string;
}

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'Payload API is running on Cloudflare Workers',
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
app.post('/api/auth/login', async (c) => {
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

app.get('/api/auth/current-user', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ user: null });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = await verify(token, c.env.JWT_SECRET);

    if (decoded) {
      return c.json({ 
        user: { 
          id: parseInt(decoded.sub), 
          username: decoded.username 
        } 
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
  }

  return c.json({ user: null });
});

app.post('/api/auth/logout', (c) => {
  return c.json({ message: 'Logged out successfully' });
});

// JWT Middleware for protected routes
app.use('/api/payloads/*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ message: 'No token provided' }, 401);
  }

  try {
    const secret = c.env.JWT_SECRET;
    const decoded = await verify(token, secret);
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ message: 'Invalid token' }, 401);
  }
});

// Payload Routes

// Get all payloads
app.get('/api/payloads', async (c) => {
  try {
    const stmt = c.env.DB.prepare(`
      SELECT * FROM payloads 
      ORDER BY created_at DESC
    `);
    
    const { results } = await stmt.all();
    
    return c.json(results);
  } catch (error) {
    console.error('Error fetching payloads:', error);
    return c.json({ message: 'Failed to fetch payloads' }, 500);
  }
});

// Upload new payload
app.post('/api/payloads', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    const framework = formData.get('framework');
    const description = formData.get('description');
    const listeningDetails = formData.get('listeningDetails');

    if (!file) {
      return c.json({ message: 'No file uploaded' }, 400);
    }

    if (!framework || !description || !listeningDetails) {
      return c.json({ message: 'Missing required fields' }, 400);
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || '';
    const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;

    // Upload file to R2
    const fileArrayBuffer = await file.arrayBuffer();
    await c.env.PAYLOAD_BUCKET.put(uniqueFilename, fileArrayBuffer, {
      customMetadata: {
        originalName: file.name,
        contentType: file.type,
      }
    });

    // Save metadata to D1 database
    const stmt = c.env.DB.prepare(`
      INSERT INTO payloads (filename, original_name, framework, description, listening_details, file_size, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const result = await stmt.bind(
      uniqueFilename,
      file.name,
      framework,
      description,
      listeningDetails,
      file.size
    ).run();

    if (!result.success) {
      // If database insert fails, clean up the uploaded file
      await c.env.PAYLOAD_BUCKET.delete(uniqueFilename);
      throw new Error('Failed to save payload metadata');
    }

    // Return the created payload
    const getStmt = c.env.DB.prepare('SELECT * FROM payloads WHERE id = ?');
    const { results } = await getStmt.bind(result.meta.last_row_id).all();
    
    return c.json(results[0], 201);

  } catch (error) {
    console.error('Error uploading payload:', error);
    return c.json({ message: 'Failed to upload payload' }, 500);
  }
});

// Delete payload
app.delete('/api/payloads/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({ message: 'Invalid payload ID' }, 400);
    }

    // Get payload info first
    const getStmt = c.env.DB.prepare('SELECT * FROM payloads WHERE id = ?');
    const { results } = await getStmt.bind(id).all();
    
    if (results.length === 0) {
      return c.json({ message: 'Payload not found' }, 404);
    }

    const payload = results[0];

    // Delete file from R2
    try {
      await c.env.PAYLOAD_BUCKET.delete(payload.filename);
    } catch (deleteError) {
      console.error('Error deleting file from R2:', deleteError);
    }

    // Delete from database
    const deleteStmt = c.env.DB.prepare('DELETE FROM payloads WHERE id = ?');
    const result = await deleteStmt.bind(id).run();

    if (!result.success) {
      return c.json({ message: 'Failed to delete payload' }, 500);
    }

    return c.json({ message: 'Payload deleted successfully' });

  } catch (error) {
    console.error('Error deleting payload:', error);
    return c.json({ message: 'Failed to delete payload' }, 500);
  }
});

// Download payload
app.get('/api/payloads/download/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({ message: 'Invalid payload ID' }, 400);
    }

    // Get payload info
    const stmt = c.env.DB.prepare('SELECT * FROM payloads WHERE id = ?');
    const { results } = await stmt.bind(id).all();
    
    if (results.length === 0) {
      return c.json({ message: 'Payload not found' }, 404);
    }

    const payload = results[0];

    // Get file from R2
    const object = await c.env.PAYLOAD_BUCKET.get(payload.filename);
    
    if (!object) {
      return c.json({ message: 'File not found' }, 404);
    }

    // Return file with proper headers
    return new Response(object.body, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${payload.originalName}"`,
        'Content-Length': payload.fileSize.toString(),
      },
    });

  } catch (error) {
    console.error('Error downloading payload:', error);
    return c.json({ message: 'Failed to download payload' }, 500);
  }
});

export default app;
