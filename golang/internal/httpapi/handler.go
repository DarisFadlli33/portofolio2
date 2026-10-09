package httpapi

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"path/filepath"
	"strings"
	"time"
)

type Server struct {
	db              *sql.DB
	logger          *slog.Logger
	allowedOrigins  map[string]struct{}
	projectImageDir string
}

type profile struct {
	ID       int     `json:"id"`
	Name     string  `json:"name"`
	Headline string  `json:"headline"`
	Summary  string  `json:"summary"`
	Email    string  `json:"email"`
	Location string  `json:"location"`
	PhotoURL *string `json:"photo_url"`
}

type skill struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Category     string `json:"category"`
	Proficiency  string `json:"proficiency"`
	DisplayOrder int    `json:"display_order"`
}

type project struct {
	ID           int      `json:"id"`
	Title        string   `json:"title"`
	Category     string   `json:"category"`
	Year         string   `json:"year"`
	Role         string   `json:"role"`
	Description  string   `json:"description"`
	ImageURL     *string  `json:"image_url"`
	ProjectURL   *string  `json:"project_url"`
	Technologies []string `json:"technologies"`
	DisplayOrder int      `json:"display_order"`
}

type education struct {
	ID           int    `json:"id"`
	PeriodLabel  string `json:"period_label"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	DisplayOrder int    `json:"display_order"`
}

type healthResponse struct {
	Status   string `json:"status"`
	Database string `json:"database"`
}

type errorResponse struct {
	Error string `json:"error"`
}

func New(db *sql.DB, allowedOrigins []string, logger *slog.Logger, projectImageDir string) http.Handler {
	if logger == nil {
		logger = slog.Default()
	}

	origins := make(map[string]struct{}, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		origin = strings.TrimSpace(origin)
		if origin != "" {
			origins[origin] = struct{}{}
		}
	}

	server := &Server{
		db:              db,
		logger:          logger,
		allowedOrigins:  origins,
		projectImageDir: projectImageDir,
	}
	profileImageDir := filepath.Join(filepath.Dir(projectImageDir), "profiles")

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", server.health)
	mux.HandleFunc("/api/profile", server.profile)
	mux.HandleFunc("/api/profile/image", func(w http.ResponseWriter, r *http.Request) {
		server.uploadImage(w, r, profileImageDir, "/assets/images/profiles/")
	})
	mux.HandleFunc("/api/skills", server.skills)
	mux.HandleFunc("/api/skills/", server.skillByID)
	mux.HandleFunc("/api/projects", server.projects)
	mux.HandleFunc("/api/projects/", server.projectByID)
	mux.HandleFunc("/api/projects/images", server.uploadProjectImage)
	mux.Handle("/assets/images/projects/", http.StripPrefix(
		"/assets/images/projects/",
		http.FileServer(http.Dir(projectImageDir)),
	))
	mux.Handle("/assets/images/profiles/", http.StripPrefix(
		"/assets/images/profiles/",
		http.FileServer(http.Dir(profileImageDir)),
	))
	mux.HandleFunc("/api/education", server.education)
	mux.HandleFunc("/api/education/", server.educationByID)

	return server.cors(mux)
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	if err := s.db.PingContext(ctx); err != nil {
		s.logger.Error("health check failed", "error", err)
		writeError(w, http.StatusServiceUnavailable, "database unavailable")
		return
	}

	writeJSON(w, http.StatusOK, healthResponse{Status: "ok", Database: "connected"})
}

func (s *Server) profile(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPut:
		s.upsertProfile(w, r)
	case http.MethodGet:
	default:
		methodNotAllowed(w, "GET, PUT, OPTIONS")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var result profile
	var photoURL sql.NullString
	err := s.db.QueryRowContext(ctx, `
		SELECT id, name, headline, summary, email, location, photo_url
		FROM profile
		WHERE id = 1
	`).Scan(
		&result.ID,
		&result.Name,
		&result.Headline,
		&result.Summary,
		&result.Email,
		&result.Location,
		&photoURL,
	)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "profile not found")
		return
	}
	if err != nil {
		s.logger.Error("query profile failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not load profile")
		return
	}
	if photoURL.Valid {
		result.PhotoURL = &photoURL.String
	}

	writeJSON(w, http.StatusOK, result)
}

func (s *Server) skills(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		s.createSkill(w, r)
		return
	case http.MethodGet:
	default:
		methodNotAllowed(w, "GET, POST, OPTIONS")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, name, category, proficiency, display_order
		FROM skills
		ORDER BY display_order, id
	`)
	if err != nil {
		s.logger.Error("query skills failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not load skills")
		return
	}
	defer rows.Close()

	results := make([]skill, 0)
	for rows.Next() {
		var item skill
		if err := rows.Scan(&item.ID, &item.Name, &item.Category, &item.Proficiency, &item.DisplayOrder); err != nil {
			s.logger.Error("scan skill failed", "error", err)
			writeError(w, http.StatusInternalServerError, "could not load skills")
			return
		}
		results = append(results, item)
	}
	if err := rows.Err(); err != nil {
		s.logger.Error("iterate skills failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not load skills")
		return
	}

	writeJSON(w, http.StatusOK, results)
}

func (s *Server) projects(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		s.createProject(w, r)
		return
	case http.MethodGet:
	default:
		methodNotAllowed(w, "GET, POST, OPTIONS")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, title, category, year_label, role, description, image_url, project_url, display_order
		FROM projects
		ORDER BY display_order, id
	`)
	if err != nil {
		s.logger.Error("query projects failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not load projects")
		return
	}

	results := make([]project, 0)
	projectIndexes := make(map[int]int)
	for rows.Next() {
		var item project
		var imageURL, projectURL sql.NullString
		if err := rows.Scan(
			&item.ID,
			&item.Title,
			&item.Category,
			&item.Year,
			&item.Role,
			&item.Description,
			&imageURL,
			&projectURL,
			&item.DisplayOrder,
		); err != nil {
			_ = rows.Close()
			s.logger.Error("scan project failed", "error", err)
			writeError(w, http.StatusInternalServerError, "could not load projects")
			return
		}
		if imageURL.Valid {
			item.ImageURL = &imageURL.String
		}
		if projectURL.Valid {
			item.ProjectURL = &projectURL.String
		}
		item.Technologies = make([]string, 0)
		projectIndexes[item.ID] = len(results)
		results = append(results, item)
	}
	if err := rows.Err(); err != nil {
		_ = rows.Close()
		s.logger.Error("iterate projects failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not load projects")
		return
	}
	if err := rows.Close(); err != nil {
		s.logger.Error("close project rows failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not load projects")
		return
	}

	if len(results) > 0 {
		placeholders := strings.TrimSuffix(strings.Repeat("?,", len(results)), ",")
		args := make([]any, 0, len(results))
		for _, item := range results {
			args = append(args, item.ID)
		}

		technologyRows, err := s.db.QueryContext(ctx, `
			SELECT project_id, technology
			FROM project_technologies
			WHERE project_id IN (`+placeholders+`)
			ORDER BY project_id, technology
		`, args...)
		if err != nil {
			s.logger.Error("query project technologies failed", "error", err)
			writeError(w, http.StatusInternalServerError, "could not load projects")
			return
		}
		defer technologyRows.Close()

		for technologyRows.Next() {
			var projectID int
			var technology string
			if err := technologyRows.Scan(&projectID, &technology); err != nil {
				s.logger.Error("scan project technology failed", "error", err)
				writeError(w, http.StatusInternalServerError, "could not load projects")
				return
			}
			if index, ok := projectIndexes[projectID]; ok {
				results[index].Technologies = append(results[index].Technologies, technology)
			}
		}
		if err := technologyRows.Err(); err != nil {
			s.logger.Error("iterate project technologies failed", "error", err)
			writeError(w, http.StatusInternalServerError, "could not load projects")
			return
		}
	}

	writeJSON(w, http.StatusOK, results)
}

func (s *Server) education(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		s.createEducation(w, r)
		return
	case http.MethodGet:
	default:
		methodNotAllowed(w, "GET, POST, OPTIONS")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, period_label, title, description, display_order
		FROM education
		ORDER BY display_order, id
	`)
	if err != nil {
		s.logger.Error("query education failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not load education")
		return
	}
	defer rows.Close()

	results := make([]education, 0)
	for rows.Next() {
		var item education
		if err := rows.Scan(&item.ID, &item.PeriodLabel, &item.Title, &item.Description, &item.DisplayOrder); err != nil {
			s.logger.Error("scan education failed", "error", err)
			writeError(w, http.StatusInternalServerError, "could not load education")
			return
		}
		results = append(results, item)
	}
	if err := rows.Err(); err != nil {
		s.logger.Error("iterate education failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not load education")
		return
	}

	writeJSON(w, http.StatusOK, results)
}

func (s *Server) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			if _, allowed := s.allowedOrigins[origin]; !allowed {
				writeError(w, http.StatusForbidden, "origin not allowed")
				return
			}
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func requireMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method == method {
		return true
	}
	w.Header().Set("Allow", method+", OPTIONS")
	writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	return false
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, errorResponse{Error: message})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		slog.Error("write JSON response failed", "error", err)
	}
}
