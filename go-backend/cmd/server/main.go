package main

import (
	"log"

	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/app"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/config"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/handlers"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/routes"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/pkg/logger"
)

func main() {
	cfg := config.Load()
	appLogger := logger.New(cfg.LogLevel)

	appLogger.Info("Starting MCPForge Backend server", "environment", cfg.Env, "port", cfg.ServerPort)

	fiberApp := app.New(cfg, appLogger)
	fiberApp.SetupMiddleware()

	healthHandler := handlers.NewHealthHandler(cfg, appLogger)
	router := routes.NewRoutes(fiberApp, healthHandler)
	router.Setup()

	addr := ":" + cfg.ServerPort
	appLogger.Info("Server listening on", "address", addr)

	if err := fiberApp.Listen(addr); err != nil {
		appLogger.Error("Failed to start server", "error", err.Error())
		log.Fatal(err)
	}
}