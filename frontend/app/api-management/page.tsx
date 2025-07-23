"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Eye, EyeOff, RefreshCw, Key, Shield, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ApiManagementPage() {
  const [user, setUser] = useState<any>(null)
  const [bearerToken, setBearerToken] = useState<string>("")
  const [isTokenVisible, setIsTokenVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // 检查用户登录状态
  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          // 如果没有登录，重定向到首页
          router.push("/")
        }
      } catch (error) {
        console.error("Error reading user data:", error)
        router.push("/")
      }
    }

    checkUser()
  }, [router])

  // 获取Bearer Token
  const fetchBearerToken = async () => {
    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8443"
      const response = await fetch(`${apiUrl}/auth/bearer-token`, {
        method: "GET",
        credentials: "include", // 包含Cookie
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBearerToken(data.bearer_token)
        toast.success("Bearer Token获取成功")
      } else {
        const errorData = await response.json()
        toast.error(`获取失败: ${errorData.message || "未知错误"}`)
      }
    } catch (error) {
      console.error("Error fetching bearer token:", error)
      toast.error("网络错误，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  // 复制Token到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("已复制到剪贴板")
    } catch (error) {
      console.error("Failed to copy:", error)
      toast.error("复制失败")
    }
  }

  // 切换Token可见性
  const toggleTokenVisibility = () => {
    setIsTokenVisible(!isTokenVisible)
  }

  // 格式化Token显示
  const formatToken = (token: string) => {
    if (!token) return ""
    if (isTokenVisible) return token
    return token.substring(0, 20) + "..." + token.substring(token.length - 20)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              API Management
            </h1>
            <p className="text-gray-400 mt-2">
              管理您的API访问令牌，用于程序化访问MCPForge API
            </p>
          </div>

          {/* 用户信息卡片 */}
          <Card className="bg-gray-900 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-400">
                <Shield className="h-5 w-5" />
                当前用户
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-400">用户名</Label>
                  <p className="text-gray-100 font-mono">{user.username || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-gray-400">邮箱</Label>
                  <p className="text-gray-100 font-mono">{user.email || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-gray-400">角色</Label>
                  <p className="text-cyan-400 font-mono">{user.role || "user"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bearer Token卡片 */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-400">
                <Key className="h-5 w-5" />
                Bearer Token
              </CardTitle>
              <CardDescription className="text-gray-400">
                使用此令牌在API请求的Authorization头中进行身份验证
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 获取Token按钮 */}
              {!bearerToken && (
                <Button
                  onClick={fetchBearerToken}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      获取中...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      获取Bearer Token
                    </>
                  )}
                </Button>
              )}

              {/* Token显示区域 */}
              {bearerToken && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400">Your Bearer Token</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={formatToken(bearerToken)}
                        readOnly
                        className="bg-gray-800 border-gray-600 text-gray-100 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleTokenVisibility}
                        className="border-gray-600 hover:bg-gray-700"
                      >
                        {isTokenVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(bearerToken)}
                        className="border-gray-600 hover:bg-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 刷新Token */}
                  <Button
                    variant="outline"
                    onClick={fetchBearerToken}
                    disabled={isLoading}
                    className="border-gray-600 hover:bg-gray-700"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        刷新中...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        刷新Token
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* 使用说明 */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="text-yellow-400 font-medium">使用说明</h4>
                    <div className="text-gray-300 text-sm space-y-1">
                      <p>在API请求中添加以下头部：</p>
                      <code className="block bg-gray-900 p-2 rounded text-cyan-400 font-mono">
                        Authorization: Bearer {bearerToken ? "YOUR_TOKEN_HERE" : "<your-token>"}
                      </code>
                      <p className="text-gray-400">
                        • Token有效期为7天<br />
                        • 请妥善保管您的Token<br />
                        • 如有泄露，请立即刷新Token
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
