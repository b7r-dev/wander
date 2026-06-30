package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"wander/internal/db"
	"wander/internal/lan"
	"wander/internal/port"
	"wander/internal/qr"
	"wander/internal/server"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx    context.Context
	server *server.Server
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Init database
	home, _ := os.UserHomeDir()
	dbPath := filepath.Join(home, ".wander", "wander.db")
	if err := db.Init(dbPath); err != nil {
		runtime.LogErrorf(ctx, "failed to init db: %v", err)
	}

	// Start HTTP sidecar
	p, err := port.FindAvailablePort(port.DefaultPort)
	if err != nil {
		runtime.LogErrorf(ctx, "failed to find port: %v", err)
		p = port.DefaultPort
	}
	a.server = server.New(p)
	a.server.Start()
}

// shutdown is called when the app exits
func (a *App) shutdown(ctx context.Context) {
	if a.server != nil {
		a.server.Stop()
	}
	db.Close()
}

// GetNotes returns all notes
func (a *App) GetNotes() ([]db.Note, error) {
	return db.GetAllNotes()
}

// GetNote returns a single note
func (a *App) GetNote(id int64) (*db.Note, error) {
	return db.GetNote(id)
}

// CreateNote creates a new note and returns QR data
func (a *App) CreateNote(content string, lanBaseURL string) (map[string]interface{}, error) {
	note, err := db.CreateNote(content)
	if err != nil {
		return nil, err
	}

	fullURL := fmt.Sprintf("%s/note/%d", lanBaseURL, note.ID)
	qrDataURL, err := qr.GenerateDataURL(fullURL)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"noteId":    note.ID,
		"qrDataUrl": qrDataURL,
		"fullUrl":   fullURL,
	}, nil
}

// UpdateNote updates an existing note
func (a *App) UpdateNote(id int64, content string) error {
	return db.UpdateNote(id, content)
}

// DeleteNote deletes a note
func (a *App) DeleteNote(id int64) error {
	return db.DeleteNote(id)
}

// GenerateQR generates a QR for an existing note
func (a *App) GenerateQR(id int64, lanBaseURL string) (map[string]interface{}, error) {
	fullURL := fmt.Sprintf("%s/note/%d", lanBaseURL, id)
	qrDataURL, err := qr.GenerateDataURL(fullURL)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"qrDataUrl": qrDataURL,
		"fullUrl":   fullURL,
	}, nil
}

// GetAutoLanIP returns the auto-detected LAN IP
func (a *App) GetAutoLanIP() (string, error) {
	return lan.GetAutoLanIP()
}

// GetServerPort returns the HTTP server port
func (a *App) GetServerPort() int {
	if a.server == nil {
		return 0
	}
	return a.server.Port()
}
