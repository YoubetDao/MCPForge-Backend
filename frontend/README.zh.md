# MCPForge Frontend

[English](./README.md) | [中文](./README.zh.md)

MCPForge Frontend 是一个基于 Next.js 15 构建的现代化 Web 应用前端项目。该项目采用了最新的 Web 技术栈，提供了丰富的 UI 组件和功能。

## 🚀 技术栈

- **框架**: Next.js 15.2.4
- **语言**: TypeScript
- **UI 组件**:
  - Radix UI (包含多个核心组件)
  - Tailwind CSS (样式系统)
- **状态管理**: React Hook Form
- **认证**: NextAuth.js
- **其他工具**:
  - date-fns (日期处理)
  - zod (数据验证)
  - recharts (图表库)
  - ethers (区块链交互)

## 📦 安装

确保你的开发环境中已安装了 Node.js (推荐使用最新的 LTS 版本) 和 pnpm。

```bash
# 克隆项目
git clone https://github.com/YoubetDao/MCPForge.git

# 进入项目目录
cd frontend

# 安装依赖
pnpm install
```

## 🔧 开发

```bash
# 启动开发服务器
pnpm dev

# 构建项目
pnpm build

# 启动生产服务器
pnpm start

# 运行代码检查
pnpm lint
```

## 🌲 项目结构

```
frontend/
├── .next/              # Next.js 构建输出
├── app/                # 应用路由和页面
├── components/         # React 组件
├── hooks/             # 自定义 React Hooks
├── lib/               # 工具函数和通用库
├── public/            # 静态资源
├── styles/            # 全局样式
├── types/             # TypeScript 类型定义
└── dictionaries/      # 国际化文本
```

## 🔐 环境变量

创建 `.env.local` 文件并配置以下环境变量：

```env
# 示例环境变量
NEXT_PUBLIC_API_URL=your_api_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=your_auth_url
```

## 📚 主要功能

- 现代化的用户界面
- 响应式设计
- 认证系统
- 国际化支持
- 区块链集成
- 主题切换

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request