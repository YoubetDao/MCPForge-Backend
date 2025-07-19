# MCPForge 用户系统 API 文档

## 概述

MCPForge 用户系统提供完整的多认证方式支持，包括 Web3 钱包、Google 和 GitHub 登录。用户可以绑定多个认证方式到同一个账户，支持普通用户和开发者两种角色。

## 基础信息

- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (待实现)

## 环境变量配置

GitHub OAuth 功能需要以下环境变量：

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8443/user/auth/github/callback
FRONTEND_URL=http://localhost:3000
```

## 数据模型

### User 用户对象

```typescript
interface User {
  user_id: number;          // 用户ID
  username: string;         // 用户名
  email?: string;           // 邮箱地址（可选）
  role: 'user' | 'developer'; // 用户角色
  reward_address?: string;  // 奖励地址（开发者可选）
  auth_methods: AuthMethod[]; // 认证方式列表
  created_at: string;       // 创建时间 (ISO 8601)
  updated_at: string;       // 更新时间 (ISO 8601)
}
```

### AuthMethod 认证方式对象

```typescript
interface AuthMethod {
  auth_id: number;          // 认证方式ID
  user_id: number;          // 关联用户ID
  auth_type: 'web3' | 'google' | 'github'; // 认证类型
  auth_identifier: string;  // 认证标识符
  created_at: string;       // 创建时间 (ISO 8601)
}
```

## API 端点

### 1. 创建用户

创建新用户并绑定第一个认证方式。

```http
POST /user
```

**请求体：**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "reward_address": "0x1234567890abcdef",
  "auth_type": "web3",
  "auth_identifier": "0x1234567890abcdef"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| username | string | ✅ | 用户名 |
| email | string | ❌ | 邮箱地址 |
| role | enum | ❌ | 用户角色，默认 'user' |
| reward_address | string | ❌ | 奖励地址（开发者用户） |
| auth_type | enum | ✅ | 认证类型 |
| auth_identifier | string | ✅ | 认证标识符 |

**响应：**

```json
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "reward_address": "0x1234567890abcdef",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**错误响应：**

- `409 Conflict` - 认证方式已存在
- `400 Bad Request` - 请求参数无效

---

### 2. 获取所有用户

获取平台所有用户列表（包含认证方式信息）。

```http
GET /user
```

**响应：**

```json
[
  {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "reward_address": "0x1234567890abcdef",
    "auth_methods": [
      {
        "auth_id": 1,
        "user_id": 1,
        "auth_type": "web3",
        "auth_identifier": "0x1234567890abcdef",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 3. 根据认证方式查找用户

根据认证类型和标识符查找对应的用户。

```http
GET /user/by-auth?auth_type={type}&auth_identifier={identifier}
```

**查询参数：**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| auth_type | enum | ✅ | 认证类型：`web3`, `google`, `github` |
| auth_identifier | string | ✅ | 认证标识符 |

**示例请求：**

```http
GET /user/by-auth?auth_type=web3&auth_identifier=0x1234567890abcdef
```

**响应：**

```json
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "reward_address": "0x1234567890abcdef",
  "auth_methods": [
    {
      "auth_id": 1,
      "user_id": 1,
      "auth_type": "web3",
      "auth_identifier": "0x1234567890abcdef",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**错误响应：**

- `404 Not Found` - 用户不存在

---

### 4. 获取单个用户

根据用户 ID 获取用户详细信息。

```http
GET /user/{id}
```

**路径参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| id | number | 用户ID |

**响应：**

```json
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "reward_address": "0x1234567890abcdef",
  "auth_methods": [
    {
      "auth_id": 1,
      "user_id": 1,
      "auth_type": "web3",
      "auth_identifier": "0x1234567890abcdef",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**错误响应：**

- `404 Not Found` - 用户不存在

---

### 5. 绑定认证方式

为现有用户绑定新的认证方式。

```http
POST /user/{id}/bind-auth
```

**路径参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| id | number | 用户ID |

**请求体：**

```json
{
  "auth_type": "github",
  "auth_identifier": "github_user_123"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| auth_type | enum | ✅ | 认证类型 |
| auth_identifier | string | ✅ | 认证标识符 |

**响应：**

```json
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "reward_address": "0x1234567890abcdef",
  "auth_methods": [
    {
      "auth_id": 1,
      "user_id": 1,
      "auth_type": "web3",
      "auth_identifier": "0x1234567890abcdef",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "auth_id": 2,
      "user_id": 1,
      "auth_type": "github",
      "auth_identifier": "github_user_123",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**错误响应：**

- `404 Not Found` - 用户不存在
- `409 Conflict` - 认证方式已被其他用户绑定

---

### 6. 删除用户

删除指定用户及其所有关联的认证方式。

```http
DELETE /user/{id}
```

**路径参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| id | number | 用户ID |

**响应：**

- `204 No Content` - 删除成功

**错误响应：**

- `404 Not Found` - 用户不存在

---

## Web3 钱包认证

### 7. 获取 Web3 登录挑战

获取用于 Web3 钱包签名的随机挑战（nonce）。

```http
POST /user/web3/challenge
```

**请求体：**

```json
{
  "address": "0x742d35Cc6634C0532925a3b8D42B6d6e6"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| address | string | ✅ | Web3 钱包地址 |

**响应：**

```json
{
  "nonce": "Please sign this message to authenticate: 1234567890",
  "expires_at": "2024-01-01T01:00:00.000Z"
}
```

**字段说明：**

| 字段 | 类型 | 描述 |
|------|------|------|
| nonce | string | 需要签名的消息 |
| expires_at | string | 挑战过期时间 (ISO 8601) |

**错误响应：**

- `400 Bad Request` - 钱包地址格式无效

---

### 8. 验证 Web3 签名并登录/注册

验证 Web3 钱包签名，如果用户不存在则自动注册。

```http
POST /user/web3/auth
```

**请求体：**

```json
{
  "address": "0x742d35Cc6634C0532925a3b8D42B6d6e6",
  "signature": "0x1234567890abcdef...",
  "nonce": "Please sign this message to authenticate: 1234567890",
  "username": "crypto_user",
  "email": "user@example.com",
  "role": "user",
  "reward_address": "0x742d35Cc6634C0532925a3b8D42B6d6e6"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| address | string | ✅ | Web3 钱包地址 |
| signature | string | ✅ | 钱包签名 |
| nonce | string | ✅ | 之前获取的挑战消息 |
| username | string | ❌ | 用户名（新用户注册时需要） |
| email | string | ❌ | 邮箱地址 |
| role | enum | ❌ | 用户角色，默认 'user' |
| reward_address | string | ❌ | 奖励地址（开发者用户） |

**响应（登录成功）：**

```json
{
  "success": true,
  "action": "login",
  "user": {
    "user_id": 1,
    "username": "existing_user",
    "email": "user@example.com",
    "role": "user",
    "reward_address": "0x742d35Cc6634C0532925a3b8D42B6d6e6",
    "auth_methods": [
      {
        "auth_id": 1,
        "user_id": 1,
        "auth_type": "web3",
        "auth_identifier": "0x742d35Cc6634C0532925a3b8D42B6d6e6",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Web3 authentication successful"
}
```

**响应（注册成功）：**

```json
{
  "success": true,
  "action": "register",
  "user": {
    "user_id": 2,
    "username": "crypto_user",
    "email": "user@example.com",
    "role": "user",
    "reward_address": "0x742d35Cc6634C0532925a3b8D42B6d6e6",
    "auth_methods": [
      {
        "auth_id": 2,
        "user_id": 2,
        "auth_type": "web3",
        "auth_identifier": "0x742d35Cc6634C0532925a3b8D42B6d6e6",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "User registered and authenticated successfully"
}
```

**错误响应：**

- `400 Bad Request` - 签名验证失败或参数无效
- `401 Unauthorized` - 挑战已过期或无效
- `409 Conflict` - 用户名已存在（注册时）

---

## GitHub OAuth 认证

### 9. GitHub 登录授权

重定向用户到 GitHub 授权页面。

```http
GET /user/auth/github?redirect_uri={redirect_uri}
```

**查询参数：**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| redirect_uri | string | ❌ | 可选的重定向 URI |

**响应：**

- `302 Found` - 重定向到 GitHub 授权页面

**示例：**

```http
GET /user/auth/github?redirect_uri=http://localhost:3000/auth/callback
```

---

### 10. GitHub 回调处理（GET）

处理 GitHub OAuth 回调，适用于浏览器重定向场景。

```http
GET /user/auth/github/callback?code={code}&state={state}
```

**查询参数：**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| code | string | ✅ | GitHub 授权码 |
| state | string | ❌ | 状态参数 |

**响应：**

- `302 Found` - 重定向到前端页面，带上用户信息或错误信息

**成功重定向示例：**

```
http://localhost:3000/auth/callback?user_id=123&success=true
```

**错误重定向示例：**

```
http://localhost:3000/auth/callback?error=GitHub%20authentication%20failed
```

---

### 9. GitHub 回调处理（POST）

处理 GitHub OAuth 回调，适用于 API 调用场景。

```http
POST /user/auth/github/callback
```

**请求体：**

```json
{
  "code": "github_authorization_code",
  "state": "optional_state_parameter"
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| code | string | ✅ | GitHub 授权码 |
| state | string | ❌ | 状态参数 |

**响应：**

```json
{
  "success": true,
  "user": {
    "user_id": 1,
    "username": "github_user",
    "email": "user@example.com",
    "role": "user",
    "auth_methods": [
      {
        "auth_id": 1,
        "user_id": 1,
        "auth_type": "github",
        "auth_identifier": "12345678",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "GitHub authentication successful"
}
```

**错误响应：**

- `400 Bad Request` - 缺少授权码
- `401 Unauthorized` - GitHub 认证失败

---

## 枚举类型定义

### UserRole 用户角色

| 值 | 描述 |
|----|------|
| `user` | 普通用户 - 使用平台功能 |
| `developer` | 开发者用户 - 参与开发并获得奖励 |

### AuthType 认证类型

| 值 | 描述 | 标识符示例 |
|----|------|-----------|
| `web3` | Web3 钱包认证 | `0x1234567890abcdef` |
| `google` | Google 账户认证 | `google_user_123456` |
| `github` | GitHub 账户认证 | `12345678` (GitHub user ID) |

## 错误处理

### 标准错误格式

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### HTTP 状态码

| 状态码 | 描述 |
|--------|------|
| `200` | 请求成功 |
| `201` | 创建成功 |
| `204` | 删除成功 |
| `302` | 重定向 |
| `400` | 请求参数错误 |
| `401` | 认证失败 |
| `404` | 资源不存在 |
| `409` | 资源冲突 |
| `500` | 服务器内部错误 |

## 完整的 GitHub OAuth 流程

### 前端实现示例

```typescript
// 1. 开始 GitHub 登录
function startGitHubLogin() {
  window.location.href = '/api/user/auth/github';
}

// 2. 处理回调页面
function handleAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user_id');
  const success = urlParams.get('success');
  const error = urlParams.get('error');

  if (success && userId) {
    // 登录成功，获取用户信息
    fetchUserInfo(userId);
  } else if (error) {
    console.error('GitHub 登录失败:', error);
  }
}

// 3. 获取用户信息
async function fetchUserInfo(userId: string) {
  try {
    const response = await fetch(`/api/user/${userId}`);
    const user = await response.json();
    // 设置用户会话
    setCurrentUser(user);
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
}
```

### 使用 POST 方式的前端实现

```typescript
// 适用于 SPA 应用，通过 popup 窗口处理 OAuth
async function gitHubLoginWithPopup() {
  // 1. 打开 popup 窗口
  const popup = window.open(
    '/api/user/auth/github',
    'github-login',
    'width=600,height=600'
  );

  // 2. 监听 popup 消息
  window.addEventListener('message', async (event) => {
    if (event.origin !== window.location.origin) return;

    if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
      const { code } = event.data;
      
      // 3. 使用 POST 方式处理回调
      try {
        const response = await fetch('/api/user/auth/github/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        const result = await response.json();
        if (result.success) {
          setCurrentUser(result.user);
        }
      } catch (error) {
        console.error('GitHub 登录失败:', error);
      }

      popup.close();
    }
  });
}
```

## 业务场景示例

### 场景 1：Web3 钱包用户注册

```bash
# 1. 创建 Web3 用户
curl -X POST /user \
  -H "Content-Type: application/json" \
  -d '{
    "username": "crypto_user",
    "auth_type": "web3",
    "auth_identifier": "0x742d35Cc6634C0532925a3b8D42B6d6e6"
  }'
```

### 场景 2：GitHub 社交登录

```bash
# 1. 重定向到 GitHub 授权页面
curl -X GET "/user/auth/github"

# 2. GitHub 回调处理（模拟）
curl -X POST /user/auth/github/callback \
  -H "Content-Type: application/json" \
  -d '{
    "code": "github_authorization_code_here"
  }'
```

### 场景 3：绑定 GitHub 账户到现有用户

```bash
# 1. 首先通过 Web3 查找用户
curl -X GET "/user/by-auth?auth_type=web3&auth_identifier=0x742d35Cc6634C0532925a3b8D42B6d6e6"

# 2. 用户已登录，需要绑定 GitHub（需要先通过 GitHub OAuth 获取 GitHub ID）
curl -X POST /user/1/bind-auth \
  -H "Content-Type: application/json" \
  -d '{
    "auth_type": "github",
    "auth_identifier": "12345678"
  }'
```

### 场景 4：开发者设置奖励地址

```bash
# 1. 创建开发者用户
curl -X POST /user \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dev_user",
    "role": "developer",
    "reward_address": "0x742d35Cc6634C0532925a3b8D42B6d6e6",
    "auth_type": "github",
    "auth_identifier": "87654321"
  }'
```

## 安全考虑

1. **认证标识符唯一性**：每个认证方式的标识符在系统中必须唯一
2. **数据验证**：所有输入数据都经过严格验证
3. **级联删除**：删除用户时会自动删除所有关联的认证方式
4. **OAuth 安全**：
   - 使用 HTTPS 进行 OAuth 流程
   - 验证 state 参数防止 CSRF 攻击
   - 安全存储 GitHub Client Secret
   - 限制回调 URL 域名

## 部署配置

### GitHub OAuth 应用设置

1. 在 GitHub 创建 OAuth App
2. 设置 Authorization callback URL：`https://your-domain.com/api/user/auth/github/callback`
3. 获取 Client ID 和 Client Secret
4. 配置环境变量

### 环境变量示例

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-domain.com/api/user/auth/github/callback

# Frontend
FRONTEND_URL=https://your-frontend-domain.com

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=mcpforge
```

---

*文档版本：v1.1*  
*最后更新：2024-01-01*