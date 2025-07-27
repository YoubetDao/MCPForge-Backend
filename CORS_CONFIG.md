# CORS 配置说明

## 当前配置

后端已配置为允许以下域名访问：

### 自动允许的域名（使用正则表达式）

1. **Netlify 部署**: `*.netlify.app` - 正则: `^https?://.*\.netlify\.app$`
2. **Vercel 部署**: `*.vercel.app` - 正则: `^https?://.*\.vercel\.app$`
3. **GitHub Pages**: `*.github.io` - 正则: `^https?://.*\.github\.io$`
4. **Surge.sh**: `*.surge.sh` - 正则: `^https?://.*\.surge\.sh$`
5. **本地开发**: 所有 `localhost` 和 `127.0.0.1` 域名（仅开发环境）
6. **无 Origin**: 移动端应用、Postman 等

### 环境变量配置

在 `.env` 文件中可以配置：

```bash
# 主要前端 URL
FRONTEND_URL=http://localhost:3000

# 额外允许的 URL（用逗号分隔）
ADDITIONAL_FRONTEND_URLS=https://my-app.netlify.app,https://staging.netlify.app

# 自定义域名正则表达式模式（用逗号分隔）
ALLOWED_DOMAIN_PATTERNS=^https?://.*\.yourdomain\.com$,^https?://.*\.staging\.com$

# 环境设置
NODE_ENV=development
```

## 使用方法

### 1. Netlify 部署

部署到 Netlify 后，你的应用会自动获得一个 `*.netlify.app` 域名，无需额外配置即可访问后端。

例如：
- `https://amazing-app-123.netlify.app` ✅ 自动允许
- `https://my-project.netlify.app` ✅ 自动允许

### 2. 自定义域名

如果使用自定义域名，需要在环境变量中添加：

```bash
ADDITIONAL_FRONTEND_URLS=https://my-custom-domain.com,https://staging.my-domain.com
```

### 3. 正则表达式模式

使用 `ALLOWED_DOMAIN_PATTERNS` 环境变量配置自定义域名模式：

```bash
# 允许所有 .yourdomain.com 的子域名
ALLOWED_DOMAIN_PATTERNS=^https?://.*\.yourdomain\.com$

# 允许多个模式（用逗号分隔）
ALLOWED_DOMAIN_PATTERNS=^https?://.*\.yourdomain\.com$,^https?://.*\.staging\.com$,^https?://app-.*\.example\.org$
```

**常用正则表达式模式**：
- `^https?://.*\.netlify\.app$` - 所有 Netlify 子域名
- `^https?://.*\.yourdomain\.com$` - 所有 yourdomain.com 子域名
- `^https?://app-.*\.example\.com$` - 以 app- 开头的子域名
- `^https?://(www\.)?example\.com$` - example.com 和 www.example.com

### 4. 本地开发

开发环境下，所有 localhost 端口都被允许：
- `http://localhost:3000` ✅
- `http://localhost:3001` ✅
- `http://127.0.0.1:8080` ✅

## 测试 CORS 配置

### 使用测试脚本

```bash
node test-cors.js
```

### 手动测试

1. **浏览器开发者工具**:
   ```javascript
   fetch('http://localhost:8443/auth/status', {
     method: 'GET',
     credentials: 'include'
   }).then(r => r.json()).then(console.log)
   ```

2. **curl 命令**:
   ```bash
   curl -H "Origin: https://my-app.netlify.app" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        http://localhost:8443/auth/status
   ```

## 安全考虑

### 生产环境建议

虽然当前配置允许所有 `*.netlify.app` 域名，但在生产环境中，建议：

1. **限制具体域名**:
   ```bash
   ADDITIONAL_FRONTEND_URLS=https://your-production-app.netlify.app
   ```

2. **移除通配符支持**（如果需要更严格的安全）

### 开发环境

开发环境配置相对宽松，允许：
- 所有 localhost 域名
- 详细的 CORS 日志输出

## 常见问题

### Q: 为什么我的自定义域名被拒绝？

A: 需要将自定义域名添加到 `ADDITIONAL_FRONTEND_URLS` 环境变量中。

### Q: 如何查看 CORS 日志？

A: 后端会在控制台输出详细的 CORS 检查日志：
```
🌐 CORS check for origin: https://my-app.netlify.app
✅ Netlify/Vercel domain - allowing access
```

### Q: 生产环境如何配置？

A: 设置具体的允许域名：
```bash
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
ADDITIONAL_FRONTEND_URLS=https://staging.netlify.app
```

### Q: 如何禁用 CORS 检查？

A: 不建议在生产环境禁用，但如果需要，可以设置：
```javascript
app.enableCors({
  origin: true, // 允许所有域名
  credentials: true,
});
```

## 部署检查清单

- [ ] 确认 `FRONTEND_URL` 设置正确
- [ ] 如使用自定义域名，添加到 `ADDITIONAL_FRONTEND_URLS`
- [ ] 测试前端能否正常调用后端 API
- [ ] 检查浏览器控制台是否有 CORS 错误
- [ ] 验证 cookies 能否正常发送和接收
