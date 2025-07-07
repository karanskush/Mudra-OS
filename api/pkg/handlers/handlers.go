package handlers

import (
	"api/pkg/response"
	"api/pkg/services"
	"encoding/json"
	"net/http"
	"time"
)

// Handler provides HTTP request handlers
type Handler struct {
	service *services.Service
}

// NewHandler creates a new handler instance
func NewHandler(service *services.Service) *Handler {
	return &Handler{service: service}
}

// RegisterRequest represents a registration request
type RegisterRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

// LoginRequest represents a login request
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// CreateAccountRequest represents an account creation request
type CreateAccountRequest struct {
	Type     string `json:"type"`
	Currency string `json:"currency"`
}

// CreateTransactionRequest represents a transaction creation request
type CreateTransactionRequest struct {
	AccountID uint    `json:"accountId"`
	Type      string  `json:"type"`
	Amount    float64 `json:"amount"`
	Currency  string  `json:"currency"`
}

// CreateKYCRequest represents a KYC record creation request
type CreateKYCRequest struct {
	DocumentType   string    `json:"documentType"`
	DocumentNumber string    `json:"documentNumber"`
	ExpiryDate     time.Time `json:"expiryDate"`
}

// Register handles user registration
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.ValidationError(w, "Invalid request body")
		return
	}

	user, err := h.service.RegisterUser(req.Email, req.Password, req.FirstName, req.LastName)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, "User registered successfully", user)
}

// Login handles user login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.ValidationError(w, "Invalid request body")
		return
	}

	user, err := h.service.AuthenticateUser(req.Email, req.Password)
	if err != nil {
		response.Unauthorized(w, "Invalid credentials")
		return
	}

	response.Success(w, "Login successful", user)
}

// CreateAccount handles account creation
func (h *Handler) CreateAccount(w http.ResponseWriter, r *http.Request) {
	var req CreateAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.ValidationError(w, "Invalid request body")
		return
	}

	// TODO: Get userID from authenticated context
	userID := uint(1)

	account, err := h.service.CreateAccount(userID, req.Type, req.Currency)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, "Account created successfully", account)
}

// GetAccounts handles retrieving user accounts
func (h *Handler) GetAccounts(w http.ResponseWriter, r *http.Request) {
	// TODO: Get userID from authenticated context
	userID := uint(1)

	accounts, err := h.service.GetUserAccounts(userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to retrieve accounts")
		return
	}

	response.Success(w, "Accounts retrieved successfully", accounts)
}

// CreateTransaction handles transaction creation
func (h *Handler) CreateTransaction(w http.ResponseWriter, r *http.Request) {
	var req CreateTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.ValidationError(w, "Invalid request body")
		return
	}

	transaction, err := h.service.CreateTransaction(req.AccountID, req.Type, req.Amount, req.Currency)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, "Transaction created successfully", transaction)
}

// CreateKYC handles KYC record creation
func (h *Handler) CreateKYC(w http.ResponseWriter, r *http.Request) {
	var req CreateKYCRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.ValidationError(w, "Invalid request body")
		return
	}

	// TODO: Get userID from authenticated context
	userID := uint(1)

	record, err := h.service.CreateKYCRecord(userID, req.DocumentType, req.DocumentNumber, req.ExpiryDate)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, "KYC record created successfully", record)
}
