package main

import (
	"log"
	"net/http"

	"fintech-api/pkg/config"
	"fintech-api/pkg/database"
	"fintech-api/pkg/logger"
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

	// User model is already migrated in SetupNeonDatabase() - removing redundant migration

	// Run ledger migrations
	if err := database.MigrateLedgerTables(database.GetDB()); err != nil {
		log.Fatalf("Failed to migrate ledger tables: %v", err)
	}

	// Log connection info
	connInfo := database.GetNeonConnectionInfo()
	log.Printf("Neon database connection info: %+v", connInfo)

	mux := http.NewServeMux()

	// Route all API requests to the Handler
	mux.HandleFunc("/", Handler)

	addr := ":" + cfg.Server.Port
	log.Printf("Server running at http://localhost%s\n", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
