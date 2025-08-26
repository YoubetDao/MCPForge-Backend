package repositories

import (
	"errors"

	"gorm.io/gorm"
	"github.com/YoubetDao/MCPForge-Backend/go-backend/internal/models"
)

// UserRepository 用户仓储接口
type UserRepository interface {
	Create(user *models.User) error
	FindByID(id uint) (*models.User, error)
	FindAll() ([]models.User, error)
	Update(user *models.User) error
	Delete(id uint) error
	FindByAuthMethod(authType models.AuthType, authIdentifier string) (*models.User, error)
	CreateAuthMethod(authMethod *models.AuthMethod) error
	FindByUsername(username string) (*models.User, error)
}

// userRepository GORM实现
type userRepository struct {
	db *gorm.DB
}

// NewUserRepository 创建用户仓储
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

// Create 创建用户
func (r *userRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// FindByID 根据ID查找用户
func (r *userRepository) FindByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.Preload("AuthMethods").First(&user, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

// FindAll 查找所有用户
func (r *userRepository) FindAll() ([]models.User, error) {
	var users []models.User
	err := r.db.Preload("AuthMethods").Find(&users).Error
	return users, err
}

// Update 更新用户
func (r *userRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// Delete 删除用户
func (r *userRepository) Delete(id uint) error {
	return r.db.Delete(&models.User{}, id).Error
}

// FindByAuthMethod 根据认证方法查找用户
func (r *userRepository) FindByAuthMethod(authType models.AuthType, authIdentifier string) (*models.User, error) {
	var authMethod models.AuthMethod
	err := r.db.Where("auth_type = ? AND auth_identifier = ?", authType, authIdentifier).
		Preload("User.AuthMethods").
		First(&authMethod).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // 用户不存在返回nil而不是错误
		}
		return nil, err
	}

	return &authMethod.User, nil
}

// CreateAuthMethod 创建认证方法
func (r *userRepository) CreateAuthMethod(authMethod *models.AuthMethod) error {
	return r.db.Create(authMethod).Error
}

// FindByUsername 根据用户名查找用户
func (r *userRepository) FindByUsername(username string) (*models.User, error) {
	var user models.User
	err := r.db.Where("username = ?", username).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // 用户不存在返回nil而不是错误
		}
		return nil, err
	}
	return &user, nil
}
