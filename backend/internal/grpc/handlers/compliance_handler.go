package handlers

import (
	"context"

	"fintech-backend/proto/gen/proto"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"
)

// ComplianceHandler implements the ComplianceServiceServer
type ComplianceHandler struct {
	proto.UnimplementedComplianceServiceServer
	db *gorm.DB
}

// NewComplianceHandler creates a new compliance handler
func NewComplianceHandler(db *gorm.DB) *ComplianceHandler {
	return &ComplianceHandler{
		db: db,
	}
}

// GenerateSAR generates Suspicious Activity Reports
func (h *ComplianceHandler) GenerateSAR(ctx context.Context, req *proto.GenerateSARRequest) (*proto.GenerateSARResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "GenerateSAR not yet implemented")
}

// GenerateGST generates GST reports for FX transactions
func (h *ComplianceHandler) GenerateGST(ctx context.Context, req *proto.GenerateGSTRequest) (*proto.GenerateGSTResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "GenerateGST not yet implemented")
}
