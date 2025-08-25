package logger

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/logger"
)

type Logger struct {
	*slog.Logger
}

func New(level string) *Logger {
	var slogLevel slog.Level
	switch level {
	case "debug":
		slogLevel = slog.LevelDebug
	case "info":
		slogLevel = slog.LevelInfo
	case "warn":
		slogLevel = slog.LevelWarn
	case "error":
		slogLevel = slog.LevelError
	default:
		slogLevel = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{
		Level: slogLevel,
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			if a.Key == slog.TimeKey {
				return slog.Attr{Key: slog.TimeKey, Value: slog.TimeValue(time.Now())}
			}
			return a
		},
	}

	handler := slog.NewJSONHandler(os.Stdout, opts)
	logger := slog.New(handler)
	
	return &Logger{
		Logger: logger,
	}
}

func (l *Logger) Middleware() fiber.Handler {
	return logger.New(logger.Config{
		Format:     "${time} | ${status} | ${latency} | ${method} | ${path} | ${error}\n",
		TimeFormat: "2006-01-02 15:04:05",
	})
}

func (l *Logger) Info(msg string, args ...any) {
	l.Logger.Info(msg, args...)
}

func (l *Logger) Error(msg string, args ...any) {
	l.Logger.Error(msg, args...)
}

func (l *Logger) Debug(msg string, args ...any) {
	l.Logger.Debug(msg, args...)
}

func (l *Logger) Warn(msg string, args ...any) {
	l.Logger.Warn(msg, args...)
}

func (l *Logger) With(key string, value any) *Logger {
	return &Logger{
		Logger: l.Logger.With(key, value),
	}
}

func (l *Logger) WithContext(ctx context.Context) *Logger {
	return &Logger{
		Logger: slog.New(l.Logger.Handler()),
	}
}