package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

var db *sql.DB

func Init(dbPath string) error {
	if dbPath == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			return err
		}
		dbPath = filepath.Join(home, ".wander", "wander.db")
	}

	if err := os.MkdirAll(filepath.Dir(dbPath), 0755); err != nil {
		return err
	}

	var err error
	db, err = sql.Open("sqlite", dbPath)
	if err != nil {
		return err
	}

	if _, err := db.Exec("PRAGMA journal_mode = WAL"); err != nil {
		return err
	}

	return migrate()
}

func migrate() error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS notes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			content TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	return err
}

func Close() error {
	if db != nil {
		return db.Close()
	}
	return nil
}

type Note struct {
	ID        int64  `json:"id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
}

func CreateNote(content string) (*Note, error) {
	res, err := db.Exec("INSERT INTO notes (content) VALUES (?)", content)
	if err != nil {
		return nil, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}
	return GetNote(id)
}

func GetNote(id int64) (*Note, error) {
	var note Note
	row := db.QueryRow("SELECT id, content, created_at FROM notes WHERE id = ?", id)
	err := row.Scan(&note.ID, &note.Content, &note.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &note, nil
}

func GetAllNotes() ([]Note, error) {
	rows, err := db.Query("SELECT id, content, created_at FROM notes ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []Note
	for rows.Next() {
		var note Note
		if err := rows.Scan(&note.ID, &note.Content, &note.CreatedAt); err != nil {
			return nil, err
		}
		notes = append(notes, note)
	}
	return notes, rows.Err()
}

func UpdateNote(id int64, content string) error {
	res, err := db.Exec("UPDATE notes SET content = ? WHERE id = ?", content, id)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return fmt.Errorf("note not found")
	}
	return nil
}

func DeleteNote(id int64) error {
	_, err := db.Exec("DELETE FROM notes WHERE id = ?", id)
	return err
}
