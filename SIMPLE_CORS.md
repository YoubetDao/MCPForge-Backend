# 简化的 CORS 和 Cookie 配置

## 🎯 默认支持的域名

后端已硬编码支持以下域名，无需任何配置：

- ✅ `localhost:*` (所有端口)
- ✅ `127.0.0.1:*` (所有端口)  
- ✅ `*.netlify.app` (所有 Netlify 部署)
- ✅ `*.vercel.app` (所有 Vercel 部署)

## 🍪 Cookie 策略

- **开发环境** (`NODE_ENV=development`):
  - `secure: false` (支持 HTTP)
  - `sameSite: 'lax'`

- **生产环境** (`NODE_ENV=production`):
  - `secure: true` (需要 HTTPS)
  - `sameSite: 'none'` (支持跨域)

## 🚀 使用方法

### 本地开发
```bash
NODE_ENV=development
```

### 生产部署
```bash
NODE_ENV=production
```

就这么简单！

## 🧪 测试

部署到 Netlify 后，直接访问你的应用，登录功能应该正常工作。

如果还有问题，检查：
1. 后端是否使用 HTTPS (生产环境必须)
2. 浏览器开发者工具的 Network 标签
3. 确认登录流程是否正确设置了 cookies

## 📝 技术细节

- CORS 自动允许 `*.netlify.app` 和 `localhost`
- Cookie 在生产环境自动使用 `sameSite: 'none'` 支持跨域
- 无需复杂的环境变量配置
- 开箱即用
