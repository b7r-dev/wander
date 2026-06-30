package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"wander/internal/db"
	"wander/internal/lan"
	"wander/internal/markdown"
)

type Server struct {
	port   int
	server *http.Server
}

func New(port int) *Server {
	mux := http.NewServeMux()
	s := &Server{port: port}
	mux.HandleFunc("/note/", s.handleNote)
	mux.HandleFunc("/api/note/", s.handleAPINote)
	s.server = &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: corsMiddleware(mux),
	}
	return s
}

func (s *Server) Start() {
	go func() {
		log.Printf("[HTTP] starting on port %d", s.port)
		if err := s.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("[HTTP] server error: %v", err)
		}
	}()
}

func (s *Server) Stop() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	s.server.Shutdown(ctx)
}

func (s *Server) URL() string {
	ip, _ := lan.GetAutoLanIP()
	if ip == "" {
		ip = "127.0.0.1"
	}
	return fmt.Sprintf("http://%s:%d", ip, s.port)
}

func (s *Server) Port() int {
	return s.port
}

func (s *Server) handleNote(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/note/")
	id, err := strconv.ParseInt(path, 10, 64)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	note, err := db.GetNote(id)
	if err != nil || note == nil {
		http.NotFound(w, r)
		return
	}

	html, err := markdown.Render(note.Content)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprintf(w, viewerTemplate, html)
}

func (s *Server) handleAPINote(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/note/")
	id, err := strconv.ParseInt(path, 10, 64)
	if err != nil {
		http.Error(w, "invalid id", 400)
		return
	}

	note, err := db.GetNote(id)
	if err != nil || note == nil {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"id":%d,"content":%q,"created_at":%q}`, note.ID, note.Content, note.CreatedAt)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		if r.Method == "OPTIONS" {
			w.WriteHeader(200)
			return
		}
		next.ServeHTTP(w, r)
	})
}
