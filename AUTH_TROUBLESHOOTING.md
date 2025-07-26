# httpOnly Cookies 认证问题排查与解决方案

## 问题描述

在使用 httpOnly cookies 方案进行认证时，出现了登录成功后前端请求接口返回 401 的问题。

## 根本原因分析

通过深度排查，发现了以下几个关键问题：

### 1. 前端 OpenAPI 配置问题

**问题**: `frontend/lib/api/core/OpenAPI.ts` 中 `WITH_CREDENTIALS: false`

```typescript
// ❌ 错误配置
export const OpenAPI: OpenAPIConfig = {
    WITH_CREDENTIALS: false,  // 这导致请求不包含 cookies
    CREDENTIALS: 'include',
};

// ✅ 正确配置
export const OpenAPI: OpenAPIConfig = {
    WITH_CREDENTIALS: true,   // 启用 credentials
    CREDENTIALS: 'include',
};
```

### 2. 前端 API 调用不一致

**问题**: 不同地方对 `credentials` 的处理不一致

```typescript
// ❌ 错误：某些地方使用 omit
credentials: "omit"

// ✅ 正确：统一使用 include
credentials: "include"
```

### 3. Cookie 安全设置问题

**问题**: 生产环境配置导致开发环境 cookie 无法工作

```typescript
// ❌ 问题代码
secure: isProduction,  // 生产环境强制 HTTPS，开发环境 HTTP 无法使用

// ✅ 修复后
secure: isProduction && isHttps,  // 只有生产环境且使用 HTTPS 时才启用
```

## 解决方案

### 1. 修复前端配置

已修复的文件：
- `frontend/lib/api/core/OpenAPI.ts` - 启用 WITH_CREDENTIALS
- `frontend/lib/api.ts` - 所有 fetch 请求添加 `credentials: 'include'`
- `frontend/components/submit-form.tsx` - 修复 credentials 设置

### 2. 创建统一的 API 客户端

创建了 `frontend/lib/api-client.ts`，确保所有 API 请求都包含 credentials：

```typescript
export async function apiRequest(endpoint: string, options: ApiRequestOptions = {}): Promise<Response> {
  const defaultOptions: RequestInit = {
    credentials: 'include', // 总是包含 cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  return fetch(url, defaultOptions);
}
```

### 3. 修复后端 Cookie 设置

修复了 `backend/src/auth/auth.service.ts` 中的 secure 设置：

```typescript
const isHttps = process.env.HTTPS === 'true' || process.env.SSL_ENABLED === 'true';
response.cookie('auth-session', token, {
  httpOnly: true,
  secure: isProduction && isHttps, // 只有生产环境且使用 HTTPS 时才启用
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});
```

### 4. 创建认证状态管理

创建了 `frontend/hooks/use-auth.ts` 用于统一管理认证状态。

## 测试验证

### 1. 使用测试页面

访问 `http://localhost:3000/auth-test` 进行完整的认证测试。

### 2. 使用测试脚本

```bash
node test-auth.js
```

### 3. 手动验证步骤

1. **启动服务**:
   ```bash
   # 后端
   cd backend && npm run start:dev
   
   # 前端
   cd frontend && npm run dev
   ```

2. **测试登录**:
   - 访问 GitHub 登录: `http://localhost:8443/user/auth/github?redirect_uri=http://localhost:3000/auth/callback`
   - 或使用 Web3 登录流程

3. **验证 Cookies**:
   - 打开浏览器开发者工具
   - 检查 Application > Cookies
   - 确认 `auth-session` cookie 存在且为 httpOnly

4. **测试 API 调用**:
   - 登录后访问 `http://localhost:3000/api-management`
   - 点击"获取 Bearer Token"按钮
   - 应该成功获取 token

## 关键配置检查清单

### 后端配置

- [ ] CORS 配置正确 (`credentials: true`)
- [ ] Cookie parser 中间件已安装
- [ ] Cookie 安全设置适合环境
- [ ] JWT 密钥配置正确

### 前端配置

- [ ] OpenAPI 配置 `WITH_CREDENTIALS: true`
- [ ] 所有 fetch 请求包含 `credentials: 'include'`
- [ ] API 基础 URL 配置正确
- [ ] 没有混用不同的认证方案

### 环境配置

- [ ] 前后端端口配置正确
- [ ] CORS origin 配置匹配前端 URL
- [ ] 开发环境不强制 HTTPS

## 常见问题

### Q: 为什么登录成功但后续请求还是 401？

A: 通常是因为前端请求没有包含 `credentials: 'include'`，导致 cookies 没有发送到后端。

### Q: 开发环境下 cookies 无法设置？

A: 检查 cookie 的 `secure` 设置，开发环境使用 HTTP 时不应该设置 `secure: true`。

### Q: CORS 错误？

A: 确保后端 CORS 配置包含 `credentials: true` 和正确的 `origin` 设置。

## 总结

httpOnly cookies 方案本身是安全可行的，问题主要出现在：

1. **前端配置不一致** - 部分请求没有包含 credentials
2. **环境配置问题** - 生产环境配置在开发环境下不适用
3. **认证流程混乱** - 同时使用多套认证系统

通过统一配置和规范化 API 调用，httpOnly cookies 方案可以正常工作，并且比 localStorage 存储 token 更安全。
