package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"fintech-api/api"
	"fintech-api/internal/config"
	"fintech-api/internal/database"
	"fintech-api/pkg/logger"

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

	// Initialize KYC service after database is ready
	api.InitializeKYCService()

	// Seed database with initial data if needed
	if err := seedDatabase(); err != nil {
		logger.Warnf("Failed to seed database: %v", err)
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

// seedDatabase populates the database with initial data
func seedDatabase() error {
	// Check if there's already data
	var count int64
	if err := database.GetDB().Table("kyc_submission").Count(&count).Error; err != nil {
		return fmt.Errorf("failed to check existing data: %w", err)
	}

	// Only seed if there's no existing data
	if count > 0 {
		logger.Info("Database already contains KYC submissions, skipping seed")
		return nil
	}

	logger.Info("Seeding database with initial KYC submissions...")

	// Create seed data using raw SQL for better control
	seedSQL := `
-- Create some test users first (if they don't exist)
INSERT INTO "user" (id, email, password, first_name, last_name, phone, is_active, is_verified, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'rajesh@example.com', '$2a$10$dummy', 'Rajesh', 'Kumar', '+91 98765 43210', true, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'priya@example.com', '$2a$10$dummy', 'Priya', 'Sharma', '+91 87654 32109', true, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'amit@example.com', '$2a$10$dummy', 'Amit', 'Patel', '+91 76543 21098', true, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'sneha@example.com', '$2a$10$dummy', 'Sneha', 'Gupta', '+91 65432 10987', true, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'arjun@example.com', '$2a$10$dummy', 'Arjun', 'Singh', '+91 54321 09876', true, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create KYC submissions
INSERT INTO kyc_submission (
  id, user_id, name, country, email, phone, status, submitted_at, verified_at,
  risk_score, notes, avatar, location, amount, priority, processing_time,
  last_activity, verification_method, compliance_flags, review_notes, created_at, updated_at
) VALUES 
  (
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Rajesh Kumar',
    'IN',
    'rajesh@example.com',
    '+91 98765 43210',
    'verified',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '30 minutes',
    15,
    'All documents verified successfully',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'Mumbai, India',
    12500000, -- 1.25 lakh in paise
    'low',
    '4h 30m',
    '30 minutes ago',
    'AI + Manual Review',
    '[]'::jsonb,
    'Clean verification, no additional checks required',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '30 minutes'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'Priya Sharma',
    'IN',
    'priya@example.com',
    '+91 87654 32109',
    'pending',
    NOW() - INTERVAL '15 minutes',
    NULL,
    25,
    'Pending verification',
    'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
    'Delhi, India',
    8750000, -- 87.5k in paise
    'medium',
    'Processing...',
    '15 minutes ago',
    'AI Processing',
    '["address_mismatch"]'::jsonb,
    'Minor address discrepancy under review',
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '15 minutes'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440003',
    'Amit Patel',
    'IN',
    'amit@example.com',
    '+91 76543 21098',
    'under_review',
    NOW() - INTERVAL '1 hour',
    NULL,
    35,
    'PAN verification requires manual review',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'Bangalore, India',
    25000000, -- 2.5 lakh in paise
    'high',
    'Processing...',
    '1 hour ago',
    'Manual Review',
    '["high_risk_transaction", "enhanced_due_diligence"]'::jsonb,
    'High-value transaction requires enhanced verification',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440004',
    'Sneha Gupta',
    'IN',
    'sneha@example.com',
    '+91 65432 10987',
    'rejected',
    NOW() - INTERVAL '2 days',
    NULL,
    85,
    'Document quality insufficient for verification',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'Chennai, India',
    4500000, -- 45k in paise
    'low',
    'N/A',
    '2 days ago',
    'AI Processing',
    '["poor_document_quality", "suspicious_activity"]'::jsonb,
    'Documents were unclear and required better quality uploads',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440005',
    'Arjun Singh',
    'IN',
    'arjun@example.com',
    '+91 54321 09876',
    'verified',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '20 hours',
    10,
    'Verified successfully',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'Pune, India',
    17500000, -- 1.75 lakh in paise
    'medium',
    '4h 0m',
    '20 hours ago',
    'AI + Manual Review',
    '[]'::jsonb,
    'Standard verification completed successfully',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '20 hours'
  );

-- Create corresponding KYC documents
INSERT INTO kyc_document (
  id, kyc_submission_id, type, status, document_number, uploaded_at, verified_at, created_at, updated_at
) VALUES 
  -- Documents for Rajesh Kumar (verified)
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'aadhaar', 'verified', '123456789012', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours'),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'pan', 'verified', 'ABCDE1234F', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours'),
  
  -- Documents for Priya Sharma (pending)
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 'aadhaar', 'pending', '234567890123', NOW() - INTERVAL '15 minutes', NULL, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', 'pan', 'pending', 'BCDEF2345G', NOW() - INTERVAL '15 minutes', NULL, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
  
  -- Documents for Amit Patel (under review)
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', 'aadhaar', 'verified', '345678901234', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '45 minutes'),
  ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440003', 'pan', 'under_review', 'CDEFG3456H', NOW() - INTERVAL '1 hour', NULL, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
  
  -- Documents for Sneha Gupta (rejected)
  ('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440004', 'aadhaar', 'rejected', '456789012345', NOW() - INTERVAL '2 days', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440004', 'pan', 'rejected', 'DEFGH4567I', NOW() - INTERVAL '2 days', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  
  -- Documents for Arjun Singh (verified)
  ('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440005', 'aadhaar', 'verified', '567890123456', NOW() - INTERVAL '1 day', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '20 hours'),
  ('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440005', 'pan', 'verified', 'EFGHI5678J', NOW() - INTERVAL '1 day', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '20 hours');
`

	if err := database.GetDB().Exec(seedSQL).Error; err != nil {
		return fmt.Errorf("failed to execute seed SQL: %w", err)
	}

	logger.Info("Database seeded successfully with 5 KYC submissions and 10 documents")
	return nil
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

	// KYC routes
	kyc := router.Group("/api/kyc")
	{
		kyc.Any("/*any", func(c *gin.Context) {
			// Convert Gin context to standard http.ResponseWriter and http.Request
			api.KYCHandler(c.Writer, c.Request)
		})
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
