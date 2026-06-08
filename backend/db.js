import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'database.sqlite');

export async function getDB() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export async function initDB() {
  const db = await getDB();
  
  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  // Colleges Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS colleges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('Public', 'Private')) NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      fees_avg INTEGER NOT NULL,
      rating REAL DEFAULT 0.0,
      overview TEXT,
      logo_url TEXT,
      image_url TEXT,
      established_year INTEGER
    )
  `);

  // Courses Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      duration_years INTEGER NOT NULL,
      fees_annual INTEGER NOT NULL,
      intake INTEGER,
      FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
    )
  `);

  // Placements Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS placements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      average_package_lpa REAL NOT NULL,
      highest_package_lpa REAL NOT NULL,
      placement_rate REAL NOT NULL,
      FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
    )
  `);

  // Reviews Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_id INTEGER NOT NULL,
      reviewer_name TEXT NOT NULL,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
    )
  `);

  // Cutoffs Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cutoffs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_id INTEGER NOT NULL,
      exam TEXT NOT NULL,
      branch TEXT NOT NULL,
      category TEXT NOT NULL,
      closing_rank INTEGER NOT NULL,
      FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
    )
  `);
  
  console.log('Database tables verified/created successfully.');
  return db;
}
