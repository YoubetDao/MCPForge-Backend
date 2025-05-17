export interface Tool {
  [key: string]: string
}

export interface MCPCard {
  id: number
  name: string
  github_url: string
  description: string
  overview: string
  tools: Tool
  price: string
  configs: any
  docker_image: string
  mcp_servers: any
  created_at: string
  updated_at: string
}
