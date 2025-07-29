"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Server, CheckCircle, AlertCircle, RefreshCw, Trash2, Play, Square, Code, Database, Settings } from "lucide-react"
import { getMCPServers, startMCPServer, deleteMCPServer } from "@/lib/api"

interface TestResult {
  timestamp: string
  type: "success" | "error" | "info"
  message: string
  data?: any
}

export default function MCPServersTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [servers, setServers] = useState<any[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [rawResponseData, setRawResponseData] = useState<any>(null)

  const addTestResult = (type: TestResult["type"], message: string, data?: any) => {
    const result: TestResult = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    }
    setTestResults(prev => [result, ...prev.slice(0, 9)]) // 保留最近10条记录
  }

  const testGetMCPServers = async () => {
    setIsLoading(true)
    addTestResult("info", "开始获取 MCP 服务器列表...")
    
    try {
      const serversData = await getMCPServers()
      setServers(serversData)
      setRawResponseData(serversData)
      addTestResult("success", `成功获取 ${serversData.length} 个 MCP 服务器`, serversData)
      
      // 分析数据结构
      analyzeServerData(serversData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      addTestResult("error", `获取 MCP 服务器失败: ${errorMessage}`)
      console.error("getMCPServers error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeServerData = (data: any[]) => {
    if (data.length === 0) {
      addTestResult("info", "没有找到任何 MCP 服务器")
      return
    }

    // 分析第一个服务器的结构
    const firstServer = data[0]
    addTestResult("info", "数据结构分析:", {
      serverCount: data.length,
      firstServerKeys: Object.keys(firstServer),
      hasMetadata: !!firstServer.metadata,
      hasSpec: !!firstServer.spec,
      hasStatus: !!firstServer.status,
      hasTools: !!firstServer.tools,
      metadataKeys: firstServer.metadata ? Object.keys(firstServer.metadata) : [],
      specKeys: firstServer.spec ? Object.keys(firstServer.spec) : [],
      statusKeys: firstServer.status ? Object.keys(firstServer.status) : []
    })

    // 检查是否有工具信息
    const serversWithTools = data.filter(server => server.tools || server.spec?.tools)
    if (serversWithTools.length > 0) {
      addTestResult("success", `发现 ${serversWithTools.length} 个服务器包含工具信息`)
      serversWithTools.forEach((server, index) => {
        const tools = server.tools || server.spec?.tools || []
        addTestResult("info", `服务器 ${server.metadata?.name || index + 1} 的工具:`, {
          toolCount: tools.length,
          tools: tools
        })
      })
    } else {
      addTestResult("info", "未发现工具信息，可能需要额外的 API 调用来获取工具列表")
    }
  }

  const testStartMCPServer = async () => {
    setIsLoading(true)
    const serverName = `test-server-${Date.now()}`
    const image = "mcpso/github:latest"
    
    addTestResult("info", `开始启动 MCP 服务器: ${serverName}`)
    
    try {
      const result = await startMCPServer(serverName, image)
      addTestResult("success", `成功启动 MCP 服务器: ${serverName}`, result)
      
      // 启动成功后刷新服务器列表
      setTimeout(() => {
        testGetMCPServers()
      }, 1000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      addTestResult("error", `启动 MCP 服务器失败: ${errorMessage}`)
      console.error("startMCPServer error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testDeleteMCPServer = async (serverName: string) => {
    setIsLoading(true)
    addTestResult("info", `开始删除 MCP 服务器: ${serverName}`)
    
    try {
      await deleteMCPServer(serverName)
      addTestResult("success", `成功删除 MCP 服务器: ${serverName}`)
      
      // 删除成功后刷新服务器列表
      setTimeout(() => {
        testGetMCPServers()
      }, 1000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      addTestResult("error", `删除 MCP 服务器失败: ${errorMessage}`)
      console.error("deleteMCPServer error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
    setRawResponseData(null)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "running":
      case "active":
        return "bg-green-500"
      case "stopped":
      case "inactive":
        return "bg-gray-500"
      case "failed":
      case "error":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "running":
      case "active":
        return "运行中"
      case "stopped":
      case "inactive":
        return "已停止"
      case "failed":
      case "error":
        return "失败"
      default:
        return status || "未知"
    }
  }

  const renderField = (key: string, value: any, depth: number = 0) => {
    const indent = "  ".repeat(depth)
    
    if (value === null || value === undefined) {
      return <span className="text-gray-400">null</span>
    }
    
    if (typeof value === "object") {
      return (
        <div className="ml-4">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="mb-1">
              <span className="text-blue-600 font-mono">{indent}{k}:</span> {renderField(k, v, depth + 1)}
            </div>
          ))}
        </div>
      )
    }
    
    if (typeof value === "string") {
      return <span className="text-green-600">"{value}"</span>
    }
    
    if (typeof value === "number") {
      return <span className="text-purple-600">{value}</span>
    }
    
    if (typeof value === "boolean") {
      return <span className="text-orange-600">{value.toString()}</span>
    }
    
    return <span className="text-gray-600">{String(value)}</span>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">MCP 服务器测试页面</h1>
        <p className="text-muted-foreground">
          测试 MCP 服务器相关的 API 函数，展示所有返回字段
        </p>
      </div>

      {/* 测试控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle>测试控制面板</CardTitle>
          <CardDescription>
            测试 getMCPServers、startMCPServer 和 deleteMCPServer 函数
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={testGetMCPServers} 
              disabled={isLoading}
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  获取中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  获取服务器列表
                </>
              )}
            </Button>
            
            <Button 
              onClick={testStartMCPServer} 
              disabled={isLoading}
              variant="outline"
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  启动中...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  启动测试服务器
                </>
              )}
            </Button>
            
            <Button 
              onClick={clearResults} 
              variant="destructive"
              className="min-w-[100px]"
            >
              清空结果
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据展示区域 */}
      {rawResponseData && (
        <Card>
          <CardHeader>
            <CardTitle>完整数据展示</CardTitle>
            <CardDescription>
              从后端获取的所有字段和数据结构
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="formatted" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="formatted">格式化视图</TabsTrigger>
                <TabsTrigger value="raw">原始 JSON</TabsTrigger>
                <TabsTrigger value="analysis">数据分析</TabsTrigger>
              </TabsList>
              
              <TabsContent value="formatted" className="space-y-4">
                <div className="space-y-4">
                  {Array.isArray(rawResponseData) ? (
                    rawResponseData.map((server, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          服务器 {index + 1}
                          {server.metadata?.name && (
                            <Badge variant="outline">{server.metadata.name}</Badge>
                          )}
                        </h3>
                        
                        <div className="space-y-3">
                          {/* Metadata */}
                          {server.metadata && (
                            <div>
                              <h4 className="text-sm font-medium text-blue-600 mb-2 flex items-center gap-1">
                                <Database className="h-3 w-3" />
                                Metadata
                              </h4>
                              <div className="bg-blue-50 p-3 rounded text-sm font-mono">
                                {renderField("metadata", server.metadata)}
                              </div>
                            </div>
                          )}
                          
                          {/* Spec */}
                          {server.spec && (
                            <div>
                              <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-1">
                                <Settings className="h-3 w-3" />
                                Spec
                              </h4>
                              <div className="bg-green-50 p-3 rounded text-sm font-mono">
                                {renderField("spec", server.spec)}
                              </div>
                            </div>
                          )}
                          
                          {/* Status */}
                          {server.status && (
                            <div>
                              <h4 className="text-sm font-medium text-purple-600 mb-2 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Status
                              </h4>
                              <div className="bg-purple-50 p-3 rounded text-sm font-mono">
                                {renderField("status", server.status)}
                              </div>
                            </div>
                          )}
                          
                          {/* Tools */}
                          {(server.tools || server.spec?.tools) && (
                            <div>
                              <h4 className="text-sm font-medium text-orange-600 mb-2 flex items-center gap-1">
                                <Code className="h-3 w-3" />
                                Tools ({server.tools?.length || server.spec?.tools?.length || 0})
                              </h4>
                              <div className="bg-orange-50 p-3 rounded text-sm font-mono">
                                {renderField("tools", server.tools || server.spec?.tools)}
                              </div>
                            </div>
                          )}
                          
                          {/* 其他字段 */}
                          {Object.entries(server).filter(([key]) => !['metadata', 'spec', 'status', 'tools'].includes(key)).map(([key, value]) => (
                            <div key={key}>
                              <h4 className="text-sm font-medium text-gray-600 mb-2">
                                {key}
                              </h4>
                              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                                {renderField(key, value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                      {renderField("response", rawResponseData)}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="raw">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="text-xs">
                    {JSON.stringify(rawResponseData, null, 2)}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="analysis">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">数据概览</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">数据类型:</span>
                            <span className="ml-2">{Array.isArray(rawResponseData) ? '数组' : '对象'}</span>
                          </div>
                          <div>
                            <span className="font-medium">服务器数量:</span>
                            <span className="ml-2">{Array.isArray(rawResponseData) ? rawResponseData.length : 1}</span>
                          </div>
                          <div>
                            <span className="font-medium">包含工具:</span>
                            <span className="ml-2">
                              {Array.isArray(rawResponseData) 
                                ? rawResponseData.some(s => s.tools || s.spec?.tools) ? '是' : '否'
                                : (rawResponseData.tools || rawResponseData.spec?.tools) ? '是' : '否'
                              }
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">字段统计</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {Array.isArray(rawResponseData) && rawResponseData.length > 0 && (
                            Object.keys(rawResponseData[0]).map(key => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span>
                                <span className="ml-2">{typeof rawResponseData[0][key]}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">工具信息</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {Array.isArray(rawResponseData) ? (
                            rawResponseData.map((server, index) => {
                              const tools = server.tools || server.spec?.tools || []
                              return (
                                <div key={index}>
                                  <span className="font-medium">服务器 {index + 1}:</span>
                                  <span className="ml-2">{tools.length} 个工具</span>
                                </div>
                              )
                            })
                          ) : (
                            <div>
                              <span className="font-medium">工具数量:</span>
                              <span className="ml-2">
                                {(rawResponseData.tools || rawResponseData.spec?.tools || []).length}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* 服务器列表 */}
      {servers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>MCP 服务器列表</CardTitle>
              <Badge variant="outline">{servers.length} 个服务器</Badge>
            </div>
            <CardDescription>
              当前系统中的 MCP 服务器
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {servers.map((server, index) => (
                <div key={server.metadata?.uid || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-blue-500" />
                      <h3 className="font-semibold">{server.metadata?.name || server.name || `Server ${index + 1}`}</h3>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(server.status?.phase || server.status)}`}></div>
                      <span className="text-sm text-gray-600">
                        {getStatusText(server.status?.phase || server.status)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {server.metadata?.name && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => testDeleteMCPServer(server.metadata.name)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          删除
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">镜像:</span>
                      <span className="ml-2 text-gray-600">{server.spec?.image || server.image || "N/A"}</span>
                    </div>
                    <div>
                      <span className="font-medium">端口:</span>
                      <span className="ml-2 text-gray-600">{server.spec?.port || "N/A"}</span>
                    </div>
                    <div>
                      <span className="font-medium">URL:</span>
                      <span className="ml-2 text-gray-600">{server.status?.url || "N/A"}</span>
                    </div>
                    <div>
                      <span className="font-medium">创建时间:</span>
                      <span className="ml-2 text-gray-600">
                        {server.metadata?.creationTimestamp ? 
                          new Date(server.metadata.creationTimestamp).toLocaleString() : 
                          "N/A"
                        }
                      </span>
                    </div>
                  </div>
                  
                  {server.status?.message && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <span className="font-medium">状态消息:</span>
                      <span className="ml-2 text-gray-600">{server.status.message}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 测试结果 */}
      <Card>
        <CardHeader>
          <CardTitle>测试结果</CardTitle>
          <CardDescription>
            最近的测试操作结果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无测试结果</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-2 p-2 border rounded">
                  <div className="flex-shrink-0 mt-0.5">
                    {result.type === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {result.type === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {result.type === "info" && <Loader2 className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{result.message}</div>
                    <div className="text-xs text-gray-500">{result.timestamp}</div>
                    {result.data && (
                      <details className="mt-1">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                          查看详细数据
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 调试信息 */}
      <Card>
        <CardHeader>
          <CardTitle>调试信息</CardTitle>
          <CardDescription>
            当前环境配置和状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">API 基础 URL:</span>
              <span className="ml-2 text-gray-600">
                {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8443'}
              </span>
            </div>
            <div>
              <span className="font-medium">当前时间:</span>
              <span className="ml-2 text-gray-600">
                {new Date().toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium">页面加载时间:</span>
              <span className="ml-2 text-gray-600">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 