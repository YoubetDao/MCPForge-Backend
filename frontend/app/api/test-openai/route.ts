import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function GET() {
  try {
    // 检查API密钥
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        status: "error",
        message: "OpenAI API key is not configured",
        apiKeyPresent: false
      })
    }

    console.log("API Key configured:", process.env.OPENAI_API_KEY.substring(0, 20) + "...")

    // 初始化OpenAI客户端
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    console.log("OpenAI client initialized")

    // 简单的测试调用
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello, this is a test message." }],
      max_tokens: 50,
    })

    console.log("OpenAI response received")

    return NextResponse.json({
      status: "success",
      message: "OpenAI API is working correctly",
      apiKeyPresent: true,
      response: response.choices[0]?.message?.content
    })

  } catch (error) {
    console.error("OpenAI test error:", error)
    
    let errorMessage = "Unknown error"
    let errorType = "unknown"
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes("timeout")) {
        errorType = "timeout"
      } else if (error.message.includes("network")) {
        errorType = "network"
      } else if (error.message.includes("authentication")) {
        errorType = "auth"
      } else if (error.message.includes("quota")) {
        errorType = "quota"
      }
    }
    
    return NextResponse.json({
      status: "error",
      message: errorMessage,
      errorType: errorType,
      apiKeyPresent: !!process.env.OPENAI_API_KEY,
      suggestions: {
        timeout: "Try again later or check your network connection",
        network: "Check your internet connection and firewall settings",
        auth: "Verify your API key is correct and has proper permissions",
        quota: "Check your OpenAI account balance and usage limits"
      }
    })
  }
} 