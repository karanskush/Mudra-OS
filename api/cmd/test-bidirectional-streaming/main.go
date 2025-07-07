package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	paymentpb "fintech-api/proto/gen/payment"
	reconciliationpb "fintech-api/proto/gen/reconciliation"
	webhookpb "fintech-api/proto/gen/webhook"
)

const (
	serverAddr = "localhost:50051"
)

func main() {
	fmt.Println("🚀 gRPC Bidirectional Streaming Test Client")
	fmt.Println("==========================================")
	fmt.Println()

	// Connect to gRPC server
	conn, err := grpc.Dial(serverAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	// Initialize clients
	paymentClient := paymentpb.NewPaymentServiceClient(conn)
	reconciliationClient := reconciliationpb.NewReconciliationServiceClient(conn)
	webhookClient := webhookpb.NewWebhookServiceClient(conn)

	// Show menu
	for {
		fmt.Println("\n📋 Available Tests:")
		fmt.Println("1. Payment Transaction Monitor (Bidirectional)")
		fmt.Println("2. Interactive Reconciliation (Bidirectional)")
		fmt.Println("3. Webhook Debugger (Bidirectional)")
		fmt.Println("4. Run All Tests Sequentially")
		fmt.Println("5. Exit")
		fmt.Print("\nSelect test (1-5): ")

		reader := bufio.NewReader(os.Stdin)
		choice, _ := reader.ReadString('\n')
		choice = strings.TrimSpace(choice)

		switch choice {
		case "1":
			testPaymentTransactionMonitor(paymentClient)
		case "2":
			testInteractiveReconciliation(reconciliationClient)
		case "3":
			testWebhookDebugger(webhookClient)
		case "4":
			runAllTests(paymentClient, reconciliationClient, webhookClient)
		case "5":
			fmt.Println("👋 Goodbye!")
			return
		default:
			fmt.Println("❌ Invalid choice. Please select 1-5.")
		}
	}
}

func testPaymentTransactionMonitor(client paymentpb.PaymentServiceClient) {
	fmt.Println("\n💳 Testing Payment Transaction Monitor")
	fmt.Println("=====================================")

	// Start bidirectional stream
	stream, err := client.TransactionMonitor(context.Background())
	if err != nil {
		log.Printf("❌ Failed to start TransactionMonitor: %v", err)
		return
	}
	defer stream.CloseSend()

	// Start monitoring goroutine
	go func() {
		for {
			event, err := stream.Recv()
			if err == io.EOF {
				fmt.Println("📡 Stream ended by server")
				return
			}
			if err != nil {
				log.Printf("❌ Error receiving event: %v", err)
				return
			}

			// Handle different event types
			switch e := event.Event.(type) {
			case *paymentpb.TransactionEvent_PaymentUpdate:
				payment := e.PaymentUpdate.Payment
				fmt.Printf("💰 Payment Update: ID=%s, Status=%s, Amount=%.2f %s\n",
					payment.PaymentId, payment.Status, payment.Amount, payment.Currency)
			case *paymentpb.TransactionEvent_Stats:
				stats := e.Stats
				fmt.Printf("📊 Stats: Total=%d, Volume=%.2f, Success Rate=%.1f%%\n",
					stats.TotalTransactions, stats.TotalVolume, stats.SuccessRate*100)
			case *paymentpb.TransactionEvent_Alert:
				alert := e.Alert
				fmt.Printf("🚨 Alert: %s - %s (Severity: %s)\n",
					alert.AlertType, alert.Description, alert.Severity)
			case *paymentpb.TransactionEvent_Status:
				status := e.Status
				fmt.Printf("📡 Status: Active=%v, Connections=%d, Filter=%s\n",
					status.IsActive, status.ConnectionsCount, status.CurrentFilter)
			}
		}
	}()

	// Send commands
	commands := []*paymentpb.MonitorCommand{
		// Start monitoring
		{
			Command: &paymentpb.MonitorCommand_StartMonitoring{
				StartMonitoring: &paymentpb.StartMonitoring{
					UserId: "user_123",
					StatusFilter: []paymentpb.PaymentStatus{
						paymentpb.PaymentStatus_PAYMENT_STATUS_PROCESSING,
						paymentpb.PaymentStatus_PAYMENT_STATUS_COMPLETED,
					},
					MinAmount:      100.0,
					CurrencyFilter: []string{"USD", "EUR"},
				},
			},
		},
		// Get stats after 2 seconds
		{
			Command: &paymentpb.MonitorCommand_GetStats{
				GetStats: &paymentpb.GetStats{
					IncludeSummary:       true,
					IncludeRailBreakdown: true,
				},
			},
		},
		// Update filter after 4 seconds
		{
			Command: &paymentpb.MonitorCommand_UpdateFilter{
				UpdateFilter: &paymentpb.UpdateFilter{
					NewFilter: &paymentpb.StartMonitoring{
						UserId:    "user_123",
						MinAmount: 500.0, // Only high-value transactions
					},
				},
			},
		},
		// Stop monitoring after 6 seconds
		{
			Command: &paymentpb.MonitorCommand_StopMonitoring{
				StopMonitoring: &paymentpb.StopMonitoring{
					Reason: "Test completed",
				},
			},
		},
	}

	for i, cmd := range commands {
		time.Sleep(time.Duration(i*2) * time.Second)
		fmt.Printf("📤 Sending command %d: %T\n", i+1, cmd.Command)
		if err := stream.Send(cmd); err != nil {
			log.Printf("❌ Failed to send command: %v", err)
			return
		}
	}

	// Wait for final events
	time.Sleep(3 * time.Second)
	fmt.Println("✅ Payment Transaction Monitor test completed")
}

func testInteractiveReconciliation(client reconciliationpb.ReconciliationServiceClient) {
	fmt.Println("\n🔄 Testing Interactive Reconciliation")
	fmt.Println("====================================")

	// Start bidirectional stream
	stream, err := client.InteractiveReconciliation(context.Background())
	if err != nil {
		log.Printf("❌ Failed to start InteractiveReconciliation: %v", err)
		return
	}
	defer stream.CloseSend()

	// Start receiving results
	go func() {
		for {
			result, err := stream.Recv()
			if err == io.EOF {
				fmt.Println("📡 Reconciliation stream ended by server")
				return
			}
			if err != nil {
				log.Printf("❌ Error receiving result: %v", err)
				return
			}

			// Handle different result types
			switch r := result.Result.(type) {
			case *reconciliationpb.ReconResult_ReconciliationStarted:
				started := r.ReconciliationStarted
				fmt.Printf("🚀 Reconciliation Started: Session=%s, Message=%s\n",
					started.SessionId, started.Message)
			case *reconciliationpb.ReconResult_VarianceDetected:
				variance := r.VarianceDetected
				fmt.Printf("⚠️  Variance Detected: ID=%s, Type=%s, Severity=%s\n",
					variance.Variance.VarianceId, variance.Variance.Type, variance.Severity)
				fmt.Printf("   Description: %s\n", variance.Variance.Description)
				fmt.Printf("   Suggested Actions: %v\n", variance.SuggestedActions)
			case *reconciliationpb.ReconResult_VarianceProcessed:
				processed := r.VarianceProcessed
				fmt.Printf("✅ Variance Processed: ID=%s, Action=%s, Success=%v\n",
					processed.VarianceId, processed.ActionTaken, processed.Success)
				fmt.Printf("   Message: %s\n", processed.Message)
			case *reconciliationpb.ReconResult_ApprovalResponse:
				approval := r.ApprovalResponse
				fmt.Printf("👤 Approval Response: ID=%s, Approved=%v, Approver=%s\n",
					approval.VarianceId, approval.Approved, approval.ApproverId)
				fmt.Printf("   Message: %s\n", approval.Message)
			case *reconciliationpb.ReconResult_ProgressUpdate:
				progress := r.ProgressUpdate
				fmt.Printf("📈 Progress: %d/%d variances processed (%.1f%% complete)\n",
					progress.ProcessedVariances, progress.TotalVariances, progress.CompletionPercentage)
				fmt.Printf("   Status: %s, Pending Approval: %d\n",
					progress.CurrentStatus, progress.PendingApproval)
			case *reconciliationpb.ReconResult_ReconciliationCompleted:
				completed := r.ReconciliationCompleted
				fmt.Printf("🎉 Reconciliation Completed: Session=%s\n",
					completed.SessionId)
				fmt.Printf("   Message: %s\n", completed.CompletionMessage)
			case *reconciliationpb.ReconResult_ReconError:
				reconError := r.ReconError
				fmt.Printf("❌ Reconciliation Error: %s - %s\n",
					reconError.ErrorCode, reconError.ErrorMessage)
			}
		}
	}()

	// Send reconciliation actions
	actions := []*reconciliationpb.ReconAction{
		// Start reconciliation
		{
			Action: &reconciliationpb.ReconAction_StartReconciliation{
				StartReconciliation: &reconciliationpb.StartReconciliation{
					DateRangeStart:   "2024-01-01",
					DateRangeEnd:     "2024-01-31",
					AutoMatchEnabled: true,
					ToleranceAmount:  0.01, // $0.01 tolerance
				},
			},
		},
		// Process variance after 3 seconds
		{
			Action: &reconciliationpb.ReconAction_ProcessVariance{
				ProcessVariance: &reconciliationpb.ProcessVariance{
					VarianceId:       "var_001",
					Action:           reconciliationpb.ActionType_ACTION_TYPE_ADJUST,
					Notes:            "Timing difference - valid transaction",
					AdjustmentAmount: 50.00,
					AdjustmentReason: "Late settlement",
				},
			},
		},
		// Get progress after 6 seconds
		{
			Action: &reconciliationpb.ReconAction_GetProgress{
				GetProgress: &reconciliationpb.GetProgress{
					IncludeDetails: true,
				},
			},
		},
		// Complete reconciliation after 9 seconds
		{
			Action: &reconciliationpb.ReconAction_CompleteReconciliation{
				CompleteReconciliation: &reconciliationpb.CompleteReconciliation{
					FinalNotes:    "Test reconciliation completed successfully",
					ForceComplete: false,
				},
			},
		},
	}

	for i, action := range actions {
		time.Sleep(time.Duration(i*3) * time.Second)
		fmt.Printf("📤 Sending action %d: %T\n", i+1, action.Action)
		if err := stream.Send(action); err != nil {
			log.Printf("❌ Failed to send action: %v", err)
			return
		}
	}

	// Wait for final results
	time.Sleep(5 * time.Second)
	fmt.Println("✅ Interactive Reconciliation test completed")
}

func testWebhookDebugger(client webhookpb.WebhookServiceClient) {
	fmt.Println("\n🔗 Testing Webhook Debugger")
	fmt.Println("==========================")

	// Start bidirectional stream
	stream, err := client.WebhookDebugger(context.Background())
	if err != nil {
		log.Printf("❌ Failed to start WebhookDebugger: %v", err)
		return
	}
	defer stream.CloseSend()

	// Start receiving debug responses
	go func() {
		for {
			response, err := stream.Recv()
			if err == io.EOF {
				fmt.Println("📡 Webhook debug stream ended by server")
				return
			}
			if err != nil {
				log.Printf("❌ Error receiving response: %v", err)
				return
			}

			// Handle different response types
			switch r := response.Response.(type) {
			case *webhookpb.WebhookDebugResponse_DeliveryAttempt:
				attempt := r.DeliveryAttempt
				status := "✅ Success"
				if !attempt.Successful {
					status = "❌ Failed"
				}
				fmt.Printf("%s Delivery: ID=%s, Status=%d, Time=%.2fms\n",
					status, attempt.DeliveryId, attempt.ResponseStatus, attempt.ResponseTimeMs)
				if attempt.ErrorMessage != "" {
					fmt.Printf("   Error: %s\n", attempt.ErrorMessage)
				}
			case *webhookpb.WebhookDebugResponse_DebugStats:
				stats := r.DebugStats
				fmt.Printf("📊 Debug Stats: Total=%d, Success=%d, Failed=%d, Avg Time=%.2fms\n",
					stats.TotalAttempts, stats.SuccessfulAttempts, stats.FailedAttempts, stats.AvgResponseTimeMs)
			case *webhookpb.WebhookDebugResponse_DebugLog:
				log := r.DebugLog
				fmt.Printf("📝 Debug Log: %s - %s\n", log.Timestamp, log.Message)
			case *webhookpb.WebhookDebugResponse_DebugStatus:
				status := r.DebugStatus
				fmt.Printf("📡 Debug Status: Webhook=%s, Debugging=%v, Connections=%d\n",
					status.WebhookId, status.IsDebugging, status.ActiveConnections)
			}
		}
	}()

	// Send debug commands
	commands := []*webhookpb.WebhookDebugCommand{
		// Start debugging
		{
			Command: &webhookpb.WebhookDebugCommand_StartDebugging{
				StartDebugging: &webhookpb.StartDebugging{
					WebhookId:            "webhook_123",
					CaptureRequests:      true,
					CaptureResponses:     true,
					EnableVerboseLogging: true,
				},
			},
		},
		// Test endpoint after 2 seconds
		{
			Command: &webhookpb.WebhookDebugCommand_TestEndpoint{
				TestEndpoint: &webhookpb.TestEndpoint{
					Url:           "https://httpbin.org/post",
					EventType:     webhookpb.WebhookEventType_WEBHOOK_EVENT_TYPE_PAYMENT_COMPLETED,
					CustomPayload: `{"test": true, "payment_id": "pay_test_123"}`,
					CustomHeaders: map[string]string{
						"Authorization": "Bearer test_token",
						"Content-Type":  "application/json",
					},
					TimeoutSeconds: 30,
				},
			},
		},
		// Update config after 4 seconds
		{
			Command: &webhookpb.WebhookDebugCommand_UpdateConfig{
				UpdateConfig: &webhookpb.UpdateConfig{
					WebhookId: "webhook_123",
					NewUrl:    "https://api.example.com/webhook/v2",
					NewHeaders: map[string]string{
						"X-Custom-Header": "updated_value",
					},
					NewTimeout: 45,
				},
			},
		},
		// Stop debugging after 6 seconds
		{
			Command: &webhookpb.WebhookDebugCommand_StopDebugging{
				StopDebugging: &webhookpb.StopDebugging{
					Reason: "Test completed",
				},
			},
		},
	}

	for i, cmd := range commands {
		time.Sleep(time.Duration(i*2) * time.Second)
		fmt.Printf("📤 Sending command %d: %T\n", i+1, cmd.Command)
		if err := stream.Send(cmd); err != nil {
			log.Printf("❌ Failed to send command: %v", err)
			return
		}
	}

	// Wait for final responses
	time.Sleep(3 * time.Second)
	fmt.Println("✅ Webhook Debugger test completed")
}

func runAllTests(paymentClient paymentpb.PaymentServiceClient,
	reconciliationClient reconciliationpb.ReconciliationServiceClient,
	webhookClient webhookpb.WebhookServiceClient) {

	fmt.Println("\n🚀 Running All Bidirectional Streaming Tests")
	fmt.Println("===========================================")

	// Test 1: Payment Transaction Monitor
	fmt.Println("\n1️⃣ Testing Payment Transaction Monitor...")
	testPaymentTransactionMonitor(paymentClient)
	time.Sleep(2 * time.Second)

	// Test 2: Interactive Reconciliation
	fmt.Println("\n2️⃣ Testing Interactive Reconciliation...")
	testInteractiveReconciliation(reconciliationClient)
	time.Sleep(2 * time.Second)

	// Test 3: Webhook Debugger
	fmt.Println("\n3️⃣ Testing Webhook Debugger...")
	testWebhookDebugger(webhookClient)

	fmt.Println("\n🎉 All bidirectional streaming tests completed successfully!")
}
