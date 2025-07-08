package main

import (
	"log"
	"net/http"

	"fintech-backend/api"
	"fintech-backend/internal/config"
	"fintech-backend/internal/database"
	"fintech-backend/internal/middleware"
	"fintech-backend/pkg/logger"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	logger.Init(cfg.Logging.Level, cfg.Logging.Format)

	// Connect to Neon database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Setup Neon database (extensions and migrations)
	if err := database.SetupNeonDatabase(); err != nil {
		log.Fatalf("Failed to setup Neon database: %v", err)
	}

	// Run ledger migrations
	if err := database.MigrateLedgerTables(database.GetDB()); err != nil {
		log.Fatalf("Failed to migrate ledger tables: %v", err)
	}

	// Log connection info
	connInfo := database.GetNeonConnectionInfo()
	log.Printf("Neon database connection info: %+v", connInfo)

	mux := http.NewServeMux()

	// Use centralized API handler for all routes (same pattern as login API)
	mux.HandleFunc("/", api.Handler)

	log.Printf("Server running at http://[::]:8080\n")
	if err := http.ListenAndServe(":"+cfg.Server.Port, middleware.CORSMiddleware(mux)); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
