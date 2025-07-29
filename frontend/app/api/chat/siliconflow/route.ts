import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, tools } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      )
    }

    // 检查API密钥
    if (!process.env.SILICONFLOW_API_KEY) {
      return NextResponse.json(
        { error: "SiliconFlow API key is not configured" },
        { status: 500 }
      )
    }

    // 构建SiliconFlow消息格式
    const siliconflowMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // 构建工具定义（SiliconFlow使用与OpenAI相同的格式）
    const toolDefinitions = tools?.map((tool: any) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema || {
          type: "object",
          properties: {},
          required: []
        }
      }
    })) || []

    // 调用SiliconFlow API
    const url = 'https://api.siliconflow.cn/v1/chat/completions'
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "Qwen/QwQ-32B", // 使用SiliconFlow的模型
        messages: siliconflowMessages,
        tools: toolDefinitions.length > 0 ? toolDefinitions : undefined,
        tool_choice: toolDefinitions.length > 0 ? "auto" : undefined,
        stream: false,
        temperature: 0.7,
        max_tokens: 1000,
      })
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`SiliconFlow API error: ${response.status} - ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    const completion = data.choices[0]
    
    if (!completion) {
      return NextResponse.json(
        { error: "No response from SiliconFlow" },
        { status: 500 }
      )
    }

    // 处理工具调用
    const toolCalls = completion.message.tool_calls?.map((toolCall: any) => ({
      id: toolCall.id,
      name: toolCall.function.name,
      arguments: JSON.parse(toolCall.function.arguments),
    })) || []

    // 返回响应
    return NextResponse.json({
      content: completion.message.content,
      toolCalls,
      usage: data.usage,
    })

  } catch (error) {
    console.error("SiliconFlow API error:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 