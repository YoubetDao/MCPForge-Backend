// 简单的内存数据库模拟
interface Server {
  id: string
  title: string
  description: string
  url?: string
  category?: string
  isFeatured?: boolean
  userId?: string
  createdAt: Date
}

// 模拟数据
const servers: Server[] = [
  {
    id: "1",
    title: "GitHub",
    description: "Repository management, file operations, and GitHub API integration",
    isFeatured: true,
    category: "official",
    createdAt: new Date("2023-01-01"),
  },
  {
    id: "2",
    title: "EdgeOne Pages MCP",
    description:
      "An MCP service designed for deploying HTML content to EdgeOne Pages and obtaining an accessible public URL",
    isFeatured: true,
    category: "hosted",
    createdAt: new Date("2023-02-15"),
  },
  {
    id: "3",
    title: "MiniMax MCP",
    description:
      "Official MiniMax Model Context Protocol (MCP) server that enables interaction with powerful Text to Speech, Image generation",
    isFeatured: true,
    category: "official",
    createdAt: new Date("2023-03-10"),
  },
  {
    id: "4",
    title: "Amap Maps",
    description: "高德地图方 MCP Server",
    isFeatured: true,
    category: "server",
    createdAt: new Date("2023-04-05"),
  },
]

// 数据库操作
export const db = {
  // 获取所有服务器
  getServers: async () => {
    return [...servers]
  },

  // 按ID获取服务器
  getServerById: async (id: string) => {
    return servers.find((server) => server.id === id)
  },

  // 添加新服务器
  addServer: async (serverData: Omit<Server, "id" | "createdAt">) => {
    const newServer: Server = {
      id: `${servers.length + 1}`,
      ...serverData,
      createdAt: new Date(),
    }
    servers.push(newServer)
    return newServer
  },

  // 搜索服务器
  searchServers: async (query: string) => {
    const lowerQuery = query.toLowerCase()
    return servers.filter(
      (server) =>
        server.title.toLowerCase().includes(lowerQuery) || server.description.toLowerCase().includes(lowerQuery),
    )
  },
}
