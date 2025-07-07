package paymentrails

import "fmt"

func ExampleUsage() {
	orchestrator := NewOrchestrator()

	payments := []Payment{
		{FromAccount: "A1", ToAccount: "A2", Amount: 1000, Currency: "INR", Country: "India", Reference: "UPI-001", Description: "UPI test"},
		{FromAccount: "A3", ToAccount: "A4", Amount: 500, Currency: "EUR", Country: "Eurozone", Reference: "SEPA-001", Description: "SEPA test"},
		{FromAccount: "A5", ToAccount: "A6", Amount: 200, Currency: "USD", Country: "USA", Reference: "ACH-001", Description: "ACH test"},
		{FromAccount: "A7", ToAccount: "A8", Amount: 300, Currency: "BRL", Country: "Brazil", Reference: "PIX-001", Description: "PIX test"},
		{FromAccount: "A9", ToAccount: "A10", Amount: 150, Currency: "GBP", Country: "UK", Reference: "FPS-001", Description: "Faster Payments test"},
		{FromAccount: "A11", ToAccount: "A12", Amount: 250, Currency: "CAD", Country: "Canada", Reference: "INTERAC-001", Description: "Interac test"},
		{FromAccount: "A13", ToAccount: "A14", Amount: 100, Currency: "USDT", Country: "Global", Reference: "CRYPTO-001", Description: "Crypto test"},
		{FromAccount: "A15", ToAccount: "A16", Amount: 1000, Currency: "JPY", Country: "Japan", Reference: "SWIFT-001", Description: "SWIFT test"},
	}

	for _, p := range payments {
		err := orchestrator.Transfer(p, nil)
		if err != nil {
			fmt.Printf("Transfer failed: %v\n", err)
		}
	}
}
