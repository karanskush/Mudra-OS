package handlers

import (
	"fmt"
	"io"
	"log"
	"sync"
	"time"

	"fintech-api/internal/database"
	"fintech-api/internal/models"
	"fintech-api/internal/services"
	paymentprocessing "fintech-api/proto/gen/payment_processing"

	"github.com/google/uuid"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// PaymentProcessingHandler implements the PaymentProcessingServiceServer
type PaymentProcessingHandler struct {
	paymentprocessing.UnimplementedPaymentProcessingServiceServer
	ledgerService *services.LedgerService
	// Active streaming sessions
	sessions sync.Map // sessionID -> *StreamingSession
}

// StreamingSession represents an active streaming session
type StreamingSession struct {
	ID           string
	UserID       string
	EventChannel chan *paymentprocessing.PaymentResponse
	StopChannel  chan bool
	IsActive     bool
	StartedAt    time.Time
	mu           sync.RWMutex
}

// NewPaymentProcessingHandler creates a new payment processing handler
func NewPaymentProcessingHandler(ledgerService *services.LedgerService) *PaymentProcessingHandler {
	handler := &PaymentProcessingHandler{
		ledgerService: ledgerService,
	}

	// Start background monitoring of transactions
	go handler.monitorTransactions()

	return handler
}

// ProcessPayments implements bidirectional streaming for payment processing
func (h *PaymentProcessingHandler) ProcessPayments(stream grpc.BidiStreamingServer[paymentprocessing.PaymentRequest, paymentprocessing.PaymentResponse]) error {
	sessionID := uuid.New().String()
	session := &StreamingSession{
		ID:           sessionID,
		EventChannel: make(chan *paymentprocessing.PaymentResponse, 100),
		StopChannel:  make(chan bool, 1),
		IsActive:     true,
		StartedAt:    time.Now(),
	}

	// Store session
	h.sessions.Store(sessionID, session)
	defer func() {
		session.mu.Lock()
		session.IsActive = false
		session.mu.Unlock()
		h.sessions.Delete(sessionID)
		close(session.EventChannel)
		close(session.StopChannel)
	}()

	log.Printf("Payment processing stream started: %s", sessionID)

	// Send initial connection confirmation
	initResponse := &paymentprocessing.PaymentResponse{
		Response: &paymentprocessing.PaymentResponse_StatusUpdate{
			StatusUpdate: &paymentprocessing.PaymentStatusUpdate{
				PaymentId: "system",
				Status:    paymentprocessing.PaymentStatus_PAYMENT_STATUS_PROCESSING,
				Message:   "Payment processing stream connected",
				UpdatedAt: timestamppb.Now(),
			},
		},
	}

	if err := stream.Send(initResponse); err != nil {
		log.Printf("Failed to send initial response: %v", err)
		return err
	}

	// Handle incoming messages and send responses
	errChan := make(chan error, 1)

	// Goroutine to handle incoming requests
	go func() {
		for {
			req, err := stream.Recv()
			if err == io.EOF {
				log.Printf("Client closed stream: %s", sessionID)
				return
			}
			if err != nil {
				log.Printf("Error receiving request: %v", err)
				errChan <- err
				return
			}

			// Process the request
			if err := h.processPaymentRequest(req, session); err != nil {
				log.Printf("Error processing payment request: %v", err)
				// Send error response
				errorResponse := &paymentprocessing.PaymentResponse{
					Response: &paymentprocessing.PaymentResponse_PaymentError{
						PaymentError: &paymentprocessing.PaymentError{
							PaymentId:    "unknown",
							ErrorCode:    "PROCESSING_ERROR",
							ErrorMessage: err.Error(),
							ErrorAt:      timestamppb.Now(),
						},
					},
				}
				if sendErr := stream.Send(errorResponse); sendErr != nil {
					log.Printf("Failed to send error response: %v", sendErr)
				}
			}
		}
	}()

	// Goroutine to send events from the session channel
	go func() {
		for {
			select {
			case event := <-session.EventChannel:
				if err := stream.Send(event); err != nil {
					log.Printf("Failed to send event: %v", err)
					errChan <- err
					return
				}
			case <-session.StopChannel:
				log.Printf("Session stopped: %s", sessionID)
				return
			}
		}
	}()

	// Wait for either goroutine to finish
	select {
	case err := <-errChan:
		return err
	}
}

// processPaymentRequest handles incoming payment requests
func (h *PaymentProcessingHandler) processPaymentRequest(req *paymentprocessing.PaymentRequest, session *StreamingSession) error {
	switch request := req.Request.(type) {
	case *paymentprocessing.PaymentRequest_InitiatePayment:
		return h.handleInitiatePayment(request.InitiatePayment, session)
	case *paymentprocessing.PaymentRequest_UpdatePayment:
		return h.handleUpdatePayment(request.UpdatePayment, session)
	case *paymentprocessing.PaymentRequest_CancelPayment:
		return h.handleCancelPayment(request.CancelPayment, session)
	case *paymentprocessing.PaymentRequest_GetStatus:
		return h.handleGetStatus(request.GetStatus, session)
	default:
		return fmt.Errorf("unknown request type")
	}
}

// handleInitiatePayment processes payment initiation
func (h *PaymentProcessingHandler) handleInitiatePayment(req *paymentprocessing.InitiatePayment, session *StreamingSession) error {
	paymentID := uuid.New().String()

	// Send payment initiated response
	initiatedResponse := &paymentprocessing.PaymentResponse{
		Response: &paymentprocessing.PaymentResponse_PaymentInitiated{
			PaymentInitiated: &paymentprocessing.PaymentInitiated{
				PaymentId:     paymentID,
				SessionId:     session.ID,
				SelectedRail:  req.PreferredRail,
				EstimatedFee:  2.50, // Mock fee
				EstimatedTime: "2-3 business days",
				FxRate:        1.0,
				Message:       "Payment initiated successfully",
				InitiatedAt:   timestamppb.Now(),
			},
		},
	}

	// Send to session channel
	select {
	case session.EventChannel <- initiatedResponse:
	default:
		log.Printf("Session channel full, dropping initiated response")
	}

	// Simulate payment processing steps
	go h.simulatePaymentProcessing(paymentID, req, session)

	return nil
}

// handleUpdatePayment processes payment updates
func (h *PaymentProcessingHandler) handleUpdatePayment(req *paymentprocessing.UpdatePayment, session *StreamingSession) error {
	// Send status update
	statusResponse := &paymentprocessing.PaymentResponse{
		Response: &paymentprocessing.PaymentResponse_StatusUpdate{
			StatusUpdate: &paymentprocessing.PaymentStatusUpdate{
				PaymentId: req.PaymentId,
				Status:    req.NewStatus,
				Message:   req.Reason,
				Metadata:  req.Metadata,
				UpdatedAt: timestamppb.Now(),
			},
		},
	}

	select {
	case session.EventChannel <- statusResponse:
	default:
		log.Printf("Session channel full, dropping status update")
	}

	return nil
}

// handleCancelPayment processes payment cancellation
func (h *PaymentProcessingHandler) handleCancelPayment(req *paymentprocessing.CancelPayment, session *StreamingSession) error {
	// Send cancellation confirmation
	cancelResponse := &paymentprocessing.PaymentResponse{
		Response: &paymentprocessing.PaymentResponse_StatusUpdate{
			StatusUpdate: &paymentprocessing.PaymentStatusUpdate{
				PaymentId: req.PaymentId,
				Status:    paymentprocessing.PaymentStatus_PAYMENT_STATUS_CANCELLED,
				Message:   fmt.Sprintf("Payment cancelled: %s", req.Reason),
				UpdatedAt: timestamppb.Now(),
			},
		},
	}

	select {
	case session.EventChannel <- cancelResponse:
	default:
		log.Printf("Session channel full, dropping cancellation")
	}

	return nil
}

// handleGetStatus processes status inquiries
func (h *PaymentProcessingHandler) handleGetStatus(req *paymentprocessing.GetPaymentStatus, session *StreamingSession) error {
	// Send status response
	statusResponse := &paymentprocessing.PaymentResponse{
		Response: &paymentprocessing.PaymentResponse_StatusUpdate{
			StatusUpdate: &paymentprocessing.PaymentStatusUpdate{
				PaymentId: req.PaymentId,
				Status:    paymentprocessing.PaymentStatus_PAYMENT_STATUS_PROCESSING,
				Message:   "Payment status inquiry",
				UpdatedAt: timestamppb.Now(),
			},
		},
	}

	select {
	case session.EventChannel <- statusResponse:
	default:
		log.Printf("Session channel full, dropping status inquiry")
	}

	return nil
}

// simulatePaymentProcessing simulates the payment processing workflow
func (h *PaymentProcessingHandler) simulatePaymentProcessing(paymentID string, req *paymentprocessing.InitiatePayment, session *StreamingSession) {
	// Simulate processing steps
	steps := []struct {
		status  paymentprocessing.PaymentStatus
		message string
		delay   time.Duration
	}{
		{paymentprocessing.PaymentStatus_PAYMENT_STATUS_PROCESSING, "Payment validated", 1 * time.Second},
		{paymentprocessing.PaymentStatus_PAYMENT_STATUS_PROCESSING, "Funds reserved", 2 * time.Second},
		{paymentprocessing.PaymentStatus_PAYMENT_STATUS_PROCESSING, "Rail processing", 3 * time.Second},
		{paymentprocessing.PaymentStatus_PAYMENT_STATUS_COMPLETED, "Payment completed", 1 * time.Second},
	}

	for _, step := range steps {
		time.Sleep(step.delay)

		statusResponse := &paymentprocessing.PaymentResponse{
			Response: &paymentprocessing.PaymentResponse_StatusUpdate{
				StatusUpdate: &paymentprocessing.PaymentStatusUpdate{
					PaymentId: paymentID,
					Status:    step.status,
					Message:   step.message,
					UpdatedAt: timestamppb.Now(),
				},
			},
		}

		select {
		case session.EventChannel <- statusResponse:
		default:
			log.Printf("Session channel full, dropping status update")
		}
	}

	// Send completion response
	completionResponse := &paymentprocessing.PaymentResponse{
		Response: &paymentprocessing.PaymentResponse_PaymentCompleted{
			PaymentCompleted: &paymentprocessing.PaymentCompleted{
				PaymentId:          paymentID,
				FinalAmount:        req.Amount,
				FinalFee:           2.50,
				TransactionId:      uuid.New().String(),
				ConfirmationNumber: fmt.Sprintf("CONF-%s", paymentID[:8]),
				CompletedAt:        timestamppb.Now(),
				Message:            "Payment processed successfully",
			},
		},
	}

	select {
	case session.EventChannel <- completionResponse:
	default:
		log.Printf("Session channel full, dropping completion")
	}
}

// monitorTransactions monitors the database for new transactions and broadcasts them to active sessions
func (h *PaymentProcessingHandler) monitorTransactions() {
	ticker := time.NewTicker(5 * time.Second) // Check every 5 seconds
	defer ticker.Stop()

	var lastCheckTime time.Time

	for {
		select {
		case <-ticker.C:
			// Get recent transactions from the database
			var transactions []models.LedgerTransaction
			db := database.GetDB()
			if db == nil {
				continue
			}

			// Query for transactions created after the last check
			if err := db.Where("created_at > ?", lastCheckTime).Find(&transactions).Error; err != nil {
				log.Printf("Error querying transactions: %v", err)
				continue
			}

			// Update last check time
			lastCheckTime = time.Now()

			// Broadcast new transactions to all active sessions
			for _, transaction := range transactions {
				h.broadcastTransaction(transaction)
			}
		}
	}
}

// broadcastTransaction sends a transaction to all active streaming sessions
func (h *PaymentProcessingHandler) broadcastTransaction(transaction models.LedgerTransaction) {
	// Convert transaction to payment response
	paymentResponse := &paymentprocessing.PaymentResponse{
		Response: &paymentprocessing.PaymentResponse_StatusUpdate{
			StatusUpdate: &paymentprocessing.PaymentStatusUpdate{
				PaymentId: transaction.ID.String(),
				Status:    h.convertTransactionStatus(transaction.Status),
				Message:   fmt.Sprintf("Real transaction: %s - %s", transaction.Type, transaction.Description),
				Metadata: map[string]string{
					"transaction_type": string(transaction.Type),
					"amount":           fmt.Sprintf("%.2f", transaction.TotalAmount),
					"currency":         transaction.Currency,
					"reference":        transaction.Reference,
				},
				UpdatedAt: timestamppb.New(transaction.Timestamp),
			},
		},
	}

	// Send to all active sessions
	h.sessions.Range(func(key, value interface{}) bool {
		session := value.(*StreamingSession)
		session.mu.RLock()
		isActive := session.IsActive
		session.mu.RUnlock()

		if isActive {
			select {
			case session.EventChannel <- paymentResponse:
				// Successfully sent
			default:
				log.Printf("Session channel full, dropping transaction broadcast")
			}
		}
		return true
	})
}

// convertTransactionStatus converts ledger transaction status to payment status
func (h *PaymentProcessingHandler) convertTransactionStatus(status models.LedgerTransactionStatus) paymentprocessing.PaymentStatus {
	switch status {
	case models.LedgerTransactionStatusPending:
		return paymentprocessing.PaymentStatus_PAYMENT_STATUS_PROCESSING
	case models.LedgerTransactionStatusPosted:
		return paymentprocessing.PaymentStatus_PAYMENT_STATUS_COMPLETED
	case models.LedgerTransactionStatusCancelled:
		return paymentprocessing.PaymentStatus_PAYMENT_STATUS_CANCELLED
	case models.LedgerTransactionStatusReversed:
		return paymentprocessing.PaymentStatus_PAYMENT_STATUS_FAILED
	default:
		return paymentprocessing.PaymentStatus_PAYMENT_STATUS_UNSPECIFIED
	}
}
