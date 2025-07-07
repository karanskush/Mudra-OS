package config

import (
	"os"
)

// Config holds all configuration settings
type Config struct {
	Database DatabaseConfig
}

// DatabaseConfig holds database-specific configuration
type DatabaseConfig struct {
	URL string
}

// New creates a new Config instance with values from environment variables
func New() *Config {
	return &Config{
		Database: DatabaseConfig{
			URL: getEnv("DATABASE_URL", ""),
		},
	}
}

// GetDSN returns the database connection string
func (dc *DatabaseConfig) GetDSN() string {
	return dc.URL
}

// Helper function to get environment variables with fallback
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
