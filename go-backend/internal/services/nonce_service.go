package services

import (
	"fmt"
	"math/rand"
	"sync"
	"time"

	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/models"
)

// NonceService 管理nonce的服务
type NonceService struct {
	store map[string]*models.NonceStore
	mutex sync.RWMutex
}

// NewNonceService 创建nonce服务
func NewNonceService() *NonceService {
	return &NonceService{
		store: make(map[string]*models.NonceStore),
		mutex: sync.RWMutex{},
	}
}

// GenerateNonce 为地址生成nonce
func (n *NonceService) GenerateNonce(address string) *models.NonceStore {
	n.mutex.Lock()
	defer n.mutex.Unlock()

	// 生成nonce
	timestamp := time.Now().Format(time.RFC3339)
	randomID := generateRandomString(15)
	nonce := fmt.Sprintf("Login to MCPForge at %s with nonce: %s", timestamp, randomID)
	expires := time.Now().Add(5 * time.Minute) // 5分钟过期

	nonceStore := &models.NonceStore{
		Nonce:   nonce,
		Expires: expires,
	}

	// 存储nonce (地址统一转为小写)
	normalizedAddress := address
	n.store[normalizedAddress] = nonceStore

	return nonceStore
}

// VerifyAndConsumeNonce 验证并消费nonce
func (n *NonceService) VerifyAndConsumeNonce(address, nonce string) bool {
	n.mutex.Lock()
	defer n.mutex.Unlock()

	normalizedAddress := address
	storedNonce, exists := n.store[normalizedAddress]

	if !exists {
		return false
	}

	// 检查过期
	if storedNonce.Expires.Before(time.Now()) {
		delete(n.store, normalizedAddress)
		return false
	}

	// 检查nonce匹配
	if storedNonce.Nonce != nonce {
		return false
	}

	// 验证成功，删除nonce（一次性使用）
	delete(n.store, normalizedAddress)
	return true
}

// CleanupExpired 清理过期的nonce
func (n *NonceService) CleanupExpired() {
	n.mutex.Lock()
	defer n.mutex.Unlock()

	now := time.Now()
	for address, nonceStore := range n.store {
		if nonceStore.Expires.Before(now) {
			delete(n.store, address)
		}
	}
}

// generateRandomString 生成随机字符串
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}