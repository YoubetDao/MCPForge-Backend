package models

import (
	"time"
)

// Web3ChallengeRequest 挑战请求DTO
type Web3ChallengeRequest struct {
	Address string `json:"address" binding:"required" validate:"required"`
}

// Web3ChallengeResponse 挑战响应DTO
type Web3ChallengeResponse struct {
	Nonce     string `json:"nonce"`
	ExpiresAt string `json:"expires_at"`
}

// Web3AuthRequest 认证请求DTO
type Web3AuthRequest struct {
	Address       string    `json:"address" binding:"required" validate:"required"`
	Signature     string    `json:"signature" binding:"required" validate:"required"`
	Nonce         string    `json:"nonce" binding:"required" validate:"required"`
	Username      *string   `json:"username,omitempty"`
	Email         *string   `json:"email,omitempty"`
	Role          *UserRole `json:"role,omitempty"`
	RewardAddress *string   `json:"reward_address,omitempty"`
}

// Web3AuthResponse 认证响应DTO
type Web3AuthResponse struct {
	Success bool   `json:"success"`
	Action  string `json:"action"` // "login" or "register"
	User    User   `json:"user"`
	Message string `json:"message"`
}

// NonceStore nonce存储结构
type NonceStore struct {
	Nonce   string    `json:"nonce"`
	Expires time.Time `json:"expires"`
}

// CreateUserRequest 创建用户请求DTO
type CreateUserRequest struct {
	Username       string    `json:"username" binding:"required" validate:"required"`
	Email          *string   `json:"email,omitempty"`
	Role           *UserRole `json:"role,omitempty"`
	RewardAddress  *string   `json:"reward_address,omitempty"`
	AuthType       AuthType  `json:"auth_type" binding:"required" validate:"required"`
	AuthIdentifier string    `json:"auth_identifier" binding:"required" validate:"required"`
}

// UpdateUserRequest 更新用户请求DTO
type UpdateUserRequest struct {
	Username      *string   `json:"username,omitempty"`
	Email         *string   `json:"email,omitempty"`
	Role          *UserRole `json:"role,omitempty"`
	RewardAddress *string   `json:"reward_address,omitempty"`
}