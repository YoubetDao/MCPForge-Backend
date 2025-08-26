package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/config"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/models"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/services"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/pkg/logger"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/pkg/utils"
)

// UserHandler 用户处理器
type UserHandler struct {
	config      *config.Config
	logger      *logger.Logger
	userService *services.UserService
}

// NewUserHandler 创建用户处理器
func NewUserHandler(cfg *config.Config, l *logger.Logger, userService *services.UserService) *UserHandler {
	return &UserHandler{
		config:      cfg,
		logger:      l,
		userService: userService,
	}
}

// CreateUser 创建用户 POST /user
func (h *UserHandler) CreateUser(c fiber.Ctx) error {
	h.logger.Info("Create user requested", "method", c.Method(), "path", c.Path())

	var req models.CreateUserRequest
	if err := c.Bind().JSON(&req); err != nil {
		h.logger.Warn("Invalid request body", "error", err.Error())
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body")
	}

	// 基础验证
	if req.Username == "" || req.AuthType == "" || req.AuthIdentifier == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Username, auth_type, and auth_identifier are required")
	}

	user, err := h.userService.CreateUser(&req)
	if err != nil {
		h.logger.Error("Failed to create user", "error", err.Error(), "username", req.Username)
		return utils.ErrorResponse(c, fiber.StatusConflict, err.Error())
	}

	h.logger.Info("User created successfully", "user_id", user.UserID, "username", user.Username)
	return utils.SuccessResponse(c, user)
}

// GetUsers 获取所有用户 GET /user
func (h *UserHandler) GetUsers(c fiber.Ctx) error {
	h.logger.Info("Get all users requested", "method", c.Method(), "path", c.Path())

	users, err := h.userService.GetAllUsers()
	if err != nil {
		h.logger.Error("Failed to get users", "error", err.Error())
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get users")
	}

	h.logger.Info("Users retrieved successfully", "count", len(users))
	return utils.SuccessResponse(c, users)
}

// GetUserByID 根据ID获取用户 GET /user/:id
func (h *UserHandler) GetUserByID(c fiber.Ctx) error {
	h.logger.Info("Get user by ID requested", "method", c.Method(), "path", c.Path())

	idParam := c.Params("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid user ID")
	}

	user, err := h.userService.GetUserByID(uint(id))
	if err != nil {
		h.logger.Error("Failed to get user", "error", err.Error(), "user_id", id)
		return utils.ErrorResponse(c, fiber.StatusNotFound, err.Error())
	}

	h.logger.Info("User retrieved successfully", "user_id", user.UserID)
	return utils.SuccessResponse(c, user)
}

// UpdateUser 更新用户 PUT /user/:id
func (h *UserHandler) UpdateUser(c fiber.Ctx) error {
	h.logger.Info("Update user requested", "method", c.Method(), "path", c.Path())

	idParam := c.Params("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid user ID")
	}

	var req models.UpdateUserRequest
	if err := c.Bind().JSON(&req); err != nil {
		h.logger.Warn("Invalid request body", "error", err.Error())
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body")
	}

	user, err := h.userService.UpdateUser(uint(id), &req)
	if err != nil {
		h.logger.Error("Failed to update user", "error", err.Error(), "user_id", id)
		return utils.ErrorResponse(c, fiber.StatusNotFound, err.Error())
	}

	h.logger.Info("User updated successfully", "user_id", user.UserID)
	return utils.SuccessResponse(c, user)
}

// DeleteUser 删除用户 DELETE /user/:id
func (h *UserHandler) DeleteUser(c fiber.Ctx) error {
	h.logger.Info("Delete user requested", "method", c.Method(), "path", c.Path())

	idParam := c.Params("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid user ID")
	}

	err = h.userService.DeleteUser(uint(id))
	if err != nil {
		h.logger.Error("Failed to delete user", "error", err.Error(), "user_id", id)
		return utils.ErrorResponse(c, fiber.StatusNotFound, err.Error())
	}

	h.logger.Info("User deleted successfully", "user_id", id)
	return utils.SuccessResponse(c, fiber.Map{
		"message": "User deleted successfully",
	})
}