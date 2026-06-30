import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "wander.db");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface Note {
  id: number;
  content: string;
  created_at: string;
}

export function createNote(content: string): Note {
  const stmt = db.prepare(
    "INSERT INTO notes (content) VALUES (?) RETURNING id, content, created_at"
  );
  const row = stmt.get(content) as Note;
  return row;
}

export function getNote(id: number): Note | null {
  const stmt = db.prepare("SELECT * FROM notes WHERE id = ?");
  const row = stmt.get(id) as Note | undefined;
  return row ?? null;
}

export function getAllNotes(): Note[] {
  const stmt = db.prepare("SELECT * FROM notes ORDER BY created_at DESC");
  return stmt.all() as Note[];
}

export function updateNote(id: number, content: string): void {
  const stmt = db.prepare("UPDATE notes SET content = ? WHERE id = ?");
  stmt.run(content, id);
}

export function deleteNote(id: number): void {
  const stmt = db.prepare("DELETE FROM notes WHERE id = ?");
  stmt.run(id);
}
