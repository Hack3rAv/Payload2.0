// server/index.ts
import express2 from "express";
import session2 from "express-session";
import cors from "cors";
import path5 from "path";
import dotenv from "dotenv";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  payloads;
  userId;
  payloadId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.payloads = /* @__PURE__ */ new Map();
    this.userId = 1;
    this.payloadId = 1;
    this.createUser({
      username: "root",
      password: "toor"
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getPayloads() {
    return Array.from(this.payloads.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  async getPayload(id) {
    return this.payloads.get(id);
  }
  async createPayload(insertPayload) {
    const id = this.payloadId++;
    const payload = {
      ...insertPayload,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.payloads.set(id, payload);
    return payload;
  }
  async deletePayload(id) {
    return this.payloads.delete(id);
  }
};
var storage = new MemStorage();

// server/routes.ts
import session from "express-session";

// server/middleware/auth.ts
var login = async (req, res) => {
  try {
    const { password } = req.body;
    console.log("Server received login attempt with password:", password);
    if (!password) {
      return res.status(400).json({
        message: "Password is required"
      });
    }
    const adminPassword = process.env.ADMIN_PASSWORD || "root";
    if (password !== adminPassword) {
      console.log("Password validation failed");
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }
    req.session.user = {
      id: 1,
      username: "admin"
    };
    console.log("Login successful, session created:", req.session.user);
    return res.status(200).json({
      message: "Login successful",
      user: req.session.user
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};
var logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logged out successfully" });
  });
};
var isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
var getCurrentUser = (req, res) => {
  if (!req.session.user) {
    return res.status(200).json({ user: null });
  }
  return res.status(200).json({ user: req.session.user });
};

// server/middleware/fileUpload.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
var uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: function(_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function(_req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});
var fileFilter = (_req, file, cb) => {
  cb(null, true);
};
var upload = multer({
  storage: storage2,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024
    // 100MB max file size
  }
});
var deleteFile = (filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(uploadDir, filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
var getFilePath = (filename) => {
  return path.join(uploadDir, filename);
};

// server/routes.ts
import fs2 from "fs";
import path2 from "path";

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var payloads = pgTable("payloads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  framework: text("framework").notNull(),
  description: text("description").notNull(),
  listeningDetails: text("listening_details").notNull(),
  fileSize: integer("file_size").notNull(),
  // Size in bytes
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertPayloadSchema = createInsertSchema(payloads).pick({
  filename: true,
  originalName: true,
  framework: true,
  description: true,
  listeningDetails: true,
  fileSize: true
});
var loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.use(session({
    secret: "neopix-hacker-platform-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours 
    }
  }));
  const uploadsDir = path2.join(process.cwd(), "uploads");
  if (!fs2.existsSync(uploadsDir)) {
    fs2.mkdirSync(uploadsDir, { recursive: true });
  }
  app2.post("/api/auth/login", login);
  app2.post("/api/auth/logout", logout);
  app2.get("/api/auth/current-user", getCurrentUser);
  app2.get("/api/payloads", async (_req, res) => {
    try {
      const payloads2 = await storage.getPayloads();
      res.json(payloads2);
    } catch (error) {
      console.error("Error fetching payloads:", error);
      res.status(500).json({ message: "Failed to fetch payloads" });
    }
  });
  app2.post("/api/payloads", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const { framework, description, listeningDetails } = req.body;
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
      console.error("Error uploading payload:", error);
      if (req.file) {
        try {
          await deleteFile(req.file.filename);
        } catch (deleteError) {
          console.error("Error deleting file after failed upload:", deleteError);
        }
      }
      res.status(500).json({ message: "Failed to upload payload" });
    }
  });
  app2.delete("/api/payloads/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid payload ID" });
      }
      const payload = await storage.getPayload(id);
      if (!payload) {
        return res.status(404).json({ message: "Payload not found" });
      }
      try {
        await deleteFile(payload.filename);
      } catch (deleteError) {
        console.error("Error deleting file:", deleteError);
        return res.status(500).json({ message: "Failed to delete file" });
      }
      const deleted = await storage.deletePayload(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete payload record" });
      }
      res.json({ message: "Payload deleted successfully" });
    } catch (error) {
      console.error("Error deleting payload:", error);
      res.status(500).json({ message: "Failed to delete payload" });
    }
  });
  app2.get("/api/download/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid payload ID" });
      }
      const payload = await storage.getPayload(id);
      if (!payload) {
        return res.status(404).json({ message: "Payload not found" });
      }
      const filePath = getFilePath(payload.filename);
      if (!fs2.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      res.setHeader("Content-Disposition", `attachment; filename="${payload.originalName}"`);
      res.setHeader("Content-Type", "application/octet-stream");
      const fileStream = fs2.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error downloading payload:", error);
      res.status(500).json({ message: "Failed to download payload" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
dotenv.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "https://your-frontend.vercel.app",
    credentials: true
  })
);
app.use(
  session2({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none"
    }
  })
);
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
app.use("/uploads", express2.static(path5.join(__dirname, "uploads")));
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5e3;
  server.listen(
    {
      port: Number(port),
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`\u{1F680} Server running on port ${port}`);
    }
  );
})();
