import { Hono } from 'hono';
import { Bindings, Payload } from '../types';

export const payloadRoutes = new Hono<{ Bindings: Bindings }>();

// Get all payloads
payloadRoutes.get('/', async (c) => {
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
payloadRoutes.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const framework = formData.get('framework') as string;
    const description = formData.get('description') as string;
    const listeningDetails = formData.get('listeningDetails') as string;

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
payloadRoutes.delete('/:id', async (c) => {
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

    const payload = results[0] as Payload;

    // Delete file from R2
    try {
      await c.env.PAYLOAD_BUCKET.delete(payload.filename);
    } catch (deleteError) {
      console.error('Error deleting file from R2:', deleteError);
      // Continue with database deletion even if file deletion fails
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
payloadRoutes.get('/download/:id', async (c) => {
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

    const payload = results[0] as Payload;

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
