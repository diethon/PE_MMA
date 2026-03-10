import * as SQLite from 'expo-sqlite';

const DB_NAME = 'cart.db';

export interface AddressRow {
  id: number;
  userId: number;
  recipientName: string;
  phone: string;
  address: string;
  isDefault: number; // 0 or 1
  createdAt: string;
}

let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME);
  }
  await _db.execAsync(`
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      recipientName TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      isDefault INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);
  return _db;
}

export async function getAddresses(userId: number): Promise<AddressRow[]> {
  const db = await getDb();
  return db.getAllAsync<AddressRow>(
    'SELECT * FROM addresses WHERE userId = ? ORDER BY isDefault DESC, id DESC',
    [userId],
  );
}

export async function getDefaultAddress(userId: number): Promise<AddressRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<AddressRow>(
    'SELECT * FROM addresses WHERE userId = ? AND isDefault = 1',
    [userId],
  );
  if (row) return row;
  const first = await db.getFirstAsync<AddressRow>(
    'SELECT * FROM addresses WHERE userId = ? ORDER BY id DESC LIMIT 1',
    [userId],
  );
  return first ?? null;
}

export async function addAddress(
  userId: number,
  recipientName: string,
  phone: string,
  address: string,
  isDefault: boolean,
): Promise<AddressRow> {
  const db = await getDb();
  if (isDefault) {
    await db.runAsync('UPDATE addresses SET isDefault = 0 WHERE userId = ?', [userId]);
  }
  await db.runAsync(
    'INSERT INTO addresses (userId, recipientName, phone, address, isDefault) VALUES (?, ?, ?, ?, ?)',
    [userId, recipientName.trim(), phone.trim(), address.trim(), isDefault ? 1 : 0],
  );
  const row = await db.getFirstAsync<AddressRow>(
    'SELECT * FROM addresses WHERE userId = ? ORDER BY id DESC LIMIT 1',
    [userId],
  );
  if (!row) throw new Error('Failed to add address');
  return row;
}

export async function updateAddressRow(
  id: number,
  recipientName: string,
  phone: string,
  address: string,
): Promise<AddressRow> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE addresses SET recipientName = ?, phone = ?, address = ? WHERE id = ?',
    [recipientName.trim(), phone.trim(), address.trim(), id],
  );
  const row = await db.getFirstAsync<AddressRow>('SELECT * FROM addresses WHERE id = ?', [id]);
  if (!row) throw new Error('Update failed');
  return row;
}

export async function setDefaultAddress(userId: number, addressId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE addresses SET isDefault = 0 WHERE userId = ?', [userId]);
  await db.runAsync('UPDATE addresses SET isDefault = 1 WHERE id = ? AND userId = ?', [addressId, userId]);
}

export async function deleteAddress(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM addresses WHERE id = ?', [id]);
}
