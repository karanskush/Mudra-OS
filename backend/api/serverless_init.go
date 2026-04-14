package handler

// serverless_init.go — runs once per cold start on Vercel.
// main.go is NOT executed in serverless environments; this init()
// bootstraps the database and runs migrations instead.

import (
	"log"
	"os"
	"sync"
	"time"

	"fintech-backend/internal/config"
	"fintech-backend/internal/database"
	"fintech-backend/internal/models"
	"fintech-backend/pkg/logger"

	"gorm.io/gorm"
)

var (
	serverlessInitOnce sync.Once
	serverlessReady    bool
)

func init() {
	serverlessInitOnce.Do(func() {
		// Must initialize logger before any package calls logger.Info/Error etc.
		logLevel := os.Getenv("LOG_LEVEL")
		if logLevel == "" {
			logLevel = "info"
		}
		logger.Init(logLevel, "json")

		cfg, err := config.Load()
		if err != nil {
			log.Printf("[serverless_init] Failed to load config: %v", err)
			return
		}

		if err := database.Connect(cfg); err != nil {
			log.Printf("[serverless_init] Failed to connect to database: %v", err)
			return
		}

		// Tune pool for serverless — keep connections minimal
		if db := database.GetDB(); db != nil {
			sqlDB, _ := db.DB()
			if sqlDB != nil {
				sqlDB.SetMaxIdleConns(2)
				sqlDB.SetMaxOpenConns(5)
				sqlDB.SetConnMaxLifetime(5 * time.Minute)
				sqlDB.SetConnMaxIdleTime(1 * time.Minute)
			}

			// Auto-migrate core models
			if err := migrateModels(db); err != nil {
				log.Printf("[serverless_init] Migration warning: %v", err)
			}
		}

		serverlessReady = true
		log.Printf("[serverless_init] Serverless init complete")
	})
}

func migrateModels(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.LedgerAccount{},
		&models.LedgerTransaction{},
		&models.LedgerEntry{},
	)
}
