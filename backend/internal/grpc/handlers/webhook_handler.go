package handlers

import (
	"context"
	"fmt"
	"io"
	"log"
	"sync"
	"time"

	webhook "fintech-backend/proto/gen/webhook"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
	"gorm.io/gorm"
)

// WebhookHandler implements the WebhookServiceServer
type WebhookHandler struct {
	webhook.UnimplementedWebhookServiceServer
	db *gorm.DB
	// Debug session management
	debugSessions sync.Map // sessionID -> *DebugSession
}

// DebugSession represents an active webhook debugging session
type DebugSession struct {
	ID           string
	WebhookID    string
	Config       *webhook.StartDebugging
	EventChannel chan *webhook.WebhookDebugResponse
	StopChannel  chan bool
	IsActive     bool
	StartedAt    time.Time
	mu           sync.RWMutex
}

// NewWebhookHandler creates a new webhook handler
func NewWebhookHandler(db *gorm.DB) *WebhookHandler {
	return &WebhookHandler{
		db: db,
	}
}

// Register registers a new webhook subscription
func (h *WebhookHandler) Register(ctx context.Context, req *webhook.RegisterWebhookRequest) (*webhook.RegisterWebhookResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "Register not yet implemented")
}

// Delete removes a webhook subscription
func (h *WebhookHandler) Delete(ctx context.Context, req *webhook.DeleteWebhookRequest) (*webhook.DeleteWebhookResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "Delete not yet implemented")
}

// List returns all webhooks for a user
func (h *WebhookHandler) List(ctx context.Context, req *webhook.ListWebhooksRequest) (*webhook.ListWebhooksResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "List not yet implemented")
}

// Test tests a webhook endpoint
func (h *WebhookHandler) Test(ctx context.Context, req *webhook.TestWebhookRequest) (*webhook.TestWebhookResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "Test not yet implemented")
}

// WebhookDebugger handles bidirectional streaming for live webhook debugging
func (h *WebhookHandler) WebhookDebugger(stream grpc.BidiStreamingServer[webhook.WebhookDebugCommand, webhook.WebhookDebugResponse]) error {
	log.Printf("New WebhookDebugger connection established")

	sessionID := fmt.Sprintf("debug-session-%d", time.Now().UnixNano())
	session := &DebugSession{
		ID:           sessionID,
		EventChannel: make(chan *webhook.WebhookDebugResponse, 100),
		StopChannel:  make(chan bool, 1),
		IsActive:     false,
		StartedAt:    time.Now(),
	}

	// Store session
	h.debugSessions.Store(sessionID, session)
	defer h.debugSessions.Delete(sessionID)
	defer close(session.EventChannel)
	defer close(session.StopChannel)

	// Context for cancellation
	ctx := stream.Context()

	// Goroutine to handle incoming client commands
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Recovered from panic in webhook debug handler: %v", r)
			}
		}()

		for {
			req, err := stream.Recv()
			if err == io.EOF {
				log.Printf("Client closed webhook debug connection for session %s", sessionID)
				session.StopChannel <- true
				return
			}
			if err != nil {
				log.Printf("Error receiving webhook debug command for session %s: %v", sessionID, err)
				session.StopChannel <- true
				return
			}

			if err := h.handleDebugCommand(session, req); err != nil {
				log.Printf("Error handling webhook debug command for session %s: %v", sessionID, err)
				// Send error response
				errorResponse := &webhook.WebhookDebugResponse{
					Response: &webhook.WebhookDebugResponse_DebugStatus{
						DebugStatus: &webhook.DebugStatus{
							IsDebugging:       false,
							WebhookId:         session.WebhookID,
							ActiveConnections: 0,
							StartedAt:         timestamppb.New(session.StartedAt),
							Message:           fmt.Sprintf("Error: %v", err),
						},
					},
				}
				session.EventChannel <- errorResponse
			}
		}
	}()

	// Main loop to send events to client
	for {
		select {
		case <-ctx.Done():
			log.Printf("Context cancelled for webhook debug session %s", sessionID)
			return ctx.Err()

		case <-session.StopChannel:
			log.Printf("Stop signal received for webhook debug session %s", sessionID)
			return nil

		case event := <-session.EventChannel:
			if err := stream.Send(event); err != nil {
				log.Printf("Error sending webhook debug event for session %s: %v", sessionID, err)
				return err
			}

		case <-time.After(10 * time.Second):
			// Send periodic stats if debugging is active
			if session.IsActive {
				statsEvent := h.generateDebugStats(session)
				if err := stream.Send(statsEvent); err != nil {
					log.Printf("Error sending webhook debug stats for session %s: %v", sessionID, err)
					return err
				}
			}
		}
	}
}

// handleDebugCommand processes incoming client debug commands
func (h *WebhookHandler) handleDebugCommand(session *DebugSession, cmd *webhook.WebhookDebugCommand) error {
	switch command := cmd.Command.(type) {
	case *webhook.WebhookDebugCommand_StartDebugging:
		return h.handleStartDebugging(session, command.StartDebugging)
	case *webhook.WebhookDebugCommand_StopDebugging:
		return h.handleStopDebugging(session, command.StopDebugging)
	case *webhook.WebhookDebugCommand_TestEndpoint:
		return h.handleTestEndpoint(session, command.TestEndpoint)
	case *webhook.WebhookDebugCommand_UpdateConfig:
		return h.handleUpdateConfig(session, command.UpdateConfig)
	case *webhook.WebhookDebugCommand_RetryDelivery:
		return h.handleRetryDelivery(session, command.RetryDelivery)
	default:
		return fmt.Errorf("unknown webhook debug command type")
	}
}

// handleStartDebugging starts webhook debugging
func (h *WebhookHandler) handleStartDebugging(session *DebugSession, req *webhook.StartDebugging) error {
	session.mu.Lock()
	defer session.mu.Unlock()

	session.Config = req
	session.WebhookID = req.WebhookId
	session.IsActive = true

	log.Printf("Started webhook debugging for session %s with webhook_id: %s", session.ID, req.WebhookId)

	// Send confirmation
	statusEvent := &webhook.WebhookDebugResponse{
		Response: &webhook.WebhookDebugResponse_DebugStatus{
			DebugStatus: &webhook.DebugStatus{
				IsDebugging:       true,
				WebhookId:         req.WebhookId,
				ActiveConnections: 1,
				StartedAt:         timestamppb.New(session.StartedAt),
				Configuration:     fmt.Sprintf("Capture Requests: %v, Capture Responses: %v, Verbose: %v", req.CaptureRequests, req.CaptureResponses, req.EnableVerboseLogging),
				Message:           "Webhook debugging started successfully",
			},
		},
	}
	session.EventChannel <- statusEvent

	// Start simulating webhook deliveries (in real implementation, this would listen to actual webhook events)
	go h.simulateWebhookDeliveries(session)

	return nil
}

// handleStopDebugging stops webhook debugging
func (h *WebhookHandler) handleStopDebugging(session *DebugSession, req *webhook.StopDebugging) error {
	session.mu.Lock()
	defer session.mu.Unlock()

	session.IsActive = false

	log.Printf("Stopped webhook debugging for session %s, reason: %s", session.ID, req.Reason)

	// Send confirmation
	statusEvent := &webhook.WebhookDebugResponse{
		Response: &webhook.WebhookDebugResponse_DebugStatus{
			DebugStatus: &webhook.DebugStatus{
				IsDebugging: false,
				WebhookId:   session.WebhookID,
				Message:     fmt.Sprintf("Webhook debugging stopped: %s", req.Reason),
			},
		},
	}
	session.EventChannel <- statusEvent

	return nil
}

// handleTestEndpoint tests a webhook endpoint
func (h *WebhookHandler) handleTestEndpoint(session *DebugSession, req *webhook.TestEndpoint) error {
	log.Printf("Testing webhook endpoint: %s", req.Url)

	// Simulate webhook delivery test
	deliveryEvent := &webhook.WebhookDebugResponse{
		Response: &webhook.WebhookDebugResponse_DeliveryAttempt{
			DeliveryAttempt: &webhook.DeliveryAttempt{
				DeliveryId: fmt.Sprintf("test-delivery-%d", time.Now().UnixNano()),
				WebhookId:  session.WebhookID,
				Url:        req.Url,
				Method:     "POST",
				RequestHeaders: map[string]string{
					"Content-Type":     "application/json",
					"X-Webhook-Event":  req.EventType.String(),
					"X-Webhook-Source": "fintech-system",
				},
				RequestBody:     req.CustomPayload,
				ResponseStatus:  200,
				ResponseHeaders: map[string]string{"Content-Type": "application/json"},
				ResponseBody:    `{"status": "ok", "message": "webhook received"}`,
				ResponseTimeMs:  float64(150 + (time.Now().UnixNano() % 100)), // Mock latency
				Successful:      true,
				AttemptedAt:     timestamppb.Now(),
			},
		},
	}
	session.EventChannel <- deliveryEvent

	return nil
}

// handleUpdateConfig updates webhook configuration
func (h *WebhookHandler) handleUpdateConfig(session *DebugSession, req *webhook.UpdateConfig) error {
	log.Printf("Updating webhook config for webhook_id: %s", req.WebhookId)

	// Send confirmation
	statusEvent := &webhook.WebhookDebugResponse{
		Response: &webhook.WebhookDebugResponse_DebugStatus{
			DebugStatus: &webhook.DebugStatus{
				IsDebugging: session.IsActive,
				WebhookId:   req.WebhookId,
				Message:     "Webhook configuration updated successfully",
			},
		},
	}
	session.EventChannel <- statusEvent

	return nil
}

// handleRetryDelivery retries a failed webhook delivery
func (h *WebhookHandler) handleRetryDelivery(session *DebugSession, req *webhook.RetryDelivery) error {
	log.Printf("Retrying webhook delivery: %s", req.DeliveryId)

	// Simulate retry attempt
	deliveryEvent := &webhook.WebhookDebugResponse{
		Response: &webhook.WebhookDebugResponse_DeliveryAttempt{
			DeliveryAttempt: &webhook.DeliveryAttempt{
				DeliveryId: req.DeliveryId,
				WebhookId:  session.WebhookID,
				Url:        "https://example.com/webhook",
				Method:     "POST",
				RequestHeaders: map[string]string{
					"Content-Type":    "application/json",
					"X-Retry-Attempt": "true",
				},
				RequestBody:    `{"event": "payment.completed", "retry": true}`,
				ResponseStatus: 200,
				ResponseHeaders: map[string]string{
					"Content-Type": "application/json",
				},
				ResponseBody:   `{"status": "ok", "message": "retry successful"}`,
				ResponseTimeMs: 125.5,
				Successful:     true,
				AttemptedAt:    timestamppb.Now(),
			},
		},
	}
	session.EventChannel <- deliveryEvent

	return nil
}

// generateDebugStats creates debug statistics
func (h *WebhookHandler) generateDebugStats(session *DebugSession) *webhook.WebhookDebugResponse {
	session.mu.RLock()
	defer session.mu.RUnlock()

	return &webhook.WebhookDebugResponse{
		Response: &webhook.WebhookDebugResponse_DebugStats{
			DebugStats: &webhook.DebugStats{
				WebhookId:          session.WebhookID,
				TotalAttempts:      25, // Mock data
				SuccessfulAttempts: 23,
				FailedAttempts:     2,
				AvgResponseTimeMs:  145.7,
				SuccessRate:        0.92,
				StatusCodeBreakdown: map[string]int32{
					"200": 23,
					"500": 1,
					"404": 1,
				},
				PeriodStart: timestamppb.New(session.StartedAt),
				PeriodEnd:   timestamppb.Now(),
			},
		},
	}
}

// simulateWebhookDeliveries generates mock webhook delivery events
func (h *WebhookHandler) simulateWebhookDeliveries(session *DebugSession) {
	ticker := time.NewTicker(8 * time.Second)
	defer ticker.Stop()

	deliveryCounter := 1

	for {
		select {
		case <-session.StopChannel:
			return
		case <-ticker.C:
			session.mu.RLock()
			isActive := session.IsActive
			session.mu.RUnlock()

			if !isActive {
				continue
			}

			// Generate mock delivery attempt
			successful := deliveryCounter%5 != 0 // 80% success rate
			statusCode := int32(200)
			responseBody := `{"status": "ok"}`
			errorMsg := ""

			if !successful {
				statusCode = int32(500)
				responseBody = `{"error": "internal server error"}`
				errorMsg = "Connection timeout"
			}

			deliveryEvent := &webhook.WebhookDebugResponse{
				Response: &webhook.WebhookDebugResponse_DeliveryAttempt{
					DeliveryAttempt: &webhook.DeliveryAttempt{
						DeliveryId: fmt.Sprintf("delivery_%s_%d", session.ID[:8], deliveryCounter),
						WebhookId:  session.WebhookID,
						Url:        "https://api.client.com/webhook",
						Method:     "POST",
						RequestHeaders: map[string]string{
							"Content-Type":     "application/json",
							"X-Webhook-Event":  "payment.completed",
							"X-Webhook-ID":     session.WebhookID,
							"X-Delivery-Count": fmt.Sprintf("%d", deliveryCounter),
						},
						RequestBody:    fmt.Sprintf(`{"event": "payment.completed", "payment_id": "pay_%d", "amount": 150.00}`, deliveryCounter),
						ResponseStatus: statusCode,
						ResponseHeaders: map[string]string{
							"Content-Type": "application/json",
						},
						ResponseBody:   responseBody,
						ResponseTimeMs: float64(100 + (deliveryCounter % 200)), // Mock variable latency
						Successful:     successful,
						ErrorMessage:   errorMsg,
						AttemptedAt:    timestamppb.Now(),
					},
				},
			}

			session.EventChannel <- deliveryEvent

			// Add debug logs
			if session.Config != nil && session.Config.EnableVerboseLogging {
				logEvent := &webhook.WebhookDebugResponse{
					Response: &webhook.WebhookDebugResponse_DebugLog{
						DebugLog: &webhook.DebugLog{
							Level:      "info",
							Message:    fmt.Sprintf("Webhook delivery attempt #%d completed", deliveryCounter),
							WebhookId:  session.WebhookID,
							DeliveryId: fmt.Sprintf("delivery_%s_%d", session.ID[:8], deliveryCounter),
							Metadata: map[string]string{
								"status_code":   fmt.Sprintf("%d", statusCode),
								"response_time": fmt.Sprintf("%.1fms", float64(100+(deliveryCounter%200))),
								"success":       fmt.Sprintf("%v", successful),
							},
							Timestamp: timestamppb.Now(),
						},
					},
				}
				session.EventChannel <- logEvent
			}

			deliveryCounter++
		}
	}
}
