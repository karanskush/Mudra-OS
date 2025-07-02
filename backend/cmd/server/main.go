package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"fintech-backend/internal/config"
	"fintech-backend/internal/database"
	"fintech-backend/pkg/logger"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Printf("Failed to load configuration: %v\n", err)
		os.Exit(1)
	}

	// Initialize logger
	logger.Init(cfg.Logging.Level, cfg.Logging.Format)
	logger.Info("Starting Fintech Backend Server")

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Setup Neon database (extensions and migrations)
	if err := database.SetupNeonDatabase(); err != nil {
		logger.Fatalf("Failed to setup Neon database: %v", err)
	}

	// Log connection info
	connInfo := database.GetNeonConnectionInfo()
	logger.Infof("Neon database connection info: %+v", connInfo)

	// Set Gin mode
	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router
	router := gin.New()

	// Add middleware
	router.Use(gin.Recovery())
	router.Use(gin.Logger())

	// Setup routes
	setupRoutes(router, cfg)

	// Create server
	server := &http.Server{
		Addr:         fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		logger.Infof("Server starting on %s:%s", cfg.Server.Host, cfg.Server.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Create a deadline for server shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		logger.Errorf("Server forced to shutdown: %v", err)
	}

	logger.Info("Server exited")
}

// setupRoutes configures all the routes for the application
func setupRoutes(router *gin.Engine, cfg *config.Config) {
	// Health check with database status
	router.GET("/health", func(c *gin.Context) {
		// Check database connection
		dbStatus := "unknown"
		dbInfo := make(map[string]interface{})

		if database.GetDB() != nil {
			if err := database.GetDB().Raw("SELECT 1").Error; err != nil {
				dbStatus = "error"
				dbInfo["error"] = err.Error()
			} else {
				dbStatus = "connected"
				dbInfo = database.GetNeonConnectionInfo()
			}
		} else {
			dbStatus = "disconnected"
			dbInfo["error"] = "Database not initialized"
		}

		// Determine overall status
		overallStatus := "ok"
		message := "Fintech Backend is running with Neon database"

		if dbStatus == "error" || dbStatus == "disconnected" {
			overallStatus = "degraded"
			message = "Fintech Backend is running but database connection has issues"
		}

		response := gin.H{
			"status":    overallStatus,
			"message":   message,
			"time":      time.Now().UTC(),
			"timestamp": time.Now().Unix(),
			"database":  dbInfo,
		}

		// Set appropriate HTTP status code
		if overallStatus == "ok" {
			c.JSON(http.StatusOK, response)
		} else {
			c.JSON(http.StatusServiceUnavailable, response)
		}
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Auth routes
		auth := v1.Group("/auth")
		{
			auth.POST("/register", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Register endpoint - to be implemented"})
			})
			auth.POST("/login", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Login endpoint - to be implemented"})
			})
			auth.POST("/logout", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Logout endpoint - to be implemented"})
			})
		}

		// User routes
		users := v1.Group("/users")
		{
			users.GET("/profile", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Get profile endpoint - to be implemented"})
			})
			users.PUT("/profile", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Update profile endpoint - to be implemented"})
			})
		}

		// Account routes
		accounts := v1.Group("/accounts")
		{
			accounts.GET("/", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "List accounts endpoint - to be implemented"})
			})
			accounts.POST("/", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Create account endpoint - to be implemented"})
			})
			accounts.GET("/:id", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Get account endpoint - to be implemented"})
			})
		}

		// Transaction routes
		transactions := v1.Group("/transactions")
		{
			transactions.GET("/", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "List transactions endpoint - to be implemented"})
			})
			transactions.POST("/", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Create transaction endpoint - to be implemented"})
			})
			transactions.GET("/:id", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Get transaction endpoint - to be implemented"})
			})
		}

		// Payment routes
		payments := v1.Group("/payments")
		{
			payments.POST("/", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Process payment endpoint - to be implemented"})
			})
			payments.GET("/:id", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"message": "Get payment endpoint - to be implemented"})
			})
		}
	}

	// Swagger documentation
	router.GET("/swagger/*any", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Swagger documentation - to be implemented"})
	})

	// 404 handler
	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "not_found",
			"message": "The requested resource was not found",
		})
	})
}
