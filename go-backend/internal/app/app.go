package app

import (
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/config"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/pkg/logger"
)

type App struct {
	*fiber.App
	config *config.Config
	logger *logger.Logger
}

func New(cfg *config.Config, l *logger.Logger) *App {
	app := fiber.New(fiber.Config{
		AppName:      "MCPForge Backend",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
		ErrorHandler: defaultErrorHandler,
	})

	return &App{
		App:    app,
		config: cfg,
		logger: l,
	}
}

func (a *App) SetupMiddleware() {
	a.Use(recover.New())
	a.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Content-Type", "Authorization"},
		MaxAge:       86400,
	}))
	a.Use(a.logger.Middleware())
}

func defaultErrorHandler(c fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"message": message,
		"timestamp": time.Now().Unix(),
	})
}