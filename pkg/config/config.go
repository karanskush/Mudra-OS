package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Security SecurityConfig
	Logging  LoggingConfig
	Payment  PaymentConfig
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Port string
	Host string
	Env  string
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
	URL      string // Neon connection URL
}

// JWTConfig holds JWT configuration
type JWTConfig struct {
	Secret     string
	ExpiryTime time.Duration
}

// SecurityConfig holds security configuration
type SecurityConfig struct {
	BCRYPTCost         int
	CORSAllowedOrigins []string
	RateLimitRequests  int
	RateLimitWindow    time.Duration
}

// LoggingConfig holds logging configuration
type LoggingConfig struct {
	Level             string
	Format            string
	EnableGormLogging bool // Control GORM logging during migrations
}

// PaymentConfig holds payment gateway configuration
type PaymentConfig struct {
	APIKey    string
	APISecret string
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		// .env file is optional, so we don't return error
	}

	config := &Config{}

	// Server configuration
	config.Server = ServerConfig{
		Port: getEnv("SERVER_PORT", "8080"),
		Host: getEnv("SERVER_HOST", "localhost"),
		Env:  getEnv("ENVIRONMENT", "development"),
	}

	// Database configuration - prioritize Neon DATABASE_URL
	databaseURL := getEnv("DATABASE_URL", "")
	if databaseURL != "" {
		// Use DATABASE_URL directly for Neon
		config.Database = DatabaseConfig{
			URL: databaseURL,
		}
	} else {
		// Fallback to legacy configuration
		config.Database = DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "password"),
			Name:     getEnv("DB_NAME", "fintech_db"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		}
	}

	// JWT configuration
	jwtExpiryHours, _ := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "24"))
	config.JWT = JWTConfig{
		Secret:     getEnv("JWT_SECRET", "your-super-secret-jwt-key-here"),
		ExpiryTime: time.Duration(jwtExpiryHours) * time.Hour,
	}

	// Security configuration
	bcryptCost, _ := strconv.Atoi(getEnv("BCRYPT_COST", "12"))
	rateLimitRequests, _ := strconv.Atoi(getEnv("RATE_LIMIT_REQUESTS", "100"))
	rateLimitWindow, _ := time.ParseDuration(getEnv("RATE_LIMIT_WINDOW", "1m"))

	config.Security = SecurityConfig{
		BCRYPTCost:         bcryptCost,
		CORSAllowedOrigins: []string{getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")},
		RateLimitRequests:  rateLimitRequests,
		RateLimitWindow:    rateLimitWindow,
	}

	// Logging configuration
	config.Logging = LoggingConfig{
		Level:             getEnv("LOG_LEVEL", "info"),
		Format:            getEnv("LOG_FORMAT", "json"),
		EnableGormLogging: getEnv("ENABLE_GORM_LOGGING", "true") == "true",
	}

	// Payment configuration
	config.Payment = PaymentConfig{
		APIKey:    getEnv("PAYMENT_GATEWAY_API_KEY", ""),
		APISecret: getEnv("PAYMENT_GATEWAY_SECRET", ""),
	}

	return config, nil
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GetDSN returns the database connection string
func (c *Config) GetDSN() string {
	// If DATABASE_URL is available, use it directly (preferred for Neon)
	if c.Database.URL != "" {
		return c.Database.URL
	}

	// Fallback to building DSN from components
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.Name,
		c.Database.SSLMode,
	)
}

// IsDevelopment returns true if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Server.Env == "development"
}

// IsProduction returns true if the environment is production
func (c *Config) IsProduction() bool {
	return c.Server.Env == "production"
}
