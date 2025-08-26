package main

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/app"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/config"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/handlers"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/models"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/repositories"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/routes"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/services"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/pkg/logger"
)

func main() {
	cfg := config.Load()
	appLogger := logger.New(cfg.LogLevel)

	appLogger.Info("Starting MCPForge Backend server", "environment", cfg.Env, "port", cfg.ServerPort)

	// 初始化数据库连接
	db, err := initDatabase(cfg, appLogger)
	if err != nil {
		appLogger.Error("Failed to initialize database", "error", err.Error())
		log.Fatal(err)
	}

	// 初始化依赖注入
	userRepo := repositories.NewUserRepository(db)
	nonceService := services.NewNonceService()
	web3Service := services.NewWeb3Service()
	userService := services.NewUserService(userRepo, nonceService, web3Service)

	// 初始化Fiber应用
	fiberApp := app.New(cfg, appLogger)
	fiberApp.SetupMiddleware()

	// 初始化处理器
	healthHandler := handlers.NewHealthHandler(cfg, appLogger)
	userHandler := handlers.NewUserHandler(cfg, appLogger, userService)
	web3Handler := handlers.NewWeb3Handler(cfg, appLogger, userService)

	// 设置路由
	router := routes.NewRoutes(fiberApp, healthHandler, userHandler, web3Handler)
	router.Setup()

	addr := ":" + cfg.ServerPort
	appLogger.Info("Server listening on", "address", addr)

	if err := fiberApp.Listen(addr); err != nil {
		appLogger.Error("Failed to start server", "error", err.Error())
		log.Fatal(err)
	}
}

// initDatabase 初始化数据库连接和迁移
func initDatabase(cfg *config.Config, logger *logger.Logger) (*gorm.DB, error) {
	// 构建数据库连接字符串（这里先用环境变量，后续可以从config中获取）
	dsn := "host=localhost user=postgres password=postgres dbname=mcpforge port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// 自动迁移数据库表
	err = db.AutoMigrate(&models.User{}, &models.AuthMethod{})
	if err != nil {
		logger.Error("Failed to migrate database", "error", err.Error())
		return nil, err
	}

	logger.Info("Database connected and migrated successfully")
	return db, nil
}