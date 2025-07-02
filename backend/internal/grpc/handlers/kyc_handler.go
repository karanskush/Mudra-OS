package handlers

import (
	"context"

	"fintech-backend/internal/services"
	"fintech-backend/proto/gen/proto"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// KYCHandler implements the KYCServiceServer
type KYCHandler struct {
	proto.UnimplementedKYCServiceServer
	kycService *services.KYCService
}

// NewKYCHandler creates a new KYC handler
func NewKYCHandler(kycService *services.KYCService) *KYCHandler {
	return &KYCHandler{
		kycService: kycService,
	}
}

// CreateProfile creates a new KYC profile
func (h *KYCHandler) CreateProfile(ctx context.Context, req *proto.CreateProfileRequest) (*proto.CreateProfileResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "CreateProfile not yet implemented")
}

// GetProfile retrieves KYC profile data
func (h *KYCHandler) GetProfile(ctx context.Context, req *proto.GetProfileRequest) (*proto.GetProfileResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "GetProfile not yet implemented")
}
