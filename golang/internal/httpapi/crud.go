package httpapi

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
)

type profileInput struct {
	Name     string  `json:"name"`
	Headline string  `json:"headline"`
	Summary  string  `json:"summary"`
	Email    string  `json:"email"`
	Location string  `json:"location"`
	PhotoURL *string `json:"photo_url"`
}

type skillInput struct {
	Name         string `json:"name"`
	Category     string `json:"category"`
	Proficiency  string `json:"proficiency"`
	DisplayOrder int    `json:"display_order"`
}

type projectInput struct {
	Title        string   `json:"title"`
	Category     string   `json:"category"`
	Year         string   `json:"year"`
	Role         string   `json:"role"`
	Description  string   `json:"description"`
	ImageURL     *string  `json:"image_url"`
	ProjectURL   *string  `json:"project_url"`
	DisplayOrder int      `json:"display_order"`
	Technologies []string `json:"technologies"`
}

type educationInput struct {
	PeriodLabel  string `json:"period_label"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	DisplayOrder int    `json:"display_order"`
}

func (s *Server) upsertProfile(w http.ResponseWriter, r *http.Request) {
	var input profileInput
	if !decodeInput(w, r, &input) {
		return
	}
	input.Name = strings.TrimSpace(input.Name)
	input.Headline = strings.TrimSpace(input.Headline)
	input.Summary = strings.TrimSpace(input.Summary)
	input.Email = strings.TrimSpace(input.Email)
	input.Location = strings.TrimSpace(input.Location)
	if input.Name == "" || input.Headline == "" || input.Summary == "" || input.Email == "" || input.Location == "" {
		writeError(w, http.StatusBadRequest, "name, headline, summary, email, and location are required")
		return
	}

	ctx := r.Context()
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO profile (id, name, headline, summary, email, location, photo_url)
		VALUES (1, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			name = VALUES(name), headline = VALUES(headline), summary = VALUES(summary),
			email = VALUES(email), location = VALUES(location), photo_url = VALUES(photo_url)
	`, input.Name, input.Headline, input.Summary, input.Email, input.Location, nullableTrimmed(input.PhotoURL))
	if err != nil {
		s.logger.Error("save profile failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not save profile")
		return
	}
	var photoURL *string
	if input.PhotoURL != nil && strings.TrimSpace(*input.PhotoURL) != "" {
		trimmed := strings.TrimSpace(*input.PhotoURL)
		photoURL = &trimmed
	}
	writeJSON(w, http.StatusOK, profile{
		ID: 1, Name: input.Name, Headline: input.Headline, Summary: input.Summary,
		Email: input.Email, Location: input.Location, PhotoURL: photoURL,
	})
}

func (s *Server) createSkill(w http.ResponseWriter, r *http.Request) {
	var input skillInput
	if !decodeInput(w, r, &input) {
		return
	}
	input.Name = strings.TrimSpace(input.Name)
	input.Category = strings.TrimSpace(input.Category)
	input.Proficiency = strings.TrimSpace(input.Proficiency)
	if input.Name == "" || input.Category == "" || input.Proficiency == "" {
		writeError(w, http.StatusBadRequest, "name, category, and proficiency are required")
		return
	}
	result, err := s.db.ExecContext(r.Context(), `
		INSERT INTO skills (name, category, proficiency, display_order) VALUES (?, ?, ?, ?)
	`, input.Name, input.Category, input.Proficiency, input.DisplayOrder)
	if err != nil {
		s.logger.Error("create skill failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not save skill")
		return
	}
	id, err := result.LastInsertId()
	if err != nil {
		s.logger.Error("read created skill id failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not save skill")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]int64{"id": id})
}

func (s *Server) updateSkill(w http.ResponseWriter, r *http.Request, id int64) {
	var input skillInput
	if !decodeInput(w, r, &input) {
		return
	}
	input.Name = strings.TrimSpace(input.Name)
	input.Category = strings.TrimSpace(input.Category)
	input.Proficiency = strings.TrimSpace(input.Proficiency)
	if input.Name == "" || input.Category == "" || input.Proficiency == "" {
		writeError(w, http.StatusBadRequest, "name, category, and proficiency are required")
		return
	}
	result, err := s.db.ExecContext(r.Context(), `
		UPDATE skills SET name = ?, category = ?, proficiency = ?, display_order = ? WHERE id = ?
	`, input.Name, input.Category, input.Proficiency, input.DisplayOrder, id)
	if !checkUpdated(w, s.logger, result, err, "skill") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) deleteSkill(w http.ResponseWriter, r *http.Request, id int64) {
	result, err := s.db.ExecContext(r.Context(), `DELETE FROM skills WHERE id = ?`, id)
	if !checkUpdated(w, s.logger, result, err, "skill") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) skillByID(w http.ResponseWriter, r *http.Request) {
	id, ok := resourceID(w, r, "/api/skills/")
	if !ok {
		return
	}
	switch r.Method {
	case http.MethodPut:
		s.updateSkill(w, r, id)
	case http.MethodDelete:
		s.deleteSkill(w, r, id)
	default:
		methodNotAllowed(w, "PUT, DELETE, OPTIONS")
	}
}

func (s *Server) createProject(w http.ResponseWriter, r *http.Request) {
	var input projectInput
	if !decodeInput(w, r, &input) || !validateProject(w, &input) {
		return
	}
	tx, err := s.db.BeginTx(r.Context(), nil)
	if err != nil {
		s.logger.Error("begin project transaction failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not save project")
		return
	}
	result, err := tx.ExecContext(r.Context(), `
		INSERT INTO projects (title, category, year_label, role, description, image_url, project_url, display_order)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, input.Title, input.Category, input.Year, input.Role, input.Description,
		nullableTrimmed(input.ImageURL), nullableTrimmed(input.ProjectURL), input.DisplayOrder)
	if err != nil {
		_ = tx.Rollback()
		s.logger.Error("create project failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not save project")
		return
	}
	id, err := result.LastInsertId()
	if err == nil {
		err = replaceTechnologies(r, tx, id, input.Technologies)
	}
	if err == nil {
		err = tx.Commit()
	} else {
		_ = tx.Rollback()
	}
	if err != nil {
		s.logger.Error("save project technologies failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not save project")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]int64{"id": id})
}

func (s *Server) updateProject(w http.ResponseWriter, r *http.Request, id int64) {
	var input projectInput
	if !decodeInput(w, r, &input) || !validateProject(w, &input) {
		return
	}
	tx, err := s.db.BeginTx(r.Context(), nil)
	if err != nil {
		s.logger.Error("begin project transaction failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not save project")
		return
	}
	result, err := tx.ExecContext(r.Context(), `
		UPDATE projects SET title = ?, category = ?, year_label = ?, role = ?, description = ?,
			image_url = ?, project_url = ?, display_order = ? WHERE id = ?
	`, input.Title, input.Category, input.Year, input.Role, input.Description,
		nullableTrimmed(input.ImageURL), nullableTrimmed(input.ProjectURL), input.DisplayOrder, id)
	if err == nil {
		var count int64
		count, err = result.RowsAffected()
		if err == nil && count == 0 {
			var exists int
			err = tx.QueryRowContext(r.Context(), `SELECT 1 FROM projects WHERE id = ?`, id).Scan(&exists)
			if errors.Is(err, sql.ErrNoRows) {
				_ = tx.Rollback()
				writeError(w, http.StatusNotFound, "project not found")
				return
			}
		}
	}
	if err == nil {
		err = replaceTechnologies(r, tx, id, input.Technologies)
	}
	if err == nil {
		err = tx.Commit()
	} else {
		_ = tx.Rollback()
	}
	if err != nil {
		s.logger.Error("update project failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not save project")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) deleteProject(w http.ResponseWriter, r *http.Request, id int64) {
	result, err := s.db.ExecContext(r.Context(), `DELETE FROM projects WHERE id = ?`, id)
	if !checkUpdated(w, s.logger, result, err, "project") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) projectByID(w http.ResponseWriter, r *http.Request) {
	id, ok := resourceID(w, r, "/api/projects/")
	if !ok {
		return
	}
	switch r.Method {
	case http.MethodPut:
		s.updateProject(w, r, id)
	case http.MethodDelete:
		s.deleteProject(w, r, id)
	default:
		methodNotAllowed(w, "PUT, DELETE, OPTIONS")
	}
}

func (s *Server) createEducation(w http.ResponseWriter, r *http.Request) {
	var input educationInput
	if !decodeInput(w, r, &input) || !validateEducation(w, &input) {
		return
	}
	result, err := s.db.ExecContext(r.Context(), `
		INSERT INTO education (period_label, title, description, display_order) VALUES (?, ?, ?, ?)
	`, input.PeriodLabel, input.Title, input.Description, input.DisplayOrder)
	if err != nil {
		s.logger.Error("create education failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not save education")
		return
	}
	id, err := result.LastInsertId()
	if err != nil {
		s.logger.Error("read created education id failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not save education")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]int64{"id": id})
}

func (s *Server) updateEducation(w http.ResponseWriter, r *http.Request, id int64) {
	var input educationInput
	if !decodeInput(w, r, &input) || !validateEducation(w, &input) {
		return
	}
	result, err := s.db.ExecContext(r.Context(), `
		UPDATE education SET period_label = ?, title = ?, description = ?, display_order = ? WHERE id = ?
	`, input.PeriodLabel, input.Title, input.Description, input.DisplayOrder, id)
	if !checkUpdated(w, s.logger, result, err, "education") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) deleteEducation(w http.ResponseWriter, r *http.Request, id int64) {
	result, err := s.db.ExecContext(r.Context(), `DELETE FROM education WHERE id = ?`, id)
	if !checkUpdated(w, s.logger, result, err, "education") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) educationByID(w http.ResponseWriter, r *http.Request) {
	id, ok := resourceID(w, r, "/api/education/")
	if !ok {
		return
	}
	switch r.Method {
	case http.MethodPut:
		s.updateEducation(w, r, id)
	case http.MethodDelete:
		s.deleteEducation(w, r, id)
	default:
		methodNotAllowed(w, "PUT, DELETE, OPTIONS")
	}
}

func decodeInput(w http.ResponseWriter, r *http.Request, target any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON request body")
		return false
	}
	var trailing any
	if err := decoder.Decode(&trailing); !errors.Is(err, io.EOF) {
		writeError(w, http.StatusBadRequest, "request body must contain one JSON object")
		return false
	}
	return true
}

func validateProject(w http.ResponseWriter, input *projectInput) bool {
	input.Title = strings.TrimSpace(input.Title)
	input.Category = strings.TrimSpace(input.Category)
	input.Year = strings.TrimSpace(input.Year)
	input.Role = strings.TrimSpace(input.Role)
	input.Description = strings.TrimSpace(input.Description)
	if input.Title == "" || input.Category == "" || input.Year == "" || input.Role == "" || input.Description == "" {
		writeError(w, http.StatusBadRequest, "title, category, year, role, and description are required")
		return false
	}
	technologies := make([]string, 0, len(input.Technologies))
	for _, technology := range input.Technologies {
		if technology = strings.TrimSpace(technology); technology != "" {
			technologies = append(technologies, technology)
		}
	}
	input.Technologies = technologies
	return true
}

func validateEducation(w http.ResponseWriter, input *educationInput) bool {
	input.PeriodLabel = strings.TrimSpace(input.PeriodLabel)
	input.Title = strings.TrimSpace(input.Title)
	input.Description = strings.TrimSpace(input.Description)
	if input.PeriodLabel == "" || input.Title == "" || input.Description == "" {
		writeError(w, http.StatusBadRequest, "period_label, title, and description are required")
		return false
	}
	return true
}

func replaceTechnologies(r *http.Request, tx *sql.Tx, projectID int64, technologies []string) error {
	if _, err := tx.ExecContext(r.Context(), `DELETE FROM project_technologies WHERE project_id = ?`, projectID); err != nil {
		return fmt.Errorf("delete old project technologies: %w", err)
	}
	for _, technology := range technologies {
		if _, err := tx.ExecContext(r.Context(), `
			INSERT INTO project_technologies (project_id, technology) VALUES (?, ?)
		`, projectID, technology); err != nil {
			return fmt.Errorf("insert project technology: %w", err)
		}
	}
	return nil
}

func resourceID(w http.ResponseWriter, r *http.Request, prefix string) (int64, bool) {
	value := strings.TrimPrefix(r.URL.Path, prefix)
	id, err := strconv.ParseInt(value, 10, 64)
	if err != nil || id < 1 || strings.Contains(value, "/") {
		writeError(w, http.StatusNotFound, "resource not found")
		return 0, false
	}
	return id, true
}

func nullableTrimmed(value *string) any {
	if value == nil || strings.TrimSpace(*value) == "" {
		return nil
	}
	return strings.TrimSpace(*value)
}

func checkUpdated(w http.ResponseWriter, logger *slog.Logger, result sql.Result, err error, resource string) bool {
	if err != nil {
		logger.Error("update resource failed", "resource", resource, "error", err)
		writeError(w, http.StatusInternalServerError, "could not save "+resource)
		return false
	}
	affected, err := result.RowsAffected()
	if err != nil {
		logger.Error("read affected row count failed", "resource", resource, "error", err)
		writeError(w, http.StatusInternalServerError, "could not save "+resource)
		return false
	}
	if affected == 0 {
		writeError(w, http.StatusNotFound, resource+" not found")
		return false
	}
	return true
}

func methodNotAllowed(w http.ResponseWriter, allowed string) {
	w.Header().Set("Allow", allowed)
	writeError(w, http.StatusMethodNotAllowed, "method not allowed")
}
