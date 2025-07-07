package paymentrails

import (
	"errors"
	"fmt"
	"strings"
)

type RailType string

const (
	RailUPI            RailType = "UPI"
	RailSEPA           RailType = "SEPA"
	RailCrypto         RailType = "CRYPTO"
	RailACH            RailType = "ACH"
	RailSWIFT          RailType = "SWIFT"
	RailPIX            RailType = "PIX"
	RailFasterPayments RailType = "FASTER_PAYMENTS"
	RailInterac        RailType = "INTERAC"
)

type Orchestrator struct {
	rails map[RailType]PaymentRail
}

func NewOrchestrator() *Orchestrator {
	return &Orchestrator{
		rails: map[RailType]PaymentRail{
			RailUPI:            &UPIRail{},
			RailSEPA:           &SEPARail{},
			RailCrypto:         &CryptoRail{},
			RailACH:            &ACHRail{},
			RailSWIFT:          &SWIFTRail{},
			RailPIX:            &PIXRail{},
			RailFasterPayments: &FasterPaymentsRail{},
			RailInterac:        &InteracRail{},
		},
	}
}

// SelectRail chooses a payment rail based on payment details
func (o *Orchestrator) SelectRail(payment Payment) (RailType, error) {
	switch {
	case payment.Currency == "INR" && strings.EqualFold(payment.Country, "India"):
		return RailUPI, nil
	case payment.Currency == "EUR" && strings.EqualFold(payment.Country, "Eurozone"):
		return RailSEPA, nil
	case payment.Currency == "USD" && strings.EqualFold(payment.Country, "USA"):
		return RailACH, nil
	case payment.Currency == "BRL" && strings.EqualFold(payment.Country, "Brazil"):
		return RailPIX, nil
	case payment.Currency == "GBP" && strings.EqualFold(payment.Country, "UK"):
		return RailFasterPayments, nil
	case payment.Currency == "CAD" && strings.EqualFold(payment.Country, "Canada"):
		return RailInterac, nil
	case payment.Currency == "USDT" || payment.Currency == "USDC":
		return RailCrypto, nil
	default:
		// Fallback to SWIFT for international
		return RailSWIFT, nil
	}
}

// Transfer executes a payment using the selected or overridden rail
func (o *Orchestrator) Transfer(payment Payment, railOverride *RailType) error {
	var railType RailType
	var err error
	if railOverride != nil {
		railType = *railOverride
	} else {
		railType, err = o.SelectRail(payment)
		if err != nil {
			return err
		}
	}
	rail, ok := o.rails[railType]
	if !ok {
		return errors.New("unsupported payment rail: " + string(railType))
	}
	fmt.Printf("Using rail: %s\n", rail.Name())
	return rail.Transfer(payment)
}
