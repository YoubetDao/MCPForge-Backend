export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, any>
}

export interface ToolResult {
  toolCallId: string
  content: string
  error?: string
}

export interface MCPServer {
  id: string
  name: string
  description: string
  tools: MCPTool[]
  status: "connected" | "disconnected" | "error"
}

export interface MCPTool {
  name: string
  description: string
  inputSchema?: Record<string, any>
} 