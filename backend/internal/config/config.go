package config

import (
	"fmt"
	"net/url"
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
	Redis    RedisConfig
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

// RedisConfig holds Redis configuration
type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
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
		Port: getEnv("SERVER_PORT", "47291"),
		Host: getEnv("SERVER_HOST", "localhost"),
		Env:  getEnv("ENVIRONMENT", "development"),
	}

	// Database configuration - prioritize Neon DATABASE_URL
	databaseURL := getEnv("DATABASE_URL", "")
	if databaseURL != "" {
		// Parse Neon connection URL
		parsedURL, err := url.Parse(databaseURL)
		if err != nil {
			return nil, fmt.Errorf("invalid DATABASE_URL: %w", err)
		}

		password, _ := parsedURL.User.Password()
		config.Database = DatabaseConfig{
			Host:     parsedURL.Hostname(),
			Port:     parsedURL.Port(),
			User:     parsedURL.User.Username(),
			Password: password,
			Name:     parsedURL.Path[1:], // Remove leading slash
			SSLMode:  "require",          // Neon requires SSL
			URL:      databaseURL,
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

	// Redis configuration
	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))
	config.Redis = RedisConfig{
		Host:     getEnv("REDIS_HOST", "localhost"),
		Port:     getEnv("REDIS_PORT", "6379"),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       redisDB,
	}

	// Security configuration
	bcryptCost, _ := strconv.Atoi(getEnv("BCRYPT_COST", "12"))
	rateLimitRequests, _ := strconv.Atoi(getEnv("RATE_LIMIT_REQUESTS", "100"))
	rateLimitWindow, _ := time.ParseDuration(getEnv("RATE_LIMIT_WINDOW", "1m"))

	config.Security = SecurityConfig{
		BCRYPTCost:         bcryptCost,
		CORSAllowedOrigins: []string{getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:39184")},
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
	// If we have a Neon DATABASE_URL, use it directly
	if c.Database.URL != "" {
		return c.Database.URL
	}

	// Fallback to constructed DSN for legacy configuration
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.Name,
		c.Database.SSLMode,
	)
}

// GetRedisAddr returns the Redis connection address
func (c *Config) GetRedisAddr() string {
	return fmt.Sprintf("%s:%s", c.Redis.Host, c.Redis.Port)
}

// IsDevelopment returns true if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Server.Env == "development"
}

// IsProduction returns true if the environment is production
func (c *Config) IsProduction() bool {
	return c.Server.Env == "production"
}
