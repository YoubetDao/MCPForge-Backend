"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react"

interface ApiResponse {
  status: "success" | "error"
  message: string
  apiKeyPresent: boolean
  response?: string
  fullResponse?: any
  errorType?: string
  suggestions?: Record<string, string>
}

export default function SiliconFlowTestPage() {
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)

  const handleSend = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    setApiResponse(null)

    try {
      const response = await fetch("/api/test-siliconflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputText,
        }),
      })

      const data: ApiResponse = await response.json()
      setApiResponse(data)
    } catch (error) {
      setApiResponse({
        status: "error",
        message: "Failed to connect to API",
        apiKeyPresent: false,
        errorType: "network",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">SiliconFlow API 测试</h1>
          <p className="text-muted-foreground">
            测试 SiliconFlow API 连接和响应
          </p>
        </div>

        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle>输入测试消息</CardTitle>
            <CardDescription>
              输入你想要发送给 SiliconFlow API 的消息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="输入你的消息..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 min-h-[100px]"
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !inputText.trim()}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    发送中...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    发送
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 结果显示区域 */}
        {apiResponse && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {apiResponse.status === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <CardTitle>
                  {apiResponse.status === "success" ? "API 测试成功" : "API 测试失败"}
                </CardTitle>
              </div>
              <CardDescription>
                {apiResponse.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API 密钥状态 */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">API 密钥状态:</span>
                <span className={`text-sm ${apiResponse.apiKeyPresent ? 'text-green-600' : 'text-red-600'}`}>
                  {apiResponse.apiKeyPresent ? '已配置' : '未配置'}
                </span>
              </div>

              {/* 成功响应 */}
              {apiResponse.status === "success" && apiResponse.response && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">AI 响应:</h4>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{apiResponse.response}</p>
                  </div>
                </div>
              )}

              {/* 错误信息 */}
              {apiResponse.status === "error" && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">错误详情:</h4>
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{apiResponse.message}</p>
                    {apiResponse.errorType && (
                      <p className="text-xs text-muted-foreground mt-1">
                        错误类型: {apiResponse.errorType}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 建议 */}
              {apiResponse.status === "error" && apiResponse.suggestions && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">解决建议:</h4>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    {apiResponse.errorType && apiResponse.suggestions[apiResponse.errorType] && (
                      <p className="text-sm text-blue-800">
                        {apiResponse.suggestions[apiResponse.errorType]}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 完整响应（调试用） */}
              {apiResponse.fullResponse && (
                <details className="mt-4">
                  <summary className="text-sm font-medium cursor-pointer hover:text-primary">
                    查看完整响应数据
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(apiResponse.fullResponse, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 