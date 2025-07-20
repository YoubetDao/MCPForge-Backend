"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Loader2, Server, Plus, Edit, ExternalLink, Trash2 } from "lucide-react"
import Link from "next/link"

export default function MyServersPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [servers, setServers] = useState<any[]>([])

  // 在组件挂载时检查localStorage中的用户信息
  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error reading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // 初始检查
    checkUser()

    // 监听认证状态变化
    const handleAuthChange = () => {
      checkUser()
    }

    window.addEventListener("auth-change", handleAuthChange)

    return () => {
      window.removeEventListener("auth-change", handleAuthChange)
    }
  }, [])

  // 模拟获取用户的服务器数据
  useEffect(() => {
    if (user) {
      // 这里应该调用后端 API 获取用户的服务器列表
      // 暂时使用模拟数据
      const mockServers = [
        {
          id: 1,
          name: "Wiki MCP Server",
          description: "A powerful MCP server for Wikipedia integration",
          status: "running",
          created_at: "2024-01-15",
          updated_at: "2024-01-20"
        },
        {
          id: 2,
          name: "File System MCP",
          description: "MCP server for file system operations",
          status: "stopped",
          created_at: "2024-01-10",
          updated_at: "2024-01-18"
        }
      ]
      setServers(mockServers)
    }
  }, [user])

  const isAuthenticated = !!user

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your servers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-300">
      {/* Cyber lines background */}
      <div className="fixed inset-0 z-0 opacity-20 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/cyber-grid.svg')] bg-repeat"></div>
      </div>

      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-pink-600 dark:from-cyan-400 dark:to-pink-500">
            MY MCP SERVERS
          </h1>
          {isAuthenticated && (
            <Button
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
              asChild
            >
              <Link href="/submit">
                <Plus className="mr-2 h-4 w-4" />
                Create New Server
              </Link>
            </Button>
          )}
        </div>

        {!isAuthenticated ? (
          <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

            <CardContent className="text-center py-10">
              <Server className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sign in to view and manage your MCP servers.
              </p>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
                asChild
              >
                <Link href="/">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        ) : servers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server) => (
              <Card key={server.id} className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden hover:border-cyan-500/50 transition-colors">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-cyberpunk text-gray-800 dark:text-gray-100">
                        {server.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                        {server.description}
                      </CardDescription>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-mono ${
                      server.status === 'running' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {server.status.toUpperCase()}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 font-mono">
                    <p>Created: {server.created_at}</p>
                    <p>Updated: {server.updated_at}</p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-cyan-900/30" />

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-300 dark:border-cyan-900/50 text-gray-700 dark:text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/50"
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-300 dark:border-cyan-900/50 text-gray-700 dark:text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/50"
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

            <CardContent className="text-center py-10">
              <Server className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't created any MCP servers yet.</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start building and deploying your MCP servers to enhance your AI experience.
              </p>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
                asChild
              >
                <Link href="/submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Server
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 