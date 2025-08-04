import { users, type User, type InsertUser, payloads, type Payload, type InsertPayload } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Payload related methods
  getPayloads(): Promise<Payload[]>;
  getPayload(id: number): Promise<Payload | undefined>;
  createPayload(payload: InsertPayload): Promise<Payload>;
  deletePayload(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private payloads: Map<number, Payload>;
  private userId: number;
  private payloadId: number;

  constructor() {
    this.users = new Map();
    this.payloads = new Map();
    this.userId = 1;
    this.payloadId = 1;
    
    // Add root user for admin access
    this.createUser({
      username: "root",
      password: "toor"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPayloads(): Promise<Payload[]> {
    return Array.from(this.payloads.values()).sort((a, b) => {
      // Sort by creation date, newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getPayload(id: number): Promise<Payload | undefined> {
    return this.payloads.get(id);
  }

  async createPayload(insertPayload: InsertPayload): Promise<Payload> {
    const id = this.payloadId++;
    const payload: Payload = { 
      ...insertPayload, 
      id, 
      createdAt: new Date()
    };
    this.payloads.set(id, payload);
    return payload;
  }

  async deletePayload(id: number): Promise<boolean> {
    return this.payloads.delete(id);
  }
}

export const storage = new MemStorage();
