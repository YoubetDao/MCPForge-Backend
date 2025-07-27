# MCPForge 前端架构文档

## 项目概述

MCPForge 是一个基于 Next.js 15 构建的现代化 Web 应用，用于展示和管理 MCP (Model Context Protocol) 服务器。该项目采用了 TypeScript、React 19 和 Tailwind CSS 等前沿技术栈。

## 技术栈

### 核心框架
- **Next.js 15.2.4** - React 全栈框架，支持 App Router
- **React 19** - UI 库
- **TypeScript** - 类型安全的 JavaScript 超集

### 样式和 UI
- **Tailwind CSS 3.4** - 原子化 CSS 框架
- **Radix UI** - 无样式的可访问性组件库
- **Lucide React** - 图标库
- **shadcn/ui** - 基于 Radix UI 和 Tailwind CSS 的组件库

### 状态管理
- **Jotai** - 原子化状态管理库
- **React Query (@tanstack/react-query)** - 服务端状态管理

### 区块链集成
- **@mysten/dapp-kit** - Sui 区块链 DApp 开发工具包
- **@mysten/sui** - Sui 区块链 SDK
- **ethers** - 以太坊库（用于钱包签名验证）

### 认证
- **NextAuth** - 身份验证解决方案
- 支持 GitHub OAuth 和 Web3 钱包登录

### 国际化
- 自定义的多语言解决方案
- 支持中文和英文

## 项目结构

```
frontend/
├── app/                    # Next.js App Router 目录
│   ├── [lang]/            # 动态语言路由
│   ├── api/               # API 路由
│   │   ├── auth/          # NextAuth 认证端点
│   │   ├── avatar/        # 头像生成服务
│   │   ├── servers/       # MCP 服务器相关 API
│   │   └── start-mcp-server/ # 启动 MCP 服务器 API
│   ├── auth/              # 认证相关页面
│   ├── my-servers/        # 用户服务器管理
│   ├── profile/           # 用户资料页面
│   ├── search/            # 搜索页面
│   ├── servers/           # 服务器详情页面
│   └── submit/            # 提交新服务器页面
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   └── ...               # 业务组件
├── lib/                   # 工具库和配置
│   ├── api/              # API 客户端（OpenAPI 生成）
│   ├── atoms/            # Jotai 原子
│   └── hooks/            # 自定义 React Hooks
├── dictionaries/         # 国际化字典文件
├── public/               # 静态资源
└── types/                # TypeScript 类型定义
```

## 核心功能模块

### 1. 路由系统

使用 Next.js 15 的 App Router，主要路由包括：

- `/` - 主页，展示特色 MCP 服务器
- `/[lang]` - 支持多语言的动态路由
- `/servers/[slug]` - 服务器详情页
- `/my-servers` - 用户的服务器列表
- `/profile` - 用户资料页
- `/search` - 搜索页面
- `/submit` - 提交新服务器

### 2. 认证系统

#### NextAuth 配置
- 支持 GitHub OAuth 登录
- 支持 Web3 钱包登录（通过消息签名验证）
- 自定义登录页面和错误处理

#### 钱包集成
- 集成 Sui 钱包（Sui Wallet、Suiet、Martian）
- 使用 @mysten/dapp-kit 管理钱包连接
- 支持自动连接和网络切换

### 3. 状态管理

#### 全局状态 (Jotai)
- `userAtom` - 用户信息持久化存储

#### 服务端状态 (React Query)
- MCP 卡片数据缓存
- API 请求管理
- 自动重试和错误处理

### 4. API 集成

#### 自定义 API 层 (`lib/api.ts`)
- MCP 卡片的 CRUD 操作
- MCP 服务器管理（创建、状态检查、删除）
- 轮询机制监控服务器启动状态
- 降级策略：API 不可用时使用 Mock 数据

#### OpenAPI 客户端 (`lib/api/`)
- 自动生成的 TypeScript 客户端
- 类型安全的 API 调用
- 支持用户、MCP 卡片、MCP 服务器等服务

### 5. UI 组件体系

#### 设计系统
- 基于 Radix UI 的无障碍组件
- Tailwind CSS 实现的赛博朋克风格主题
- 支持亮色/暗色模式切换

#### 核心组件
- `ServerCard` - MCP 服务器卡片展示
- `CategoryTabs` - 分类标签导航
- `AuthButton` - 认证按钮（支持多种登录方式）
- `WalletConnectButton` - 钱包连接按钮
- `LanguageSwitcher` - 语言切换器
- `ThemeToggle` - 主题切换按钮

### 6. 国际化方案

- 基于文件系统的字典管理
- 支持动态语言切换
- Context API 传递语言和字典数据
- 支持的语言：英文（en）、中文（zh-CN）

## 数据流

```
用户交互 → React 组件 → API 调用/状态更新
                              ↓
                        后端 API / 区块链
                              ↓
                        响应数据
                              ↓
                  React Query 缓存 / Jotai 状态
                              ↓
                        UI 更新
```

## 性能优化

1. **代码分割** - Next.js 自动代码分割
2. **图片优化** - Next.js Image 组件（当前配置为 unoptimized）
3. **客户端缓存** - React Query 缓存策略
4. **状态持久化** - Jotai 的 atomWithStorage

## 开发工具配置

### TypeScript 配置
- 严格模式启用
- 路径别名：`@/*` 映射到项目根目录

### 构建配置
- ESLint 和 TypeScript 错误在构建时忽略（用于快速迭代）
- 支持的环境变量：
  - `NEXT_PUBLIC_API_BASE_URL` - API 基础 URL
  - `NEXT_PUBLIC_API_KEY` - API 密钥
  - `GITHUB_ID` / `GITHUB_SECRET` - GitHub OAuth
  - `NEXTAUTH_SECRET` - NextAuth 加密密钥

## 部署注意事项

1. 确保设置所有必需的环境变量
2. 配置正确的 API 端点
3. 确保 NextAuth 回调 URL 正确配置
4. 区块链网络配置（mainnet/testnet）

## 未来优化方向

1. **性能优化**
   - 启用图片优化
   - 实现服务端组件缓存
   - 优化首屏加载时间

2. **功能增强**
   - 添加更多钱包支持
   - 实现高级搜索功能
   - 用户个人中心功能完善

3. **代码质量**
   - 恢复构建时的 ESLint 和 TypeScript 检查
   - 添加单元测试和集成测试
   - 实现错误边界和更好的错误处理