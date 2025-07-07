package handlers

import (
	"context"
	"fmt"
	"io"
	"log"
	"sync"
	"time"

	"fintech-api/pkg/services"
	pb "fintech-api/proto/gen/payment"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// PaymentHandler implements the PaymentServiceServer
type PaymentHandler struct {
	pb.UnimplementedPaymentServiceServer
	ledgerService *services.LedgerService
	// Monitoring session management
	monitoringSessions sync.Map // sessionID -> *MonitoringSession
}

// MonitoringSession represents an active monitoring session
type MonitoringSession struct {
	ID              string
	UserID          string
	Filter          *pb.StartMonitoring
	EventChannel    chan *pb.TransactionEvent
	StopChannel     chan bool
	IsActive        bool
	StartedAt       time.Time
	ConnectionCount int32
	mu              sync.RWMutex
}

// NewPaymentHandler creates a new payment handler
func NewPaymentHandler(ledgerService *services.LedgerService) *PaymentHandler {
	return &PaymentHandler{
		ledgerService: ledgerService,
	}
}

// CreatePayment kicks off a funds-out flow
func (h *PaymentHandler) CreatePayment(ctx context.Context, req *pb.CreatePaymentRequest) (*pb.CreatePaymentResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "CreatePayment not yet implemented")
}

// GetPayment retrieves payment status
func (h *PaymentHandler) GetPayment(ctx context.Context, req *pb.GetPaymentRequest) (*pb.GetPaymentResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "GetPayment not yet implemented")
}

// StreamPayments provides real-time payment updates
func (h *PaymentHandler) StreamPayments(req *pb.StreamPaymentsRequest, stream grpc.ServerStreamingServer[pb.PaymentUpdate]) error {
	return status.Errorf(codes.Unimplemented, "StreamPayments not yet implemented")
}

// TransactionMonitor handles bidirectional streaming for real-time transaction monitoring
func (h *PaymentHandler) TransactionMonitor(stream grpc.BidiStreamingServer[pb.MonitorCommand, pb.TransactionEvent]) error {
	log.Printf("New TransactionMonitor connection established")

	sessionID := fmt.Sprintf("session-%d", time.Now().UnixNano())
	session := &MonitoringSession{
		ID:           sessionID,
		EventChannel: make(chan *pb.TransactionEvent, 100),
		StopChannel:  make(chan bool, 1),
		IsActive:     false,
		StartedAt:    time.Now(),
	}

	// Store session
	h.monitoringSessions.Store(sessionID, session)
	defer h.monitoringSessions.Delete(sessionID)
	defer close(session.EventChannel)
	defer close(session.StopChannel)

	// Context for cancellation
	ctx := stream.Context()

	// Goroutine to handle incoming client commands
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Recovered from panic in command handler: %v", r)
			}
		}()

		for {
			req, err := stream.Recv()
			if err == io.EOF {
				log.Printf("Client closed connection for session %s", sessionID)
				session.StopChannel <- true
				return
			}
			if err != nil {
				log.Printf("Error receiving command for session %s: %v", sessionID, err)
				session.StopChannel <- true
				return
			}

			if err := h.handleMonitorCommand(session, req); err != nil {
				log.Printf("Error handling command for session %s: %v", sessionID, err)
				// Send error response
				errorResponse := &pb.TransactionEvent{
					Event: &pb.TransactionEvent_Status{
						Status: &pb.MonitoringStatus{
							IsActive:  false,
							StartedAt: timestamppb.New(session.StartedAt),
							Message:   fmt.Sprintf("Error: %v", err),
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
			log.Printf("Context cancelled for session %s", sessionID)
			return ctx.Err()

		case <-session.StopChannel:
			log.Printf("Stop signal received for session %s", sessionID)
			return nil

		case event := <-session.EventChannel:
			if err := stream.Send(event); err != nil {
				log.Printf("Error sending event for session %s: %v", sessionID, err)
				return err
			}

		case <-time.After(30 * time.Second):
			// Send periodic heartbeat if monitoring is active
			if session.IsActive {
				statsEvent := h.generateStatsEvent(session)
				if err := stream.Send(statsEvent); err != nil {
					log.Printf("Error sending stats event for session %s: %v", sessionID, err)
					return err
				}
			}
		}
	}
}

// handleMonitorCommand processes incoming client commands
func (h *PaymentHandler) handleMonitorCommand(session *MonitoringSession, cmd *pb.MonitorCommand) error {
	switch command := cmd.Command.(type) {
	case *pb.MonitorCommand_StartMonitoring:
		return h.handleStartMonitoring(session, command.StartMonitoring)
	case *pb.MonitorCommand_StopMonitoring:
		return h.handleStopMonitoring(session, command.StopMonitoring)
	case *pb.MonitorCommand_UpdateFilter:
		return h.handleUpdateFilter(session, command.UpdateFilter)
	case *pb.MonitorCommand_GetStats:
		return h.handleGetStats(session, command.GetStats)
	default:
		return fmt.Errorf("unknown command type")
	}
}

// handleStartMonitoring starts monitoring with given filters
func (h *PaymentHandler) handleStartMonitoring(session *MonitoringSession, req *pb.StartMonitoring) error {
	session.mu.Lock()
	defer session.mu.Unlock()

	session.Filter = req
	session.UserID = req.UserId
	session.IsActive = true

	log.Printf("Started monitoring for session %s with user_id: %s", session.ID, req.UserId)

	// Send confirmation
	statusEvent := &pb.TransactionEvent{
		Event: &pb.TransactionEvent_Status{
			Status: &pb.MonitoringStatus{
				IsActive:         true,
				ConnectionsCount: 1,
				StartedAt:        timestamppb.New(session.StartedAt),
				Message:          "Monitoring started successfully",
				CurrentFilter:    fmt.Sprintf("UserID: %s, Filters: %+v", req.UserId, req),
			},
		},
	}
	session.EventChannel <- statusEvent

	// Start simulating payment events (in real implementation, this would listen to actual events)
	go h.simulatePaymentEvents(session)

	return nil
}

// handleStopMonitoring stops monitoring
func (h *PaymentHandler) handleStopMonitoring(session *MonitoringSession, req *pb.StopMonitoring) error {
	session.mu.Lock()
	defer session.mu.Unlock()

	session.IsActive = false

	log.Printf("Stopped monitoring for session %s, reason: %s", session.ID, req.Reason)

	// Send confirmation
	statusEvent := &pb.TransactionEvent{
		Event: &pb.TransactionEvent_Status{
			Status: &pb.MonitoringStatus{
				IsActive: false,
				Message:  fmt.Sprintf("Monitoring stopped: %s", req.Reason),
			},
		},
	}
	session.EventChannel <- statusEvent

	return nil
}

// handleUpdateFilter updates monitoring filters
func (h *PaymentHandler) handleUpdateFilter(session *MonitoringSession, req *pb.UpdateFilter) error {
	session.mu.Lock()
	defer session.mu.Unlock()

	session.Filter = req.NewFilter

	log.Printf("Updated filter for session %s", session.ID)

	// Send confirmation
	statusEvent := &pb.TransactionEvent{
		Event: &pb.TransactionEvent_Status{
			Status: &pb.MonitoringStatus{
				IsActive:      session.IsActive,
				Message:       "Filter updated successfully",
				CurrentFilter: fmt.Sprintf("Updated: %+v", req.NewFilter),
			},
		},
	}
	session.EventChannel <- statusEvent

	return nil
}

// handleGetStats returns current monitoring statistics
func (h *PaymentHandler) handleGetStats(session *MonitoringSession, req *pb.GetStats) error {
	statsEvent := h.generateStatsEvent(session)
	session.EventChannel <- statsEvent
	return nil
}

// generateStatsEvent creates a statistics event
func (h *PaymentHandler) generateStatsEvent(session *MonitoringSession) *pb.TransactionEvent {
	session.mu.RLock()
	defer session.mu.RUnlock()

	return &pb.TransactionEvent{
		Event: &pb.TransactionEvent_Stats{
			Stats: &pb.MonitoringStats{
				TotalTransactions: 42, // Mock data
				TotalVolume:       125000.50,
				RailBreakdown: map[string]int32{
					"UPI":  15,
					"SEPA": 12,
					"ACH":  15,
				},
				CurrencyBreakdown: map[string]float64{
					"USD": 75000.25,
					"EUR": 35000.15,
					"INR": 15000.10,
				},
				AvgTransactionSize: 2976.20,
				SuccessRate:        0.98,
				GeneratedAt:        timestamppb.Now(),
			},
		},
	}
}

// simulatePaymentEvents generates mock payment events for demonstration
func (h *PaymentHandler) simulatePaymentEvents(session *MonitoringSession) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	paymentCounter := 1

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

			// Generate mock payment event
			mockPayment := &pb.Payment{
				PaymentId:     fmt.Sprintf("pay_%s_%d", session.ID[:8], paymentCounter),
				UserId:        session.UserID,
				FromAccountId: "acc_sender_123",
				ToAccountId:   "acc_receiver_456",
				Amount:        float64(100 + (paymentCounter % 1000)),
				Currency:      "USD",
				Description:   fmt.Sprintf("Mock payment #%d", paymentCounter),
				Status:        pb.PaymentStatus_PAYMENT_STATUS_PROCESSING,
				ChosenRail:    pb.PaymentRail_PAYMENT_RAIL_ACH,
				CreatedAt:     timestamppb.Now(),
				UpdatedAt:     timestamppb.Now(),
			}

			paymentEvent := &pb.TransactionEvent{
				Event: &pb.TransactionEvent_PaymentUpdate{
					PaymentUpdate: &pb.PaymentUpdate{
						Payment:    mockPayment,
						UpdateType: "status_change",
						Timestamp:  timestamppb.Now(),
					},
				},
			}

			// Send alert for high-value transactions
			if mockPayment.Amount > 500 {
				alertEvent := &pb.TransactionEvent{
					Event: &pb.TransactionEvent_Alert{
						Alert: &pb.MonitoringAlert{
							AlertType:   "high_volume",
							Description: fmt.Sprintf("High-value transaction detected: $%.2f", mockPayment.Amount),
							Transaction: mockPayment,
							Severity:    "medium",
							TriggeredAt: timestamppb.Now(),
						},
					},
				}
				session.EventChannel <- alertEvent
			}

			session.EventChannel <- paymentEvent
			paymentCounter++
		}
	}
}
