import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const payloads = pgTable("payloads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  framework: text("framework").notNull(),
  description: text("description").notNull(),
  listeningDetails: text("listening_details").notNull(),
  fileSize: integer("file_size").notNull(), // Size in bytes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPayloadSchema = createInsertSchema(payloads).pick({
  filename: true,
  originalName: true,
  framework: true,
  description: true,
  listeningDetails: true,
  fileSize: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPayload = z.infer<typeof insertPayloadSchema>;
export type Payload = typeof payloads.$inferSelect;
