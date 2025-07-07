package database

import (
	"fintech-api/internal/models"
	"fintech-api/pkg/logger"
	"fmt"
)

// SetupNeonDatabase initializes the Neon database with required extensions and migrations
func SetupNeonDatabase() error {
	if DB == nil {
		return fmt.Errorf("database connection not established")
	}

	// Check if database is already set up
	if isAlreadySetup() {
		logger.Info("Database already set up, skipping initialization")
		return nil
	}

	// Enable required PostgreSQL extensions for Neon
	if err := enableExtensions(); err != nil {
		return fmt.Errorf("failed to enable extensions: %w", err)
	}

	// Run migrations
	if err := AutoMigrate(
		&models.User{},
		&models.Account{},
		&models.Transaction{},
		&models.KYCSubmission{},
		&models.KYCDocument{},
	); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	logger.Info("Neon database setup completed successfully")
	return nil
}

// isAlreadySetup checks if the database is already configured
func isAlreadySetup() bool {
	// Check if core tables exist
	if !DB.Migrator().HasTable(&models.User{}) {
		return false
	}
	if !DB.Migrator().HasTable(&models.Account{}) {
		return false
	}

	// Check if extensions are installed
	var count int64
	DB.Raw("SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto')").Scan(&count)
	return count >= 2
}

// enableExtensions enables required PostgreSQL extensions
func enableExtensions() error {
	extensions := []string{
		"uuid-ossp", // For UUID generation
		"pgcrypto",  // For cryptographic functions
	}

	for _, ext := range extensions {
		// Check if extension already exists
		var exists bool
		if err := DB.Raw("SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = ?)", ext).Scan(&exists).Error; err != nil {
			return fmt.Errorf("failed to check extension %s: %w", ext, err)
		}

		if exists {
			logger.Infof("PostgreSQL extension %s already enabled", ext)
			continue
		}

		// Quote the extension name to handle hyphens and special characters
		if err := DB.Exec(fmt.Sprintf("CREATE EXTENSION IF NOT EXISTS \"%s\"", ext)).Error; err != nil {
			return fmt.Errorf("failed to enable extension %s: %w", ext, err)
		}
		logger.Infof("Enabled PostgreSQL extension: %s", ext)
	}

	return nil
}

// CreateNeonBranch creates a new branch in Neon (useful for development/testing)
func CreateNeonBranch(branchName string) error {
	// Note: This would require Neon's API integration
	// For now, this is a placeholder for future implementation
	logger.Infof("Branch creation would be implemented with Neon API: %s", branchName)
	return nil
}

// GetNeonConnectionInfo returns connection information for debugging
func GetNeonConnectionInfo() map[string]interface{} {
	if DB == nil {
		return map[string]interface{}{
			"connected": false,
			"error":     "Database not connected",
		}
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return map[string]interface{}{
			"connected": false,
			"error":     err.Error(),
		}
	}

	stats := sqlDB.Stats()
	return map[string]interface{}{
		"connected":            true,
		"max_open_connections": stats.MaxOpenConnections,
		"open_connections":     stats.OpenConnections,
		"in_use":               stats.InUse,
		"idle":                 stats.Idle,
	}
}
