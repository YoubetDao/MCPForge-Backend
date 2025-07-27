import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    // 构建OpenAI消息格式
    const openaiMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // 构建工具定义
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

    // 调用OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 或者使用其他可用模型
      messages: openaiMessages,
      tools: toolDefinitions.length > 0 ? toolDefinitions : undefined,
      tool_choice: toolDefinitions.length > 0 ? "auto" : undefined,
      stream: false,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const completion = response.choices[0]
    
    if (!completion) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      )
    }

    // 处理工具调用
    const toolCalls = completion.message.tool_calls?.map((toolCall) => ({
      id: toolCall.id,
      name: toolCall.function.name,
      arguments: JSON.parse(toolCall.function.arguments),
    })) || []

    // 返回响应
    return NextResponse.json({
      content: completion.message.content,
      toolCalls,
      usage: response.usage,
    })

  } catch (error) {
    console.error("OpenAI API error:", error)
    
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