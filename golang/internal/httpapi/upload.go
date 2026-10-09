package httpapi

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

const (
	maxProjectImageBytes  = 8 << 20
	maxProjectImagePixels = 40_000_000
)

type uploadedImage struct {
	ImageURL string `json:"image_url"`
	Width    int    `json:"width"`
	Height   int    `json:"height"`
}

func (s *Server) uploadProjectImage(w http.ResponseWriter, r *http.Request) {
	s.uploadImage(w, r, s.projectImageDir, "/assets/images/projects/")
}

func (s *Server) uploadImage(w http.ResponseWriter, r *http.Request, imageDir, imageURLPrefix string) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxProjectImageBytes+(1<<20))
	if err := r.ParseMultipartForm(maxProjectImageBytes); err != nil {
		var maxBytesError *http.MaxBytesError
		if errors.As(err, &maxBytesError) {
			writeError(w, http.StatusRequestEntityTooLarge, "image must be 8 MB or smaller")
			return
		}
		writeError(w, http.StatusBadRequest, "invalid image upload")
		return
	}
	if r.MultipartForm != nil {
		defer r.MultipartForm.RemoveAll()
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		writeError(w, http.StatusBadRequest, "image file is required")
		return
	}
	defer file.Close()

	data, err := io.ReadAll(io.LimitReader(file, maxProjectImageBytes+1))
	if err != nil {
		writeError(w, http.StatusBadRequest, "could not read image")
		return
	}
	if len(data) == 0 {
		writeError(w, http.StatusBadRequest, "image file is empty")
		return
	}
	if len(data) > maxProjectImageBytes {
		writeError(w, http.StatusRequestEntityTooLarge, "image must be 8 MB or smaller")
		return
	}

	config, format, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		writeError(w, http.StatusUnsupportedMediaType, "supported image formats are JPEG, PNG, and GIF")
		return
	}
	pixelCount := int64(config.Width) * int64(config.Height)
	if config.Width < 1 || config.Height < 1 || pixelCount > maxProjectImagePixels {
		writeError(w, http.StatusBadRequest, "image dimensions must not exceed 40 megapixels")
		return
	}

	extension, ok := map[string]string{"jpeg": ".jpg", "png": ".png", "gif": ".gif"}[format]
	if !ok {
		writeError(w, http.StatusUnsupportedMediaType, "supported image formats are JPEG, PNG, and GIF")
		return
	}
	var randomName [16]byte
	if _, err := rand.Read(randomName[:]); err != nil {
		s.logger.Error("generate project image name failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not store image")
		return
	}
	filename := hex.EncodeToString(randomName[:]) + extension

	if err := os.MkdirAll(imageDir, 0o755); err != nil {
		s.logger.Error("create project image directory failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not store image")
		return
	}
	path := filepath.Join(imageDir, filename)
	if err := os.WriteFile(path, data, 0o644); err != nil {
		s.logger.Error("save project image failed", "error", err)
		writeError(w, http.StatusInternalServerError, "could not store image")
		return
	}

	writeJSON(w, http.StatusCreated, uploadedImage{
		ImageURL: imageURLPrefix + filename,
		Width:    config.Width,
		Height:   config.Height,
	})
}
