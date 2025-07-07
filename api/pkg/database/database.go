package database

import (
	"api/pkg/config"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	DB *gorm.DB
)

// Connect establishes a connection to the database
func Connect(cfg *config.Config) error {
	var err error

	// Connect to the database using the configuration
	DB, err = gorm.Open(postgres.Open(cfg.Database.GetDSN()), &gorm.Config{})
	if err != nil {
		log.Printf("Failed to connect to database: %v", err)
		return err
	}

	// Get the underlying SQL DB instance
	sqlDB, err := DB.DB()
	if err != nil {
		log.Printf("Failed to get database instance: %v", err)
		return err
	}

	// Set connection pool settings for serverless environment
	sqlDB.SetMaxIdleConns(2)
	sqlDB.SetMaxOpenConns(5)

	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}
