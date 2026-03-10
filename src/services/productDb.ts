import * as SQLite from 'expo-sqlite';

const DB_NAME = 'cart.db';

export interface ProductRow {
  id: number;
  productId: string;
  name: string;
  description: string;
  brand: string;
  priceNum: number;
  image: string;
  category: string;
  createdAt: string;
}

let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME);
    await _db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        brand TEXT DEFAULT '',
        priceNum REAL DEFAULT 0,
        image TEXT DEFAULT '',
        category TEXT DEFAULT '',
        createdAt TEXT DEFAULT (datetime('now'))
      );
    `);
  }
  return _db;
}

export async function getAllProducts(): Promise<ProductRow[]> {
  const db = await getDb();
  return db.getAllAsync<ProductRow>('SELECT * FROM products ORDER BY createdAt DESC');
}

export async function getProductById(productId: string): Promise<ProductRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ProductRow>('SELECT * FROM products WHERE productId = ?', [productId]);
  return row ?? null;
}

export async function addProduct(data: {
  productId?: string;
  name: string;
  description?: string;
  brand?: string;
  priceNum: number;
  image?: string;
  category?: string;
}): Promise<ProductRow> {
  const db = await getDb();
  const pid = data.productId || `CUS-${Date.now()}`;
  await db.runAsync(
    'INSERT INTO products (productId, name, description, brand, priceNum, image, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      pid,
      data.name.trim(),
      (data.description ?? '').trim(),
      (data.brand ?? '').trim(),
      data.priceNum || 0,
      (data.image ?? '').trim(),
      (data.category ?? '').trim(),
    ],
  );
  const row = await db.getFirstAsync<ProductRow>(
    'SELECT * FROM products WHERE productId = ? ORDER BY id DESC LIMIT 1',
    [pid],
  );
  if (!row) throw new Error('Failed to add product');
  return row;
}

export async function updateProduct(
  productId: string,
  data: {
    name: string;
    description?: string;
    brand?: string;
    priceNum: number;
    image?: string;
    category?: string;
  },
): Promise<ProductRow> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE products SET name = ?, description = ?, brand = ?, priceNum = ?, image = ?, category = ? WHERE productId = ?',
    [
      data.name.trim(),
      (data.description ?? '').trim(),
      (data.brand ?? '').trim(),
      data.priceNum || 0,
      (data.image ?? '').trim(),
      (data.category ?? '').trim(),
      productId,
    ],
  );
  const row = await db.getFirstAsync<ProductRow>('SELECT * FROM products WHERE productId = ?', [productId]);
  if (!row) throw new Error('Update failed');
  return row;
}

export async function deleteProduct(productId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM products WHERE productId = ?', [productId]);
}

