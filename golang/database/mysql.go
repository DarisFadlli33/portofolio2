package database

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-sql-driver/mysql"
)

func OpenMySQL(ctx context.Context) (*sql.DB, error) {
	host := strings.TrimSpace(os.Getenv("MYSQL_HOST"))
	if host == "" {
		host = "127.0.0.1"
	}

	port := 3306
	if value := strings.TrimSpace(os.Getenv("MYSQL_PORT")); value != "" {
		parsedPort, err := strconv.Atoi(value)
		if err != nil || parsedPort < 1 || parsedPort > 65535 {
			return nil, fmt.Errorf("MYSQL_PORT must be a valid port number")
		}
		port = parsedPort
	}

	user := strings.TrimSpace(os.Getenv("MYSQL_USER"))
	if user == "" {
		return nil, fmt.Errorf("MYSQL_USER must be set")
	}

	databaseName := strings.TrimSpace(os.Getenv("MYSQL_DATABASE"))
	if databaseName == "" {
		return nil, fmt.Errorf("MYSQL_DATABASE must be set")
	}

	cfg := mysql.Config{
		User:                 user,
		Passwd:               os.Getenv("MYSQL_PASSWORD"),
		Net:                  "tcp",
		Addr:                 fmt.Sprintf("%s:%d", host, port),
		DBName:               databaseName,
		ParseTime:            true,
		AllowNativePasswords: true,
		ClientFoundRows:      true,
		Params: map[string]string{
			"charset": "utf8mb4",
		},
	}

	db, err := sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		return nil, fmt.Errorf("open MySQL connection: %w", err)
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("connect to MySQL: %w", err)
	}

	return db, nil
}
