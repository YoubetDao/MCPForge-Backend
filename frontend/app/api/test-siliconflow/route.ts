import { NextResponse } from "next/server"

export async function GET() {
  return await handleRequest("Hello, this is a test message.")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userMessage = body.message || "Hello, this is a test message."
    return await handleRequest(userMessage)
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Invalid request body",
      apiKeyPresent: !!process.env.SILICONFLOW_API_KEY,
      errorType: "invalid_request"
    })
  }
}

async function handleRequest(userMessage: string) {
  try {
    // 检查API密钥
    if (!process.env.SILICONFLOW_API_KEY) {
      return NextResponse.json({
        status: "error",
        message: "SiliconFlow API key is not configured",
        apiKeyPresent: false
      })
    }

    console.log("API Key configured:", process.env.SILICONFLOW_API_KEY.substring(0, 20) + "...")

    const url = 'https://api.siliconflow.cn/v1/chat/completions'
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "Qwen/QwQ-32B",
        messages: [
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 500
      })
    }

    console.log("SiliconFlow client initialized")

    // 测试调用
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("SiliconFlow response received")

    return NextResponse.json({
      status: "success",
      message: "SiliconFlow API is working correctly",
      apiKeyPresent: true,
      response: data.choices?.[0]?.message?.content,
      fullResponse: data
    })

  } catch (error) {
    console.error("SiliconFlow test error:", error)
    
    let errorMessage = "Unknown error"
    let errorType = "unknown"
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes("timeout")) {
        errorType = "timeout"
      } else if (error.message.includes("network")) {
        errorType = "network"
      } else if (error.message.includes("authentication") || error.message.includes("401")) {
        errorType = "auth"
      } else if (error.message.includes("quota") || error.message.includes("429")) {
        errorType = "quota"
      } else if (error.message.includes("404")) {
        errorType = "not_found"
      } else if (error.message.includes("500")) {
        errorType = "server_error"
      }
    }
    
    return NextResponse.json({
      status: "error",
      message: errorMessage,
      errorType: errorType,
      apiKeyPresent: !!process.env.SILICONFLOW_API_KEY,
      suggestions: {
        timeout: "Try again later or check your network connection",
        network: "Check your internet connection and firewall settings",
        auth: "Verify your API key is correct and has proper permissions",
        quota: "Check your SiliconFlow account balance and usage limits",
        not_found: "Check if the API endpoint is correct",
        server_error: "SiliconFlow servers might be experiencing issues, try again later"
      }
    })
  }
}
