"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Loader2, Server, Plus, Edit, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [mockUser, setMockUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 在组件挂载时检查localStorage中的模拟用户
  useEffect(() => {
    const checkMockUser = () => {
      try {
        const storedUser = localStorage.getItem("mockUser")
        if (storedUser) {
          setMockUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error reading mock user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // 初始检查
    checkMockUser()

    // 监听模拟登录状态变化
    const handleAuthChange = () => {
      checkMockUser()
    }

    window.addEventListener("mock-auth-change", handleAuthChange)

    return () => {
      window.removeEventListener("mock-auth-change", handleAuthChange)
    }
  }, [])

  // 优先使用模拟用户，如果没有则使用session
  const user = mockUser || session?.user
  const isAuthenticated = status === "authenticated" || !!mockUser

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  // 获取用户头像的初始字母（用于头像回退）
  const getInitials = (name = "User") => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // 模拟用户的MCP服务器数据
  const mockServers = []

  // 创建默认用户数据，当用户未登录时使用
  const defaultUser = {
    name: "Guest User",
    email: "Not signed in",
    image: "",
  }

  // 使用实际用户数据或默认数据
  const displayUser = user || defaultUser

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-300">
      {/* Cyber lines background */}
      <div className="fixed inset-0 z-0 opacity-20 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/cyber-grid.svg')] bg-repeat"></div>
      </div>

      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-pink-600 dark:from-cyan-400 dark:to-pink-500">
          YOUR PROFILE
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="md:col-span-1">
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

              <CardHeader className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4 border-2 border-cyan-500/50">
                  <AvatarImage src={displayUser?.image || ""} alt={displayUser?.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-pink-500 text-black font-bold">
                    {displayUser?.name ? getInitials(displayUser.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl font-cyberpunk text-gray-800 dark:text-gray-100">
                  {displayUser?.name}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 font-mono">
                  {displayUser?.email}
                </CardDescription>

                {!isAuthenticated && (
                  <div className="mt-4 w-full">
                    <Button
                      className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
                      asChild
                    >
                      <Link href="/auth/signin?callbackUrl=/profile">Sign In to Access Your Profile</Link>
                    </Button>
                  </div>
                )}
              </CardHeader>

              {isAuthenticated && (
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 dark:border-cyan-900/50 text-gray-700 dark:text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/50"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>

                  <Separator className="bg-gray-200 dark:bg-cyan-900/30" />

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Account Info</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 font-mono">
                      <p>Member since: May 2023</p>
                      <p>Status: Active</p>
                      <p>Role: User</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* User's MCP Servers */}
          <div className="md:col-span-2">
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 h-full overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-cyberpunk text-gray-800 dark:text-gray-100">
                      YOUR MCP SERVERS
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Servers you've submitted to MCP forge
                    </CardDescription>
                  </div>
                  {isAuthenticated && (
                    <Button
                      className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
                      asChild
                    >
                      <Link href="/submit">
                        <Plus className="mr-2 h-4 w-4" />
                        Submit Server
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {!isAuthenticated ? (
                  <div className="text-center py-10">
                    <Server className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Sign in to view and manage your MCP servers.
                    </p>
                    <Button
                      className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
                      asChild
                    >
                      <Link href="/auth/signin?callbackUrl=/profile">Sign In</Link>
                    </Button>
                  </div>
                ) : mockServers.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {mockServers.map((server, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 dark:border-cyan-900/50 rounded-md bg-gray-50 dark:bg-black/60 hover:border-cyan-500/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200">{server.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{server.description}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-cyan-600 dark:text-cyan-400">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Server className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't submitted any MCP servers yet.</p>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Share your MCP server with the community to get more visibility and users.
                    </p>
                    <Button
                      className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
                      asChild
                    >
                      <Link href="/submit">
                        <Plus className="mr-2 h-4 w-4" />
                        Submit Your First Server
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity Section - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="mt-6">
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

              <CardHeader>
                <CardTitle className="text-xl font-cyberpunk text-gray-800 dark:text-gray-100">
                  RECENT ACTIVITY
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Your recent interactions on MCP forge
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No recent activity to display.</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Start exploring MCP servers to see your activity here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
