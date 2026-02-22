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

  CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    status TEXT DEFAULT 'active',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS parcels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tracking_number TEXT UNIQUE NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    weight REAL,
    status TEXT DEFAULT 'pending',
    estimated_delivery DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    parcel_id INTEGER,
    total_amount REAL NOT NULL,
    currency TEXT DEFAULT 'TWD',
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(parcel_id) REFERENCES parcels(id)
  );

  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
  CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);
  CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);
  CREATE INDEX IF NOT EXISTS idx_parcels_user ON parcels(user_id);
  CREATE INDEX IF NOT EXISTS idx_parcels_tracking ON parcels(tracking_number);
  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_parcel ON orders(parcel_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);
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

export const createOTP = db.prepare(`
  INSERT INTO otp_codes (phone, code, expires_at)
  VALUES (?, ?, ?)
`);

export const getOTP = db.prepare(`
  SELECT * FROM otp_codes 
  WHERE phone = ? AND code = ? AND expires_at > datetime('now') AND verified = 0
  ORDER BY created_at DESC LIMIT 1
`);

export const verifyOTP = db.prepare(`
  UPDATE otp_codes 
  SET verified = 1 
  WHERE phone = ? AND code = ? AND expires_at > datetime('now')
`);

export const getLatestOTP = db.prepare(`
  SELECT * FROM otp_codes 
  WHERE phone = ? AND expires_at > datetime('now')
  ORDER BY created_at DESC LIMIT 1
`);

// Admin operations
export const createAdmin = db.prepare(`
  INSERT INTO admin_users (username, password, email, role)
  VALUES (?, ?, ?, ?)
`);

export const getAdminByUsername = db.prepare(`
  SELECT * FROM admin_users WHERE username = ?
`);

export const updateAdminLastLogin = db.prepare(`
  UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
`);

// User management (for admin dashboard)
export const getAllUsers = db.prepare(`
  SELECT id, username, phone, email, real_name, address, created_at, updated_at 
  FROM users 
  ORDER BY created_at DESC
`);

export const updateUser = db.prepare(`
  UPDATE users 
  SET real_name = ?, address = ?, email = ?, updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

export const deleteUser = db.prepare(`
  DELETE FROM users WHERE id = ?
`);

// Parcel operations
export const createParcel = db.prepare(`
  INSERT INTO parcels (user_id, tracking_number, origin, destination, weight, estimated_delivery)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export const getParcelsByUserId = db.prepare(`
  SELECT * FROM parcels WHERE user_id = ? ORDER BY created_at DESC
`);

export const getAllParcels = db.prepare(`
  SELECT * FROM parcels ORDER BY created_at DESC
`);

export const updateParcelStatus = db.prepare(`
  UPDATE parcels SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
`);

// Order operations
export const createOrder = db.prepare(`
  INSERT INTO orders (user_id, parcel_id, total_amount, currency, payment_method, notes)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export const getOrdersByUserId = db.prepare(`
  SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
`);

export const getAllOrders = db.prepare(`
  SELECT * FROM orders ORDER BY created_at DESC
`);

export const updateOrderStatus = db.prepare(`
  UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
`);

export default db;
