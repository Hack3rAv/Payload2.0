import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from 'express-session';
import { login, logout, isAuthenticated, getCurrentUser } from './middleware/auth';
import { upload, deleteFile, getFilePath } from './middleware/fileUpload';
import fs from 'fs';
import path from 'path';
import { insertPayloadSchema } from '@shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(session({
    secret: 'neopix-hacker-platform-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours 
    }
  }));

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Authentication routes
  app.post('/api/auth/login', login);
  app.post('/api/auth/logout', logout);
  app.get('/api/auth/current-user', getCurrentUser);

  // Payload routes
  // Get all payloads - public route
  app.get('/api/payloads', async (_req: Request, res: Response) => {
    try {
      const payloads = await storage.getPayloads();
      res.json(payloads);
    } catch (error) {
      console.error('Error fetching payloads:', error);
      res.status(500).json({ message: 'Failed to fetch payloads' });
    }
  });

  // Upload new payload - protected route
  app.post('/api/payloads', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { framework, description, listeningDetails } = req.body;
      
      // Validate payload data
      const payloadData = insertPayloadSchema.parse({
        filename: req.file.filename,
        originalName: req.file.originalname,
        framework,
        description,
        listeningDetails,
        fileSize: req.file.size
      });

      const payload = await storage.createPayload(payloadData);
      res.status(201).json(payload);
    } catch (error) {
      console.error('Error uploading payload:', error);
      
      // If there was an uploaded file but payload creation failed, clean up the file
      if (req.file) {
        try {
          await deleteFile(req.file.filename);
        } catch (deleteError) {
          console.error('Error deleting file after failed upload:', deleteError);
        }
      }
      
      res.status(500).json({ message: 'Failed to upload payload' });
    }
  });

  // Delete payload - protected route
  app.delete('/api/payloads/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid payload ID' });
      }

      const payload = await storage.getPayload(id);
      if (!payload) {
        return res.status(404).json({ message: 'Payload not found' });
      }

      // Delete the file from disk
      try {
        await deleteFile(payload.filename);
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
        return res.status(500).json({ message: 'Failed to delete file' });
      }

      // Delete the payload from storage
      const deleted = await storage.deletePayload(id);
      if (!deleted) {
        return res.status(500).json({ message: 'Failed to delete payload record' });
      }

      res.json({ message: 'Payload deleted successfully' });
    } catch (error) {
      console.error('Error deleting payload:', error);
      res.status(500).json({ message: 'Failed to delete payload' });
    }
  });

  // Download payload route - public
  app.get('/api/download/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid payload ID' });
      }

      const payload = await storage.getPayload(id);
      if (!payload) {
        return res.status(404).json({ message: 'Payload not found' });
      }

      const filePath = getFilePath(payload.filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Set appropriate headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${payload.originalName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // Stream the file to the client
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading payload:', error);
      res.status(500).json({ message: 'Failed to download payload' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
