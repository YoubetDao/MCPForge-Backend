package handlers

import (
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/config"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/pkg/logger"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/pkg/utils"
)

type HealthHandler struct {
	config *config.Config
	logger *logger.Logger
}

func NewHealthHandler(cfg *config.Config, l *logger.Logger) *HealthHandler {
	return &HealthHandler{
		config: cfg,
		logger: l,
	}
}

func (h *HealthHandler) HealthCheck(c fiber.Ctx) error {
	h.logger.Info("Health check requested", "method", c.Method(), "path", c.Path())
	
	return utils.SuccessResponse(c, fiber.Map{
		"status": "healthy",
		"timestamp": time.Now().Unix(),
		"version": "1.0.0",
		"environment": h.config.Env,
		"uptime": time.Now().Format(time.RFC3339),
	})
}

func (h *HealthHandler) ReadyCheck(c fiber.Ctx) error {
	h.logger.Info("Ready check requested", "method", c.Method(), "path", c.Path())
	
	return utils.SuccessResponse(c, fiber.Map{
		"status": "ready",
		"timestamp": time.Now().Unix(),
		"database": "connected",
	})
}