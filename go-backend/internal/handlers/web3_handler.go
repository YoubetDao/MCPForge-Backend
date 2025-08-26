package handlers

import (
	"time"
	
	"github.com/gofiber/fiber/v3"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/config"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/models"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/services"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/pkg/logger"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/pkg/utils"
)

// Web3Handler Web3认证处理器
type Web3Handler struct {
	config      *config.Config
	logger      *logger.Logger
	userService *services.UserService
}

// NewWeb3Handler 创建Web3处理器
func NewWeb3Handler(cfg *config.Config, l *logger.Logger, userService *services.UserService) *Web3Handler {
	return &Web3Handler{
		config:      cfg,
		logger:      l,
		userService: userService,
	}
}

// GetWeb3Challenge 获取Web3挑战 GET /user/auth/web3/challenge
func (h *Web3Handler) GetWeb3Challenge(c fiber.Ctx) error {
	h.logger.Info("Web3 challenge requested", "method", c.Method(), "path", c.Path())

	// 获取地址参数
	address := c.Query("address")
	if address == "" {
		h.logger.Warn("Missing address parameter")
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Address parameter is required")
	}

	// 创建请求结构
	req := &models.Web3ChallengeRequest{
		Address: address,
	}

	// 生成挑战
	response, err := h.userService.GenerateWeb3Challenge(req.Address)
	if err != nil {
		h.logger.Error("Failed to generate Web3 challenge", "error", err.Error(), "address", address)
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to generate Web3 challenge")
	}

	h.logger.Info("Web3 challenge generated successfully", "address", address)
	return utils.SuccessResponse(c, response)
}

// VerifyWeb3Auth 验证Web3认证 POST /user/auth/web3/verify
func (h *Web3Handler) VerifyWeb3Auth(c fiber.Ctx) error {
	h.logger.Info("Web3 auth verification requested", "method", c.Method(), "path", c.Path())

	// 解析请求体
	var req models.Web3AuthRequest
	if err := c.Bind().JSON(&req); err != nil {
		h.logger.Warn("Invalid request body", "error", err.Error())
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body")
	}

	// 基础验证
	if req.Address == "" || req.Signature == "" || req.Nonce == "" {
		h.logger.Warn("Missing required fields", "address", req.Address != "", "signature", req.Signature != "", "nonce", req.Nonce != "")
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Address, signature, and nonce are required")
	}

	// 验证Web3认证
	response, err := h.userService.VerifyWeb3Auth(&req)
	if err != nil {
		h.logger.Error("Web3 auth verification failed", "error", err.Error(), "address", req.Address)
		return utils.ErrorResponse(c, fiber.StatusUnauthorized, err.Error())
	}

	// 生成JWT令牌
	jwtUtil := utils.NewJWTUtil(h.config)
	token, err := jwtUtil.GenerateToken(response.User.UserID, response.User.Username, string(response.User.Role))
	if err != nil {
		h.logger.Error("Failed to generate JWT token", "error", err.Error(), "user_id", response.User.UserID)
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to generate authentication token")
	}

	// 设置HttpOnly cookie
	c.Cookie(&fiber.Cookie{
		Name:     "auth_token",
		Value:    token,
		Expires:  time.Now().Add(time.Duration(h.config.JWTExpiresIn) * time.Hour),
		HTTPOnly: true,
		Secure:   h.config.Env == "production",
		SameSite: "lax",
		Path:     "/",
	})

	h.logger.Info("Web3 auth verification successful", 
		"address", req.Address, 
		"action", response.Action, 
		"user_id", response.User.UserID)

	return utils.SuccessResponse(c, response)
}