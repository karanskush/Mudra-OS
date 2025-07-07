package handlers

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	reconciliation "fintech-api/proto/gen/reconciliation"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
	"gorm.io/gorm"
)

// ReconciliationHandler implements the ReconciliationServiceServer
type ReconciliationHandler struct {
	reconciliation.UnimplementedReconciliationServiceServer
	db *gorm.DB
	// Reconciliation session management
	reconSessions sync.Map // sessionID -> *ReconciliationSession
}

// ReconciliationSession represents an active reconciliation session
type ReconciliationSession struct {
	ID           string
	ReportID     string
	UserID       string
	EventChannel chan *reconciliation.ReconResult
	StopChannel  chan bool
	IsActive     bool
	StartedAt    time.Time
	Progress     *ReconProgress
	mu           sync.RWMutex
}

// ReconProgress tracks reconciliation progress
type ReconProgress struct {
	TotalVariances       int32
	ProcessedVariances   int32
	PendingApproval      int32
	UnresolvedVariances  int32
	CompletionPercentage float64
}

// NewReconciliationHandler creates a new reconciliation handler
func NewReconciliationHandler(db *gorm.DB) *ReconciliationHandler {
	return &ReconciliationHandler{
		db: db,
	}
}

// GetStatus returns reconciliation status for dashboard
func (h *ReconciliationHandler) GetStatus(ctx context.Context, req *reconciliation.GetReconciliationStatusRequest) (*reconciliation.GetReconciliationStatusResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "GetStatus not yet implemented")
}

// RunNow triggers manual reconciliation run
// (No RunNow method in proto, so this can be removed or commented out)

// GenerateReconciliation generates a reconciliation report
func (h *ReconciliationHandler) GenerateReconciliation(ctx context.Context, req *reconciliation.GenerateReconciliationRequest) (*reconciliation.GenerateReconciliationResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "GenerateReconciliation not yet implemented")
}

// GetReconciliationStatus gets reconciliation status
func (h *ReconciliationHandler) GetReconciliationStatus(ctx context.Context, req *reconciliation.GetReconciliationStatusRequest) (*reconciliation.GetReconciliationStatusResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "GetReconciliationStatus not yet implemented")
}

// InteractiveReconciliation handles bidirectional streaming for interactive reconciliation
func (h *ReconciliationHandler) InteractiveReconciliation(stream grpc.BidiStreamingServer[reconciliation.ReconAction, reconciliation.ReconResult]) error {
	log.Printf("New InteractiveReconciliation session established")

	sessionID := fmt.Sprintf("recon-session-%d", time.Now().UnixNano())
	session := &ReconciliationSession{
		ID:           sessionID,
		EventChannel: make(chan *reconciliation.ReconResult, 100),
		StopChannel:  make(chan bool, 1),
		IsActive:     false,
		StartedAt:    time.Now(),
		Progress: &ReconProgress{
			TotalVariances:       0,
			ProcessedVariances:   0,
			PendingApproval:      0,
			UnresolvedVariances:  0,
			CompletionPercentage: 0.0,
		},
	}

	// Store session
	h.reconSessions.Store(sessionID, session)
	defer h.reconSessions.Delete(sessionID)
	defer close(session.EventChannel)
	defer close(session.StopChannel)

	// This is a template implementation - actual implementation would use proper gRPC stream
	log.Printf("Interactive reconciliation session %s started", sessionID)

	// Simulate reconciliation workflow
	go h.simulateReconciliationWorkflow(session)

	// Main event loop (would handle actual stream in real implementation)
	for {
		select {
		case <-session.StopChannel:
			log.Printf("Reconciliation session %s stopped", sessionID)
			return nil
		case event := <-session.EventChannel:
			log.Printf("Reconciliation event: %+v", event)
			// In real implementation, would send via stream.Send(event)
		case <-time.After(60 * time.Second):
			log.Printf("Reconciliation session %s timeout", sessionID)
			return nil
		}
	}
}

// simulateReconciliationWorkflow simulates an interactive reconciliation process
func (h *ReconciliationHandler) simulateReconciliationWorkflow(session *ReconciliationSession) {
	log.Printf("Starting reconciliation workflow for session %s", session.ID)

	// Step 1: Start reconciliation
	session.mu.Lock()
	session.IsActive = true
	session.ReportID = fmt.Sprintf("report_%s", session.ID[:8])
	session.mu.Unlock()

	// Simulate reconciliation started event
	startedEvent := &reconciliation.ReconResult{
		Result: &reconciliation.ReconResult_ReconciliationStarted{
			ReconciliationStarted: &reconciliation.ReconciliationStarted{
				SessionId: session.ID,
				Message:   "Reconciliation process initiated",
			},
		},
	}
	session.EventChannel <- startedEvent

	time.Sleep(2 * time.Second)

	// Step 2: Detect variances
	variances := []map[string]interface{}{
		{
			"varianceId":     "var_001",
			"type":           "MISSING_EXTERNAL",
			"description":    "Internal transaction missing external match",
			"internalTxId":   "tx_int_001",
			"internalAmount": 1500.00,
			"currency":       "USD",
			"severity":       "medium",
		},
		{
			"varianceId":     "var_002",
			"type":           "AMOUNT_MISMATCH",
			"description":    "Amount difference detected",
			"internalTxId":   "tx_int_002",
			"externalTxId":   "tx_ext_002",
			"internalAmount": 750.00,
			"externalAmount": 750.15,
			"varianceAmount": -0.15,
			"currency":       "USD",
			"severity":       "low",
		},
		{
			"varianceId":     "var_003",
			"type":           "DATE_MISMATCH",
			"description":    "Settlement date mismatch",
			"internalTxId":   "tx_int_003",
			"externalTxId":   "tx_ext_003",
			"internalAmount": 2000.00,
			"externalAmount": 2000.00,
			"currency":       "USD",
			"severity":       "high",
		},
	}

	session.mu.Lock()
	session.Progress.TotalVariances = int32(len(variances))
	session.mu.Unlock()

	for i, variance := range variances {
		// Convert map to proper Variance type
		varianceProto := &reconciliation.Variance{
			VarianceId:  variance["varianceId"].(string),
			Type:        reconciliation.VarianceType(reconciliation.VarianceType_value[variance["type"].(string)]),
			Description: variance["description"].(string),
			Currency:    variance["currency"].(string),
		}

		if internalTxId, ok := variance["internalTxId"].(string); ok {
			varianceProto.InternalTransactionId = internalTxId
		}
		if externalTxId, ok := variance["externalTxId"].(string); ok {
			varianceProto.ExternalTransactionId = externalTxId
		}
		if internalAmount, ok := variance["internalAmount"].(float64); ok {
			varianceProto.InternalAmount = internalAmount
		}
		if externalAmount, ok := variance["externalAmount"].(float64); ok {
			varianceProto.ExternalAmount = externalAmount
		}
		if varianceAmount, ok := variance["varianceAmount"].(float64); ok {
			varianceProto.VarianceAmount = varianceAmount
		}

		varianceEvent := &reconciliation.ReconResult{
			Result: &reconciliation.ReconResult_VarianceDetected{
				VarianceDetected: &reconciliation.VarianceDetected{
					Variance: varianceProto,
					Severity: variance["severity"].(string),
					SuggestedActions: []string{
						"ACCEPT", "ADJUST", "INVESTIGATE",
					},
				},
			},
		}
		session.EventChannel <- varianceEvent

		// Send progress update
		session.mu.Lock()
		session.Progress.CompletionPercentage = float64(i+1) / float64(len(variances)) * 30.0 // 30% for detection phase
		session.mu.Unlock()

		progressEvent := &reconciliation.ReconResult{
			Result: &reconciliation.ReconResult_ProgressUpdate{
				ProgressUpdate: &reconciliation.ProgressUpdate{
					SessionId:            session.ID,
					TotalVariances:       session.Progress.TotalVariances,
					ProcessedVariances:   session.Progress.ProcessedVariances,
					PendingApproval:      session.Progress.PendingApproval,
					UnresolvedVariances:  session.Progress.UnresolvedVariances,
					CompletionPercentage: session.Progress.CompletionPercentage,
					CurrentStatus:        "Detecting variances",
				},
			},
		}
		session.EventChannel <- progressEvent

		time.Sleep(3 * time.Second)
	}

	// Step 3: Simulate variance processing
	time.Sleep(2 * time.Second)

	for i, variance := range variances {
		// Simulate processing each variance
		var action string
		var success bool
		var message string

		switch variance["varianceId"] {
		case "var_001":
			action = "ESCALATE"
			success = false
			message = "Requires supervisor approval for missing external transaction"
		case "var_002":
			action = "ACCEPT"
			success = true
			message = "Minor amount difference accepted within tolerance"
		case "var_003":
			action = "ADJUST"
			success = true
			message = "Date mismatch resolved with adjustment entry"
		}

		// Convert action string to ActionType enum
		var actionType reconciliation.ActionType
		switch action {
		case "ACCEPT":
			actionType = reconciliation.ActionType_ACTION_TYPE_ACCEPT
		case "REJECT":
			actionType = reconciliation.ActionType_ACTION_TYPE_REJECT
		case "ADJUST":
			actionType = reconciliation.ActionType_ACTION_TYPE_ADJUST
		case "IGNORE":
			actionType = reconciliation.ActionType_ACTION_TYPE_IGNORE
		case "ESCALATE":
			actionType = reconciliation.ActionType_ACTION_TYPE_ESCALATE
		default:
			actionType = reconciliation.ActionType_ACTION_TYPE_UNSPECIFIED
		}

		processedEvent := &reconciliation.ReconResult{
			Result: &reconciliation.ReconResult_VarianceProcessed{
				VarianceProcessed: &reconciliation.VarianceProcessed{
					VarianceId:       variance["varianceId"].(string),
					ActionTaken:      actionType,
					Success:          success,
					Message:          message,
					RequiresApproval: action == "ESCALATE",
				},
			},
		}
		session.EventChannel <- processedEvent

		session.mu.Lock()
		if success {
			session.Progress.ProcessedVariances++
		} else {
			session.Progress.PendingApproval++
		}
		session.Progress.CompletionPercentage = 30.0 + (float64(i+1)/float64(len(variances)))*50.0 // 50% for processing
		session.mu.Unlock()

		progressEvent := &reconciliation.ReconResult{
			Result: &reconciliation.ReconResult_ProgressUpdate{
				ProgressUpdate: &reconciliation.ProgressUpdate{
					SessionId:            session.ID,
					TotalVariances:       session.Progress.TotalVariances,
					ProcessedVariances:   session.Progress.ProcessedVariances,
					PendingApproval:      session.Progress.PendingApproval,
					UnresolvedVariances:  session.Progress.UnresolvedVariances,
					CompletionPercentage: session.Progress.CompletionPercentage,
					CurrentStatus:        "Processing variances",
				},
			},
		}
		session.EventChannel <- progressEvent

		time.Sleep(2 * time.Second)
	}

	// Step 4: Simulate approval process
	time.Sleep(3 * time.Second)

	approvalEvent := &reconciliation.ReconResult{
		Result: &reconciliation.ReconResult_ApprovalResponse{
			ApprovalResponse: &reconciliation.ApprovalResponse{
				VarianceId: "var_001",
				Approved:   true,
				ApproverId: "supervisor_001",
				Message:    "Escalated variance approved by supervisor",
			},
		},
	}
	session.EventChannel <- approvalEvent

	session.mu.Lock()
	session.Progress.PendingApproval--
	session.Progress.ProcessedVariances++
	session.Progress.CompletionPercentage = 90.0
	session.mu.Unlock()

	// Step 5: Complete reconciliation
	time.Sleep(2 * time.Second)

	session.mu.Lock()
	session.Progress.CompletionPercentage = 100.0
	session.IsActive = false
	session.mu.Unlock()

	completedEvent := &reconciliation.ReconResult{
		Result: &reconciliation.ReconResult_ReconciliationCompleted{
			ReconciliationCompleted: &reconciliation.ReconciliationCompleted{
				SessionId:         session.ID,
				CompletionMessage: "Reconciliation completed successfully",
				CompletedAt:       timestamppb.Now(),
			},
		},
	}
	session.EventChannel <- completedEvent

	log.Printf("Reconciliation workflow completed for session %s", session.ID)

	// Close session after completion
	time.Sleep(1 * time.Second)
	session.StopChannel <- true
}

// handleReconCommand processes incoming reconciliation commands (template for actual implementation)
func (h *ReconciliationHandler) handleReconCommand(session *ReconciliationSession, cmd interface{}) error {
	// This would handle actual reconciliation.ReconAction commands
	log.Printf("Handling reconciliation command for session %s", session.ID)
	return nil
}

// generateProgressUpdate creates a progress update event
func (h *ReconciliationHandler) generateProgressUpdate(session *ReconciliationSession) interface{} {
	session.mu.RLock()
	defer session.mu.RUnlock()

	return map[string]interface{}{
		"type":      "progress_update",
		"sessionId": session.ID,
		"progress": map[string]interface{}{
			"totalVariances":       session.Progress.TotalVariances,
			"processedVariances":   session.Progress.ProcessedVariances,
			"pendingApproval":      session.Progress.PendingApproval,
			"unresolvedVariances":  session.Progress.UnresolvedVariances,
			"completionPercentage": session.Progress.CompletionPercentage,
		},
		"timestamp": time.Now(),
	}
}

// GetActiveReconciliationSessions returns count of active sessions
func (h *ReconciliationHandler) GetActiveReconciliationSessions() int {
	count := 0
	h.reconSessions.Range(func(key, value interface{}) bool {
		if session, ok := value.(*ReconciliationSession); ok && session.IsActive {
			count++
		}
		return true
	})
	return count
}

// GetReconciliationSessionStats returns session statistics
func (h *ReconciliationHandler) GetReconciliationSessionStats() map[string]interface{} {
	totalSessions := 0
	activeSessions := 0
	completedSessions := 0

	h.reconSessions.Range(func(key, value interface{}) bool {
		totalSessions++
		if session, ok := value.(*ReconciliationSession); ok {
			if session.IsActive {
				activeSessions++
			} else {
				completedSessions++
			}
		}
		return true
	})

	return map[string]interface{}{
		"totalSessions":     totalSessions,
		"activeSessions":    activeSessions,
		"completedSessions": completedSessions,
		"timestamp":         time.Now(),
	}
}
