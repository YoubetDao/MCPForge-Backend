# GitHub OAuth Integration Testing Guide

## 概述

这个文档描述了如何设置和运行 MCPForge 的 GitHub OAuth 集成测试。测试系统包含单元测试、集成测试和端到端测试，确保 GitHub 认证功能正常工作。

## 前置条件

### 1. 系统要求

- Node.js 18+ 
- PostgreSQL 12+
- pnpm (推荐) 或 npm
- curl (用于 API 测试)

### 2. GitHub OAuth 应用设置

在运行测试之前，你需要在 GitHub 上创建一个 OAuth 应用：

1. 登录 GitHub，进入 **Settings** → **Developer settings** → **OAuth Apps**
2. 点击 **New OAuth App**
3. 填写应用信息：
   - **Application name**: `MCPForge-Test`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:8443/user/auth/github/callback`
4. 创建后获得 `Client ID` 和 `Client Secret`

### 3. 环境配置

创建测试环境配置文件 `backend/test.env`：

```env
# GitHub OAuth Configuration for Testing
GITHUB_CLIENT_ID=your_test_github_client_id
GITHUB_CLIENT_SECRET=your_test_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8443/user/auth/github/callback

# Frontend URL for redirects
FRONTEND_URL=http://localhost:3000

# Test Database Configuration
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=mcpforge_test

# Application Configuration
PORT=8443
NODE_ENV=test
```

## 数据库管理

### 自动化数据库管理

测试系统采用自动化的数据库管理策略：

1. **测试开始时**：
   - 自动删除已存在的 `mcpforge_test` 数据库
   - 创建全新的测试数据库
   - 运行数据库迁移

2. **测试结束后**：
   - 默认自动删除测试数据库
   - 使用 `--keep-db` 参数可以保留数据库用于调试

3. **数据库配置**：
   - 数据库名称：`mcpforge_test`
   - 端口：5433
   - 用户：postgres
   - 密码：postgres

### 手动数据库管理

```bash
# 手动创建测试数据库
createdb -h localhost -p 5433 -U postgres mcpforge_test

# 手动删除测试数据库
dropdb -h localhost -p 5433 -U postgres mcpforge_test

# 连接测试数据库
psql -h localhost -p 5433 -U postgres -d mcpforge_test

# 查看数据库列表
psql -h localhost -p 5433 -U postgres -l
```

## 测试架构

### 测试类型

1. **单元测试** (`src/**/*.spec.ts`)
   - 测试 UserService 的各个方法
   - 模拟 GitHub API 响应
   - 验证业务逻辑

2. **集成测试** (`test/**/*.e2e-spec.ts`)
   - 测试完整的 HTTP 请求流程
   - 真实的数据库交互
   - 端到端的 OAuth 流程

3. **手动 API 测试**
   - 启动真实服务器
   - 测试 API 端点
   - 验证响应格式

### Mock 系统

- **GitHubApiMock**: 模拟 GitHub API 响应
- **UserServiceMock**: 模拟用户服务行为
- 预设的测试用户和认证数据

## 运行测试

### 方式一：使用自动化脚本（推荐）

```bash
# 进入后端目录
cd backend

# 给脚本执行权限
chmod +x scripts/test-github-auth.sh

# 运行完整测试套件
./scripts/test-github-auth.sh

# 运行测试并保留数据库用于调试
./scripts/test-github-auth.sh --keep-db

# 查看帮助
./scripts/test-github-auth.sh --help
```

### 方式二：手动运行

#### 1. 准备环境

```bash
# 安装 pnpm (如果还没有)
npm install -g pnpm

# 安装依赖
pnpm install

# 启动 PostgreSQL
brew services start postgresql  # macOS
# 或
sudo systemctl start postgresql  # Linux

# 确保数据库存在 (通常已经存在)
createdb -U postgres mcpforge_test 2>/dev/null || echo "Database already exists"
```

#### 2. 运行数据库迁移

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/mcpforge_test"
pnpm run migration:run
```

#### 3. 运行单元测试

```bash
pnpm test -- --testPathPattern="src/.*\.spec\.ts$"
```

#### 4. 运行集成测试

```bash
pnpm run test:e2e
```

#### 5. 运行覆盖率测试

```bash
pnpm run test:cov
```

## 测试覆盖范围

### GitHub OAuth 流程测试

- ✅ 授权 URL 生成
- ✅ 授权码交换访问令牌
- ✅ 获取用户信息
- ✅ 获取用户邮箱
- ✅ 新用户注册
- ✅ 现有用户登录
- ✅ 错误处理

### API 端点测试

- ✅ `GET /user/auth/github` - GitHub 授权重定向
- ✅ `GET /user/auth/github/callback` - OAuth 回调处理
- ✅ `POST /user/auth/github/callback` - OAuth 回调 API
- ✅ `GET /user/by-auth` - 通过认证方式查找用户
- ✅ `POST /user` - 创建用户
- ✅ `POST /user/:id/bind-auth` - 绑定认证方式

### 数据库操作测试

- ✅ 用户创建
- ✅ 认证方式绑定
- ✅ 重复认证检查
- ✅ 用户查询
- ✅ 数据一致性

## 测试数据

### 预设测试用户

```javascript
// 测试用户 1
{
  id: 12345678,
  login: 'testuser',
  name: 'Test User',
  email: 'test@example.com'
}

// 测试用户 2
{
  id: 87654321,
  login: 'developer',
  name: 'Developer User',
  email: 'dev@example.com'
}
```

### 预设认证码

- `valid_auth_code` → `mock_access_token_123`
- `valid_auth_code_2` → `mock_access_token_456`

## 故障排除

### 常见问题

1. **PostgreSQL 连接失败**
   ```bash
   # 检查 PostgreSQL 状态
   pg_isready -h localhost -p 5432
   
   # 启动 PostgreSQL
   brew services start postgresql  # macOS
   sudo systemctl start postgresql  # Linux
   ```

2. **测试数据库权限问题**
   ```bash
   # 检查数据库连接
   psql -h localhost -p 5433 -U postgres -c "SELECT 1;"
   
   # 重新创建测试数据库
   dropdb -U postgres mcpforge_test 2>/dev/null || true
   createdb -U postgres mcpforge_test
   ```

3. **GitHub OAuth 配置错误**
   - 检查 `test.env` 文件中的 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET`
   - 确保 GitHub OAuth 应用的回调 URL 正确

4. **端口冲突**
   - 确保端口 8443 没有被其他服务占用
   - 修改 `test.env` 中的 `PORT` 配置

### 调试技巧

1. **查看详细日志**
   ```bash
   npm test -- --verbose
   ```

2. **运行单个测试**
   ```bash
   npm test -- --testNamePattern="should handle GitHub callback"
   ```

3. **保留测试数据库**
   ```bash
   # 使用 --keep-db 标志，保留数据库用于调试
   ./scripts/test-github-auth.sh --keep-db
   
   # 手动连接数据库查看数据
   psql -U postgres -d mcpforge_test -h localhost -p 5433
   ```

## 持续集成

### GitHub Actions 配置

```yaml
name: GitHub OAuth Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
      working-directory: ./backend
    
    - name: Create test environment
      run: |
        echo "GITHUB_CLIENT_ID=${{ secrets.GITHUB_CLIENT_ID }}" > test.env
        echo "GITHUB_CLIENT_SECRET=${{ secrets.GITHUB_CLIENT_SECRET }}" >> test.env
        echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5433/mcpforge_test" >> test.env
      working-directory: ./backend
    
    - name: Run tests
      run: ./scripts/test-github-auth.sh
      working-directory: ./backend
```

## 最佳实践

1. **测试隔离**: 每个测试都应该独立运行，不依赖其他测试的状态
2. **数据清理**: 测试后清理数据，避免影响后续测试
3. **Mock 使用**: 对外部服务（如 GitHub API）使用 Mock，提高测试稳定性
4. **错误测试**: 不仅测试成功场景，也要测试各种错误情况
5. **性能监控**: 关注测试执行时间，及时发现性能问题

## 扩展测试

### 添加新的测试用例

1. 在 `src/user/user.service.spec.ts` 中添加单元测试
2. 在 `test/user-auth.e2e-spec.ts` 中添加集成测试
3. 在 Mock 服务中添加新的测试数据

### 测试其他 OAuth 提供商

1. 创建新的 Mock 服务（如 `google-api.mock.ts`）
2. 添加相应的测试用例
3. 更新测试脚本以支持新的提供商

## 参考资料

- [GitHub OAuth 文档](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- [NestJS 测试文档](https://docs.nestjs.com/fundamentals/testing)
- [Jest 测试框架](https://jestjs.io/docs/getting-started)
- [Supertest API 测试](https://github.com/visionmedia/supertest) 