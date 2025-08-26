package services

import (
	"errors"
	"strings"
	"time"

	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/models"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/repositories"
)

// UserService 用户业务逻辑服务
type UserService struct {
	userRepo     repositories.UserRepository
	nonceService *NonceService
	web3Service  *Web3Service
}

// NewUserService 创建用户服务
func NewUserService(userRepo repositories.UserRepository, nonceService *NonceService, web3Service *Web3Service) *UserService {
	return &UserService{
		userRepo:     userRepo,
		nonceService: nonceService,
		web3Service:  web3Service,
	}
}

// GenerateWeb3Challenge 生成Web3认证挑战
func (s *UserService) GenerateWeb3Challenge(address string) (*models.Web3ChallengeResponse, error) {
	// 验证地址格式
	if !s.web3Service.ValidateEthereumAddress(address) {
		return nil, errors.New("invalid ethereum address")
	}

	// 标准化地址
	normalizedAddress := strings.ToLower(address)

	// 生成nonce
	nonceStore := s.nonceService.GenerateNonce(normalizedAddress)

	return &models.Web3ChallengeResponse{
		Nonce:     nonceStore.Nonce,
		ExpiresAt: nonceStore.Expires.Format(time.RFC3339),
	}, nil
}

// VerifyWeb3Auth 验证Web3认证并登录/注册用户
func (s *UserService) VerifyWeb3Auth(req *models.Web3AuthRequest) (*models.Web3AuthResponse, error) {
	// 标准化地址
	normalizedAddress := strings.ToLower(req.Address)

	// 1. 验证nonce
	if !s.nonceService.VerifyAndConsumeNonce(normalizedAddress, req.Nonce) {
		return nil, errors.New("invalid or expired nonce")
	}

	// 2. 验证签名
	if !s.web3Service.VerifySignature(req.Nonce, req.Signature, req.Address) {
		return nil, errors.New("invalid signature")
	}

	// 3. 查找或创建用户
	user, err := s.userRepo.FindByAuthMethod(models.AuthTypeWeb3, normalizedAddress)
	if err != nil {
		return nil, err
	}

	var action string
	if user == nil {
		// 新用户注册
		action = "register"
		
		// 如果没有提供用户名，使用地址作为用户名
		username := normalizedAddress
		if req.Username != nil && *req.Username != "" {
			username = *req.Username
		}

		// 设置默认角色
		role := models.UserRoleUser
		if req.Role != nil {
			role = *req.Role
		}

		// 创建新用户
		newUser := &models.User{
			Username:      username,
			Email:         req.Email,
			Role:          role,
			RewardAddress: req.RewardAddress,
		}

		err = s.userRepo.Create(newUser)
		if err != nil {
			return nil, err
		}

		// 创建认证方法
		authMethod := &models.AuthMethod{
			UserID:         newUser.UserID,
			AuthType:       models.AuthTypeWeb3,
			AuthIdentifier: normalizedAddress,
		}

		err = s.userRepo.CreateAuthMethod(authMethod)
		if err != nil {
			return nil, err
		}

		user = newUser
	} else {
		action = "login"
	}

	// 重新查询用户以获取完整信息（包括AuthMethods）
	fullUser, err := s.userRepo.FindByID(user.UserID)
	if err != nil {
		return nil, err
	}

	message := "Web3 authentication successful"
	if action == "register" {
		message = "User registered and authenticated successfully"
	}

	return &models.Web3AuthResponse{
		Success: true,
		Action:  action,
		User:    *fullUser,
		Message: message,
	}, nil
}

// CreateUser 创建用户
func (s *UserService) CreateUser(req *models.CreateUserRequest) (*models.User, error) {
	// 检查认证方法是否已存在
	existingUser, err := s.userRepo.FindByAuthMethod(req.AuthType, req.AuthIdentifier)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("auth method already exists")
	}

	// 设置默认角色
	role := models.UserRoleUser
	if req.Role != nil {
		role = *req.Role
	}

	// 创建用户
	user := &models.User{
		Username:      req.Username,
		Email:         req.Email,
		Role:          role,
		RewardAddress: req.RewardAddress,
	}

	err = s.userRepo.Create(user)
	if err != nil {
		return nil, err
	}

	// 创建认证方法
	authMethod := &models.AuthMethod{
		UserID:         user.UserID,
		AuthType:       req.AuthType,
		AuthIdentifier: req.AuthIdentifier,
	}

	err = s.userRepo.CreateAuthMethod(authMethod)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserByID 根据ID获取用户
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	return s.userRepo.FindByID(id)
}

// GetAllUsers 获取所有用户
func (s *UserService) GetAllUsers() ([]models.User, error) {
	return s.userRepo.FindAll()
}

// UpdateUser 更新用户信息
func (s *UserService) UpdateUser(id uint, req *models.UpdateUserRequest) (*models.User, error) {
	// 查找用户
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// 检查用户名是否被其他用户使用
	if req.Username != nil {
		existingUser, err := s.userRepo.FindByUsername(*req.Username)
		if err != nil {
			return nil, err
		}
		if existingUser != nil && existingUser.UserID != id {
			return nil, errors.New("username already exists")
		}
		user.Username = *req.Username
	}

	// 更新字段
	if req.Email != nil {
		user.Email = req.Email
	}
	if req.Role != nil {
		user.Role = *req.Role
	}
	if req.RewardAddress != nil {
		user.RewardAddress = req.RewardAddress
	}

	// 保存更新
	err = s.userRepo.Update(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// DeleteUser 删除用户
func (s *UserService) DeleteUser(id uint) error {
	// 检查用户是否存在
	_, err := s.userRepo.FindByID(id)
	if err != nil {
		return err
	}

	return s.userRepo.Delete(id)
}