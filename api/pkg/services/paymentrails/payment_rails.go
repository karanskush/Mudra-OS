package paymentrails

import "fmt"

// Payment struct for payment rail operations
// (You may extend this or map from your Transaction/Transfer models as needed)
type Payment struct {
	FromAccount string
	ToAccount   string
	Amount      float64
	Currency    string
	Reference   string
	Description string
	Country     string // For region-based rail selection
}

type PaymentRail interface {
	Name() string
	Transfer(payment Payment) error
}

// UPI (India)
type UPIRail struct{}

func (u *UPIRail) Name() string { return "UPI" }
func (u *UPIRail) Transfer(payment Payment) error {
	fmt.Printf("[UPI] Simulating UPI transfer: %+v\n", payment)
	return nil
}

// SEPA (Eurozone)
type SEPARail struct{}

func (s *SEPARail) Name() string { return "SEPA" }
func (s *SEPARail) Transfer(payment Payment) error {
	fmt.Printf("[SEPA] Simulating SEPA transfer: %+v\n", payment)
	return nil
}

// Crypto (Global)
type CryptoRail struct{}

func (c *CryptoRail) Name() string { return "CRYPTO" }
func (c *CryptoRail) Transfer(payment Payment) error {
	fmt.Printf("[CRYPTO] Simulating Crypto transfer: %+v\n", payment)
	return nil
}

// ACH (USA)
type ACHRail struct{}

func (a *ACHRail) Name() string { return "ACH" }
func (a *ACHRail) Transfer(payment Payment) error {
	fmt.Printf("[ACH] Simulating ACH transfer: %+v\n", payment)
	return nil
}

// SWIFT (International)
type SWIFTRail struct{}

func (s *SWIFTRail) Name() string { return "SWIFT" }
func (s *SWIFTRail) Transfer(payment Payment) error {
	fmt.Printf("[SWIFT] Simulating SWIFT transfer: %+v\n", payment)
	return nil
}

// PIX (Brazil)
type PIXRail struct{}

func (p *PIXRail) Name() string { return "PIX" }
func (p *PIXRail) Transfer(payment Payment) error {
	fmt.Printf("[PIX] Simulating PIX transfer: %+v\n", payment)
	return nil
}

// Faster Payments (UK)
type FasterPaymentsRail struct{}

func (f *FasterPaymentsRail) Name() string { return "FASTER_PAYMENTS" }
func (f *FasterPaymentsRail) Transfer(payment Payment) error {
	fmt.Printf("[FASTER_PAYMENTS] Simulating Faster Payments transfer: %+v\n", payment)
	return nil
}

// Interac (Canada)
type InteracRail struct{}

func (i *InteracRail) Name() string { return "INTERAC" }
func (i *InteracRail) Transfer(payment Payment) error {
	fmt.Printf("[INTERAC] Simulating Interac transfer: %+v\n", payment)
	return nil
}
