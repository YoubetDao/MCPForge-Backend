package services

import (
	"encoding/hex"
	"errors"
	"fmt"
	"strings"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

// Web3Service Web3签名验证服务
type Web3Service struct{}

// NewWeb3Service 创建Web3服务
func NewWeb3Service() *Web3Service {
	return &Web3Service{}
}

// VerifySignature 验证以太坊签名
func (w *Web3Service) VerifySignature(message, signature, address string) bool {
	// 移除0x前缀（如果有）
	signature = strings.TrimPrefix(signature, "0x")
	address = strings.TrimPrefix(address, "0x")

	// 验证地址格式
	if !common.IsHexAddress("0x" + address) {
		return false
	}

	// 解码签名
	sig, err := hex.DecodeString(signature)
	if err != nil {
		return false
	}

	// 签名长度检查
	if len(sig) != 65 {
		return false
	}

	// 调整recovery ID (ethereum的v值可能是27/28或0/1)
	if sig[64] == 27 || sig[64] == 28 {
		sig[64] -= 27
	}

	// 创建消息哈希
	messageHash := accounts.TextHash([]byte(message))

	// 恢复公钥
	pubKey, err := crypto.SigToPub(messageHash, sig)
	if err != nil {
		return false
	}

	// 从公钥生成地址
	recoveredAddr := crypto.PubkeyToAddress(*pubKey)
	expectedAddr := common.HexToAddress("0x" + address)

	// 比较地址（转为小写比较）
	return strings.ToLower(recoveredAddr.Hex()) == strings.ToLower(expectedAddr.Hex())
}

// RecoverAddress 从签名中恢复地址（用于调试）
func (w *Web3Service) RecoverAddress(message, signature string) (string, error) {
	// 移除0x前缀
	signature = strings.TrimPrefix(signature, "0x")

	// 解码签名
	sig, err := hex.DecodeString(signature)
	if err != nil {
		return "", fmt.Errorf("invalid signature format: %v", err)
	}

	// 签名长度检查
	if len(sig) != 65 {
		return "", errors.New("invalid signature length")
	}

	// 调整recovery ID
	if sig[64] == 27 || sig[64] == 28 {
		sig[64] -= 27
	}

	// 创建消息哈希
	messageHash := accounts.TextHash([]byte(message))

	// 恢复公钥
	pubKey, err := crypto.SigToPub(messageHash, sig)
	if err != nil {
		return "", fmt.Errorf("failed to recover public key: %v", err)
	}

	// 从公钥生成地址
	address := crypto.PubkeyToAddress(*pubKey)
	return address.Hex(), nil
}

// ValidateEthereumAddress 验证以太坊地址格式
func (w *Web3Service) ValidateEthereumAddress(address string) bool {
	return common.IsHexAddress(address)
}

// NormalizeAddress 标准化地址格式（转为小写并添加0x前缀）
func (w *Web3Service) NormalizeAddress(address string) string {
	address = strings.TrimPrefix(address, "0x")
	address = strings.ToLower(address)
	return "0x" + address
}

// IsValidPrivateKey 验证私钥格式（仅用于测试）
func (w *Web3Service) IsValidPrivateKey(privateKeyHex string) bool {
	privateKeyHex = strings.TrimPrefix(privateKeyHex, "0x")
	
	privateKeyBytes, err := hex.DecodeString(privateKeyHex)
	if err != nil {
		return false
	}

	_, err = crypto.ToECDSA(privateKeyBytes)
	return err == nil
}

// SignMessage 签名消息（仅用于测试）
func (w *Web3Service) SignMessage(message, privateKeyHex string) (string, error) {
	privateKeyHex = strings.TrimPrefix(privateKeyHex, "0x")
	
	privateKeyBytes, err := hex.DecodeString(privateKeyHex)
	if err != nil {
		return "", fmt.Errorf("invalid private key: %v", err)
	}

	privateKey, err := crypto.ToECDSA(privateKeyBytes)
	if err != nil {
		return "", fmt.Errorf("invalid private key format: %v", err)
	}

	// 创建消息哈希
	messageHash := accounts.TextHash([]byte(message))

	// 签名
	signature, err := crypto.Sign(messageHash, privateKey)
	if err != nil {
		return "", fmt.Errorf("signing failed: %v", err)
	}

	// 调整recovery ID为以太坊标准
	signature[64] += 27

	return hexutil.Encode(signature), nil
}