package models

import (
	"time"
)

type UserRole string

const (
	UserRoleUser      UserRole = "user"
	UserRoleDeveloper UserRole = "developer"
)

type User struct {
	UserID        uint         `json:"user_id" gorm:"primaryKey;autoIncrement"`
	Username      string       `json:"username" gorm:"not null"`
	Email         *string      `json:"email,omitempty"`
	Role          UserRole     `json:"role" gorm:"type:varchar(20);default:'user'"`
	RewardAddress *string      `json:"reward_address,omitempty"`
	AuthMethods   []AuthMethod `json:"auth_methods,omitempty" gorm:"foreignKey:UserID"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
}

type AuthType string

const (
	AuthTypeWeb3   AuthType = "web3"
	AuthTypeGoogle AuthType = "google"
	AuthTypeGitHub AuthType = "github"
)

type AuthMethod struct {
	AuthID         uint      `json:"auth_id" gorm:"primaryKey;autoIncrement"`
	UserID         uint      `json:"user_id" gorm:"not null"`
	AuthType       AuthType  `json:"auth_type" gorm:"type:varchar(20);not null"`
	AuthIdentifier string    `json:"auth_identifier" gorm:"not null"`
	User           User      `json:"-" gorm:"foreignKey:UserID"`
	CreatedAt      time.Time `json:"created_at"`
}

func (AuthMethod) TableName() string {
	return "auth_methods"
}

func (User) TableName() string {
	return "users"
}
