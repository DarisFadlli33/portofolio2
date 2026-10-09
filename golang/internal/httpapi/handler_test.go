package httpapi

import (
	"bytes"
	"encoding/json"
	"image"
	"image/png"
	"log/slog"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestCORSAllowsConfiguredOrigins(t *testing.T) {
	handler := New(nil, []string{"http://localhost:5173"}, slog.Default(), t.TempDir())
	request := httptest.NewRequest(http.MethodOptions, "/api/profile", nil)
	request.Header.Set("Origin", "http://localhost:5173")
	request.Header.Set("Access-Control-Request-Method", http.MethodGet)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusNoContent)
	}
	if got := recorder.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:5173" {
		t.Fatalf("Access-Control-Allow-Origin = %q", got)
	}
	if got := recorder.Header().Get("Access-Control-Allow-Methods"); got != "GET, POST, PUT, DELETE, OPTIONS" {
		t.Fatalf("Access-Control-Allow-Methods = %q", got)
	}
}

func TestCORSRejectsUnconfiguredOrigins(t *testing.T) {
	handler := New(nil, []string{"http://localhost:5173"}, slog.Default(), t.TempDir())
	request := httptest.NewRequest(http.MethodGet, "/api/profile", nil)
	request.Header.Set("Origin", "https://unexpected.example")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusForbidden)
	}
}

func TestEndpointRejectsUnsupportedMethods(t *testing.T) {
	handler := New(nil, nil, slog.Default(), t.TempDir())
	request := httptest.NewRequest(http.MethodPost, "/api/profile", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusMethodNotAllowed)
	}
	if got := recorder.Header().Get("Allow"); got != "GET, PUT, OPTIONS" {
		t.Fatalf("Allow = %q", got)
	}
}

func TestUploadProjectImageStoresImageAndReturnsDimensions(t *testing.T) {
	imageDirectory := t.TempDir()
	handler := New(nil, nil, slog.Default(), imageDirectory)
	var imageData bytes.Buffer
	if err := png.Encode(&imageData, image.NewRGBA(image.Rect(0, 0, 2, 3))); err != nil {
		t.Fatal(err)
	}
	body, contentType := imageUploadBody(t, imageData.Bytes())
	request := httptest.NewRequest(http.MethodPost, "/api/projects/images", body)
	request.Header.Set("Content-Type", contentType)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusCreated, recorder.Body.String())
	}
	var result uploadedImage
	if err := json.Unmarshal(recorder.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	if result.Width != 2 || result.Height != 3 {
		t.Fatalf("dimensions = %dx%d, want 2x3", result.Width, result.Height)
	}
	if filepath.Ext(result.ImageURL) != ".png" {
		t.Fatalf("image URL = %q, want a .png path", result.ImageURL)
	}
	filename := filepath.Base(result.ImageURL)
	stored, err := os.ReadFile(filepath.Join(imageDirectory, filename))
	if err != nil {
		t.Fatalf("read stored image: %v", err)
	}
	if !bytes.Equal(stored, imageData.Bytes()) {
		t.Fatal("stored image does not match uploaded image")
	}
	imageRequest := httptest.NewRequest(http.MethodGet, result.ImageURL, nil)
	imageRecorder := httptest.NewRecorder()
	handler.ServeHTTP(imageRecorder, imageRequest)
	if imageRecorder.Code != http.StatusOK || !bytes.Equal(imageRecorder.Body.Bytes(), imageData.Bytes()) {
		t.Fatalf("GET uploaded image status = %d, want %d", imageRecorder.Code, http.StatusOK)
	}
}

func TestUploadProfileImageStoresAndServesProfilePhoto(t *testing.T) {
	projectImageDir := filepath.Join(t.TempDir(), "projects")
	profileImageDir := filepath.Join(filepath.Dir(projectImageDir), "profiles")
	handler := New(nil, nil, slog.Default(), projectImageDir)
	var imageData bytes.Buffer
	if err := png.Encode(&imageData, image.NewRGBA(image.Rect(0, 0, 4, 5))); err != nil {
		t.Fatal(err)
	}
	body, contentType := imageUploadBody(t, imageData.Bytes())
	request := httptest.NewRequest(http.MethodPost, "/api/profile/image", body)
	request.Header.Set("Content-Type", contentType)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusCreated, recorder.Body.String())
	}
	var result uploadedImage
	if err := json.Unmarshal(recorder.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(result.ImageURL, "/assets/images/profiles/") {
		t.Fatalf("image URL = %q, want profile asset path", result.ImageURL)
	}
	if result.Width != 4 || result.Height != 5 {
		t.Fatalf("dimensions = %dx%d, want 4x5", result.Width, result.Height)
	}
	stored, err := os.ReadFile(filepath.Join(profileImageDir, filepath.Base(result.ImageURL)))
	if err != nil {
		t.Fatalf("read stored profile image: %v", err)
	}
	if !bytes.Equal(stored, imageData.Bytes()) {
		t.Fatal("stored profile image does not match uploaded image")
	}
}

func TestUploadProjectImageRejectsUnsupportedMethod(t *testing.T) {
	handler := New(nil, nil, slog.Default(), t.TempDir())
	request := httptest.NewRequest(http.MethodGet, "/api/projects/images", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusMethodNotAllowed)
	}
	if got := recorder.Header().Get("Allow"); got != "POST, OPTIONS" {
		t.Fatalf("Allow = %q, want %q", got, "POST, OPTIONS")
	}
}

func TestUploadProjectImageRejectsNonImage(t *testing.T) {
	imageDirectory := t.TempDir()
	handler := New(nil, nil, slog.Default(), imageDirectory)
	body, contentType := imageUploadBody(t, []byte("not an image"))
	request := httptest.NewRequest(http.MethodPost, "/api/projects/images", body)
	request.Header.Set("Content-Type", contentType)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnsupportedMediaType {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusUnsupportedMediaType)
	}
	if entries, err := os.ReadDir(imageDirectory); err != nil || len(entries) != 0 {
		t.Fatalf("image directory entries = %v, error = %v; want no stored files", entries, err)
	}
}

func imageUploadBody(t *testing.T, data []byte) (*bytes.Buffer, string) {
	t.Helper()
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	file, err := writer.CreateFormFile("image", "upload")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := file.Write(data); err != nil {
		t.Fatal(err)
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	return &body, writer.FormDataContentType()
}
