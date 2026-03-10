import * as SQLite from 'expo-sqlite';

const DB_NAME = 'cart.db';

export type UserRole = 'buyer' | 'seller';

export interface UserRow {
  id: number;
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
  phone: string;
  address: string;
  createdAt: string;
}

let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME);
    await _db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        fullName TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'buyer',
        createdAt TEXT DEFAULT (datetime('now'))
      );
    `);
    try { await _db.execAsync('ALTER TABLE users ADD COLUMN phone TEXT DEFAULT \'\''); } catch { /* exists */ }
    try { await _db.execAsync('ALTER TABLE users ADD COLUMN address TEXT DEFAULT \'\''); } catch { /* exists */ }

    const count = await _db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM users',
    );
    if (count?.cnt === 0) {
      await _db.runAsync(
        'INSERT INTO users (email, fullName, password, role) VALUES (?, ?, ?, ?)',
        ['seller@aura.com', 'Aura Seller', '123456', 'seller'],
      );
      await _db.runAsync(
        'INSERT INTO users (email, fullName, password, role) VALUES (?, ?, ?, ?)',
        ['buyer@aura.com', 'Aura Buyer', '123456', 'buyer'],
      );
    }
  }
  return _db;
}

export async function login(email: string, password: string): Promise<UserRow | null> {
  const db = await getDb();
  const user = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email.trim().toLowerCase(), password],
  );
  return user ?? null;
}

export async function register(
  email: string,
  fullName: string,
  password: string,
  role: UserRole,
): Promise<UserRow> {
  const db = await getDb();
  const existing = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users WHERE email = ?',
    [email.trim().toLowerCase()],
  );
  if (existing) throw new Error('Email đã tồn tại');
  await db.runAsync(
    'INSERT INTO users (email, fullName, password, role) VALUES (?, ?, ?, ?)',
    [email.trim().toLowerCase(), fullName.trim(), password, role],
  );
  const user = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users WHERE email = ?',
    [email.trim().toLowerCase()],
  );
  if (!user) throw new Error('Registration failed');
  return user;
}

export async function getUserById(id: number): Promise<UserRow | null> {
  const db = await getDb();
  return (await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', [id])) ?? null;
}

export async function updateUserProfile(
  id: number,
  fullName: string,
  email: string,
): Promise<UserRow> {
  const db = await getDb();
  const existing = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users WHERE email = ? AND id != ?',
    [email.trim().toLowerCase(), id],
  );
  if (existing) throw new Error('Email đã được sử dụng');
  await db.runAsync(
    'UPDATE users SET fullName = ?, email = ? WHERE id = ?',
    [fullName.trim(), email.trim().toLowerCase(), id],
  );
  const user = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
  if (!user) throw new Error('Update failed');
  return user;
}

export async function changePassword(
  id: number,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const db = await getDb();
  const user = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users WHERE id = ? AND password = ?',
    [id, oldPassword],
  );
  if (!user) throw new Error('Mật khẩu cũ không đúng');
  await db.runAsync('UPDATE users SET password = ? WHERE id = ?', [newPassword, id]);
}

export async function updateUserAddress(
  id: number,
  phone: string,
  address: string,
): Promise<UserRow> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE users SET phone = ?, address = ? WHERE id = ?',
    [phone.trim(), address.trim(), id],
  );
  const user = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
  if (!user) throw new Error('Update failed');
  return user;
}
