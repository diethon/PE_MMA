import * as SQLite from 'expo-sqlite';

const DB_NAME = 'cart.db';

let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME);
  }
  await _db.execAsync(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      productId TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      UNIQUE(userId, productId)
    );
  `);
  return _db;
}

export async function getFavoriteIds(userId: number): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ productId: string }>(
    'SELECT productId FROM favorites WHERE userId = ? ORDER BY createdAt DESC',
    [userId],
  );
  return rows.map((r) => r.productId);
}

export async function isFavorite(userId: number, productId: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM favorites WHERE userId = ? AND productId = ?',
    [userId, productId],
  );
  return (row?.cnt ?? 0) > 0;
}

export async function addFavorite(userId: number, productId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR IGNORE INTO favorites (userId, productId) VALUES (?, ?)',
    [userId, productId],
  );
}

export async function removeFavorite(userId: number, productId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM favorites WHERE userId = ? AND productId = ?',
    [userId, productId],
  );
}

export async function toggleFavorite(userId: number, productId: string): Promise<boolean> {
  const isCurrentlyFav = await isFavorite(userId, productId);
  if (isCurrentlyFav) {
    await removeFavorite(userId, productId);
    return false;
  } else {
    await addFavorite(userId, productId);
    return true;
  }
}

export async function getFavoritesCount(userId: number): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM favorites WHERE userId = ?',
    [userId],
  );
  return row?.cnt ?? 0;
}
