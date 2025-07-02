package database

import (
	"fintech-backend/internal/models"
	"fintech-backend/pkg/logger"
	"fmt"
)

// SetupNeonDatabase initializes the Neon database with required extensions and migrations
func SetupNeonDatabase() error {
	if DB == nil {
		return fmt.Errorf("database connection not established")
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

// enableExtensions enables required PostgreSQL extensions
func enableExtensions() error {
	extensions := []string{
		"uuid-ossp", // For UUID generation
		"pgcrypto",  // For cryptographic functions
	}

	for _, ext := range extensions {
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
