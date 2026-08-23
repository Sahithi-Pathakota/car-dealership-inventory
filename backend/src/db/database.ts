import Database from 'better-sqlite3';
import path from 'path';

/**
 * Creates (or opens) a SQLite database and ensures the schema exists.
 * Using a factory function (rather than a single module-level singleton)
 * makes it trivial to spin up isolated in-memory databases in tests.
 */
export function createDatabase(filePath: string = path.join(__dirname, '../../data/dealership.db')): Database.Database {
  const db = new Database(filePath);

  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}

export type AppDatabase = Database.Database;
