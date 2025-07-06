package database

import (
	"fmt"
	"time"

	"fintech-backend/internal/config"
	"fintech-backend/pkg/logger"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

// DB is the global database instance
var DB *gorm.DB

// Connect establishes a connection to the database
func Connect(cfg *config.Config) error {
	var err error

	// Create GORM config
	gormConfig := &gorm.Config{
		Logger: logger.NewGormLogger(),
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true, // Use singular table names
		},
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
		DisableForeignKeyConstraintWhenMigrating: true, // Disable FK constraints during migration for better performance
	}

	// Disable GORM logging if configured
	if cfg != nil && !cfg.Logging.EnableGormLogging {
		gormConfig.Logger = logger.NewGormLogger().LogMode(gormlogger.Silent)
	}

	// Connect to database
	DB, err = gorm.Open(postgres.Open(cfg.GetDSN()), gormConfig)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Get underlying SQL database
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying SQL database: %w", err)
	}

	// Configure connection pool for better performance
	sqlDB.SetMaxIdleConns(10)                  // Increased from 5
	sqlDB.SetMaxOpenConns(50)                  // Increased from 25
	sqlDB.SetConnMaxLifetime(30 * time.Minute) // Reduced from 1 hour for faster rotation
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)  // Added idle timeout

	// Test the connection with timeout
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("Database connection established successfully")
	return nil
}

// Close closes the database connection
func Close() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return fmt.Errorf("failed to get underlying SQL database: %w", err)
		}
		return sqlDB.Close()
	}
	return nil
}

// AutoMigrate runs database migrations
func AutoMigrate(models ...interface{}) error {
	if DB == nil {
		return fmt.Errorf("database connection not established")
	}

	if err := DB.AutoMigrate(models...); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	logger.Info("Database migrations completed successfully")
	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}

// Transaction executes a function within a database transaction
func Transaction(fn func(tx *gorm.DB) error) error {
	return DB.Transaction(fn)
}
