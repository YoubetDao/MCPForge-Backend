import { Message, ToolCall, ToolResult } from "@/types/chat"

export interface ChatAPIResponse {
  content: string
  toolCalls?: ToolCall[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ToolExecutionResponse {
  results: ToolResult[]
}

export class ChatAPI {
  private static async makeRequest(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`/api/chat/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  static async sendMessage(messages: Message[], tools?: any[], provider: 'openai' | 'siliconflow' = 'siliconflow'): Promise<ChatAPIResponse> {
    return this.makeRequest(provider, { messages, tools })
  }

  static async executeTools(toolCalls: ToolCall[]): Promise<ToolExecutionResponse> {
    return this.makeRequest("tools", { toolCalls })
  }

  static async sendMessageWithTools(
    messages: Message[], 
    tools?: any[],
    provider: 'openai' | 'siliconflow' = 'siliconflow'
  ): Promise<{ content: string; toolResults?: ToolResult[] }> {
    // 首先发送消息给AI服务
    const response = await this.sendMessage(messages, tools, provider)
    
    // 如果有工具调用，执行工具
    if (response.toolCalls && response.toolCalls.length > 0) {
      const toolResults = await this.executeTools(response.toolCalls)
      return {
        content: response.content,
        toolResults: toolResults.results
      }
    }

    return {
      content: response.content
    }
  }
} 