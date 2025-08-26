package routes

import (
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/app"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/handlers"
)

type Routes struct {
	app           *app.App
	healthHandler *handlers.HealthHandler
	userHandler   *handlers.UserHandler
	web3Handler   *handlers.Web3Handler
}

func NewRoutes(app *app.App, healthHandler *handlers.HealthHandler, userHandler *handlers.UserHandler, web3Handler *handlers.Web3Handler) *Routes {
	return &Routes{
		app:           app,
		healthHandler: healthHandler,
		userHandler:   userHandler,
		web3Handler:   web3Handler,
	}
}

func (r *Routes) Setup() {
	// 健康检查路由
	r.app.Get("/", r.healthHandler.HealthCheck)
	r.app.Get("/health", r.healthHandler.HealthCheck)
	r.app.Get("/ready", r.healthHandler.ReadyCheck)
	
	// API v1 路由组
	api := r.app.Group("/api/v1")
	api.Get("/status", r.healthHandler.HealthCheck)
	
	// 用户路由 - 保持与Node.js版本的API兼容性
	userGroup := api.Group("/user")
	
	// 基础用户CRUD
	// 只允许通过钱包登录注册
	// userGroup.Post("/", r.userHandler.CreateUser)           // POST /api/v1/user
	userGroup.Get("/", r.userHandler.GetUsers)              // GET /api/v1/user  
	userGroup.Get("/:id", r.userHandler.GetUserByID)        // GET /api/v1/user/:id
	userGroup.Put("/:id", r.userHandler.UpdateUser)         // PUT /api/v1/user/:id
	userGroup.Delete("/:id", r.userHandler.DeleteUser)      // DELETE /api/v1/user/:id
	
	// Web3认证路由 - 与Node.js版本完全一致的路径
	authGroup := userGroup.Group("/auth")
	web3Group := authGroup.Group("/web3")
	
	web3Group.Get("/challenge", r.web3Handler.GetWeb3Challenge)  // GET /api/v1/user/auth/web3/challenge
	web3Group.Post("/verify", r.web3Handler.VerifyWeb3Auth)      // POST /api/v1/user/auth/web3/verify
}