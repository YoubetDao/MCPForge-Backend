package utils

import (
	"crypto/rand"
	"encoding/hex"
	"regexp"
	"strconv"
	"time"
	"unicode"

	"github.com/gofiber/fiber/v3"
)

func GenerateUUID() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func IsValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

func StringToInt(s string) (int, error) {
	return strconv.Atoi(s)
}

func IntToString(i int) string {
	return strconv.Itoa(i)
}

func GetClientIP(c fiber.Ctx) string {
	return c.IP()
}

func FormatTime(t time.Time) string {
	return t.Format("2006-01-02 15:04:05")
}

func ErrorResponse(c fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(fiber.Map{
		"success": false,
		"message": message,
		"timestamp": time.Now().Unix(),
	})
}

func SuccessResponse(c fiber.Ctx, data interface{}) error {
	return c.JSON(fiber.Map{
		"success": true,
		"data":    data,
		"timestamp": time.Now().Unix(),
	})
}

func Contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func ToSnakeCase(s string) string {
	var result []rune
	for i, r := range s {
		if i > 0 && unicode.IsUpper(r) {
			result = append(result, '_')
		}
		result = append(result, unicode.ToLower(r))
	}
	return string(result)
}