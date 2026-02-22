import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT UNIQUE,
    email TEXT,
    real_name TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
`);

export interface User {
  id: number;
  username: string;
  password: string;
  phone: string | null;
  email: string | null;
  real_name: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export const createUser = db.prepare(`
  INSERT INTO users (username, password, phone, email, real_name, address)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export const getUserByUsername = db.prepare(`
  SELECT * FROM users WHERE username = ?
`);

export const getUserByPhone = db.prepare(`
  SELECT * FROM users WHERE phone = ?
`);

export const getUserById = db.prepare(`
  SELECT * FROM users WHERE id = ?
`);

export const updateUser = db.prepare(`
  UPDATE users 
  SET real_name = ?, address = ?, updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

export default db;
