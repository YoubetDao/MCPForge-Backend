package routes

import (
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/app"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/handlers"
)

type Routes struct {
	app          *app.App
	healthHandler *handlers.HealthHandler
}

func NewRoutes(app *app.App, healthHandler *handlers.HealthHandler) *Routes {
	return &Routes{
		app:          app,
		healthHandler: healthHandler,
	}
}

func (r *Routes) Setup() {
	r.app.Get("/", r.healthHandler.HealthCheck)
	r.app.Get("/health", r.healthHandler.HealthCheck)
	r.app.Get("/ready", r.healthHandler.ReadyCheck)
	
	api := r.app.Group("/api/v1")
	
	api.Get("/status", r.healthHandler.HealthCheck)
}