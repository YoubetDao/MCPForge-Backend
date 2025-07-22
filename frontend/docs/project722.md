# MCPForge 项目结构总结（2025-07）

## 后端（NestJS）
- 使用 NestJS 构建 API 服务，监听端口为 `8443`
- 使用 `@nestjs/swagger` 和 `swagger-ui-express` 生成 OpenAPI 规范文档
- Swagger JSON 接口用于前端代码生成，统一 DTO 定义，避免复制粘贴
- 使用 `ts-node` 运行 `scripts/swagger.ts` 自动生成 `swagger.json`

## 前端（Next.js + App Router）
- 基于 Next.js App Router 构建，没有 `src` 目录，代码直接组织在 `app/` 和 `lib/` 中
- 前端 API 请求通过 `@/lib/api` 中生成的 SDK 调用，自动化维护接口结构
- 登录方式支持 GitHub OAuth 和 Web3 钱包
- 登录成功后，通过 HTTP-only Cookie 管理会话，避免前端自行管理 Token

## 状态管理方案
- 初期使用 `localStorage` 记录用户状态
- 后续改为使用 Jotai 原子状态管理，结合 `atomWithStorage` 实现持久化
- 自定义 `useUser()` Hook 封装用户状态读写，统一调用方式
- 提供 `clearUser()` 方法以支持登出操作

## 文件结构新增
- `frontend/lib/atoms/user.ts`: 定义 `userAtom`
- `frontend/lib/hooks/useUser.ts`: 提供 `useUser()` 自定义 Hook，用于读写用户状态

## 其他说明
- 项目登录逻辑中已取消 `handleUserRegistration()`，不再显式注册用户
- 登录逻辑中打印出完整 Web3 登录签名请求 Payload，便于调试
- `login-dialog.tsx` 中重构了状态清理逻辑，统一调用 `clearUser` 代替手动 `localStorage.removeItem()`
