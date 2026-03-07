import * as SQLite from 'expo-sqlite';

const DB_NAME = 'cart.db';

export interface OrderRow {
  id: number;
  orderId: string;
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

export interface RevenueByCategory {
  category: string;
  total: number;
  count: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  brand: string;
  image: string;
  category: string;
  priceNum: number;
  totalRevenue: number;
  totalSold: number;
}

export interface OrderSummary {
  orderId: string;
  itemCount: number;
  total: number;
  createdAt: string;
}

let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME);
    await _db.execAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId TEXT NOT NULL,
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
      await _db.execAsync('ALTER TABLE orders ADD COLUMN userId INTEGER NOT NULL DEFAULT 0');
    } catch {
      // column already exists
    }
  }
  return _db;
}

export async function checkout(
  userId: number,
  cartItems: {
    productId: string;
    name: string;
    brand: string;
    price: string | null;
    priceNum: number;
    image: string;
    category: string;
    quantity: number;
  }[],
): Promise<string> {
  const db = await getDb();
  const orderId = `ORD-${Date.now()}`;
  for (const item of cartItems) {
    await db.runAsync(
      'INSERT INTO orders (orderId, userId, productId, name, brand, price, priceNum, image, category, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [orderId, userId, item.productId, item.name, item.brand, item.price ?? '', item.priceNum, item.image, item.category, item.quantity],
    );
  }
  return orderId;
}

// ── Seller queries (all orders) ──

export async function getTotalRevenue(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(priceNum * quantity), 0) as total FROM orders',
  );
  return row?.total ?? 0;
}

export async function getTotalOrders(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(DISTINCT orderId) as cnt FROM orders',
  );
  return row?.cnt ?? 0;
}

export async function getTotalItemsSold(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(quantity), 0) as total FROM orders',
  );
  return row?.total ?? 0;
}

export async function getRevenueByCategory(): Promise<RevenueByCategory[]> {
  const db = await getDb();
  return db.getAllAsync<RevenueByCategory>(
    `SELECT category, SUM(priceNum * quantity) as total, SUM(quantity) as count
     FROM orders GROUP BY category ORDER BY total DESC`,
  );
}

export async function getTopProducts(limit = 10): Promise<TopProduct[]> {
  const db = await getDb();
  return db.getAllAsync<TopProduct>(
    `SELECT productId, name, brand, image, category, priceNum,
            SUM(priceNum * quantity) as totalRevenue,
            SUM(quantity) as totalSold
     FROM orders GROUP BY productId
     ORDER BY totalRevenue DESC LIMIT ?`,
    [limit],
  );
}

export async function getOrderHistory(): Promise<OrderSummary[]> {
  const db = await getDb();
  return db.getAllAsync<OrderSummary>(
    `SELECT orderId, COUNT(*) as itemCount, SUM(priceNum * quantity) as total, MAX(createdAt) as createdAt
     FROM orders GROUP BY orderId ORDER BY createdAt DESC`,
  );
}

export async function getOrderItems(orderId: string): Promise<OrderRow[]> {
  const db = await getDb();
  return db.getAllAsync<OrderRow>(
    'SELECT * FROM orders WHERE orderId = ? ORDER BY id',
    [orderId],
  );
}

// ── Buyer queries (user-specific) ──

export async function getBuyerOrders(userId: number): Promise<OrderSummary[]> {
  const db = await getDb();
  return db.getAllAsync<OrderSummary>(
    `SELECT orderId, COUNT(*) as itemCount, SUM(priceNum * quantity) as total, MAX(createdAt) as createdAt
     FROM orders WHERE userId = ? GROUP BY orderId ORDER BY createdAt DESC`,
    [userId],
  );
}

export async function getBuyerOrdersByMonth(userId: number, year: number, month: number): Promise<OrderSummary[]> {
  const db = await getDb();
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const pattern = `${year}-${monthStr}%`;
  return db.getAllAsync<OrderSummary>(
    `SELECT orderId, COUNT(*) as itemCount, SUM(priceNum * quantity) as total, MAX(createdAt) as createdAt
     FROM orders WHERE userId = ? AND createdAt LIKE ? GROUP BY orderId ORDER BY createdAt DESC`,
    [userId, pattern],
  );
}

export async function getBuyerTotalSpent(userId: number): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(priceNum * quantity), 0) as total FROM orders WHERE userId = ?',
    [userId],
  );
  return row?.total ?? 0;
}

export async function getBuyerTotalOrders(userId: number): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(DISTINCT orderId) as cnt FROM orders WHERE userId = ?',
    [userId],
  );
  return row?.cnt ?? 0;
}

export async function getBuyerMonthlySpending(userId: number): Promise<{ month: string; total: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{ month: string; total: number }>(
    `SELECT strftime('%Y-%m', createdAt) as month, SUM(priceNum * quantity) as total
     FROM orders WHERE userId = ? GROUP BY strftime('%Y-%m', createdAt)
     ORDER BY month DESC LIMIT 12`,
    [userId],
  );
}
