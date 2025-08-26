package middleware

import (
	"strings"

	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/config"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/pkg/utils"
	"github.com/gofiber/fiber/v3"
)

type AuthContextKey string

const UserIDKey AuthContextKey = "user_id"
const UserRoleKey AuthContextKey = "role"
const UsernameKey AuthContextKey = "username"

func AuthMiddleware(cfg *config.Config) fiber.Handler {
	jwtUtil := utils.NewJWTUtil(cfg)
	
	return func(c fiber.Ctx) error {
		// if path is get nonce or verify, then skip
		if strings.Contains(c.Path(), "/auth/web3") {
			return c.Next()
		}
		// 从cookie中获取token
		token := c.Cookies("auth_token")
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Authentication required",
			})
		}

		// 验证token
		claims, err := jwtUtil.VerifyToken(token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Invalid or expired token",
			})
		}

		// 将用户信息存储到context中
		c.Locals(string(UserIDKey), claims.UserID)
		c.Locals(string(UserRoleKey), claims.Role)
		c.Locals(string(UsernameKey), claims.Username)

		return c.Next()
	}
}

func GetUserID(c fiber.Ctx) (uint, bool) {
	userID, ok := c.Locals(string(UserIDKey)).(uint)
	return userID, ok
}

func GetUserRole(c fiber.Ctx) (string, bool) {
	role, ok := c.Locals(string(UserRoleKey)).(string)
	return role, ok
}

func GetUsername(c fiber.Ctx) (string, bool) {
	username, ok := c.Locals(string(UsernameKey)).(string)
	return username, ok
}