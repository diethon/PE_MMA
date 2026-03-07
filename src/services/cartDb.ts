import * as SQLite from 'expo-sqlite';

const DB_NAME = 'cart.db';

export interface CartRow {
  id: number;
  userId: number;
  productId: string;
  name: string;
  brand: string;
  price: string | null;
  priceNum: number;
  image: string;
  category: string;
  quantity: number;
  createdAt: string;
}

let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME);
    await _db.execAsync(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL DEFAULT 0,
        productId TEXT NOT NULL,
        name TEXT NOT NULL,
        brand TEXT DEFAULT '',
        price TEXT,
        priceNum REAL DEFAULT 0,
        image TEXT DEFAULT '',
        category TEXT DEFAULT '',
        quantity INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT (datetime('now'))
      );
    `);
    try {
      await _db.execAsync('ALTER TABLE cart ADD COLUMN userId INTEGER NOT NULL DEFAULT 0');
    } catch {
      // column already exists
    }
  }
  return _db;
}

export async function getCartItems(userId: number): Promise<CartRow[]> {
  const db = await getDb();
  return db.getAllAsync<CartRow>(
    'SELECT * FROM cart WHERE userId = ? ORDER BY createdAt DESC',
    [userId],
  );
}

export async function addToCart(
  userId: number,
  productId: string,
  name: string,
  brand: string,
  price: string | null,
  priceNum: number,
  image: string,
  category: string,
  quantity: number = 1,
): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<CartRow>(
    'SELECT * FROM cart WHERE userId = ? AND productId = ?',
    [userId, productId],
  );
  if (existing) {
    await db.runAsync(
      'UPDATE cart SET quantity = quantity + ? WHERE userId = ? AND productId = ?',
      [quantity, userId, productId],
    );
  } else {
    await db.runAsync(
      'INSERT INTO cart (userId, productId, name, brand, price, priceNum, image, category, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, productId, name, brand, price ?? '', priceNum, image, category, quantity],
    );
  }
}

export async function updateQuantity(userId: number, productId: string, quantity: number): Promise<void> {
  const db = await getDb();
  if (quantity <= 0) {
    await db.runAsync('DELETE FROM cart WHERE userId = ? AND productId = ?', [userId, productId]);
  } else {
    await db.runAsync(
      'UPDATE cart SET quantity = ? WHERE userId = ? AND productId = ?',
      [quantity, userId, productId],
    );
  }
}

export async function removeFromCart(userId: number, productId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM cart WHERE userId = ? AND productId = ?', [userId, productId]);
}

export async function clearCart(userId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM cart WHERE userId = ?', [userId]);
}

export async function getCartCount(userId: number): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(quantity), 0) as total FROM cart WHERE userId = ?',
    [userId],
  );
  return row?.total ?? 0;
}
