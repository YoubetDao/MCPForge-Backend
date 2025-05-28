"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Loader2, Server, Plus, Edit, ExternalLink, Wallet } from "lucide-react"
import Link from "next/link"
import { useConnectModal } from "@rainbow-me/rainbowkit"

export default function ProfilePage() {
  const { isConnected, address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [isLoading, setIsLoading] = useState(true)

  // 模拟加载状态
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
  const getInitials = (address: string) => {
    return address.substring(2, 4).toUpperCase()
  }

  // 模拟用户的MCP服务器数据
  const mockServers = []

  // 格式化地址显示
  const displayName = address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "Guest User"
  const displayEmail = address || "Not connected"

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
                  <AvatarImage src={`/api/avatar?address=${address}`} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-pink-500 text-black font-bold">
                    {address ? getInitials(address) : <Wallet className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl font-cyberpunk text-gray-800 dark:text-gray-100">
                  {displayName}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 font-mono">
                  {displayEmail}
                </CardDescription>

                {!isConnected && (
                  <div className="mt-4 w-full">
                    <Button
                      className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
                      onClick={() => openConnectModal?.()}
                    >
                      Connect Wallet to Access Profile
                    </Button>
                  </div>
                )}
              </CardHeader>

              {isConnected && (
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
                      <p>Wallet: {address}</p>
                      <p>Status: Connected</p>
                      <p>Type: Web3 User</p>
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
                  {isConnected && (
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
                {!isConnected ? (
                  <div className="text-center py-10">
                    <Server className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Connect your wallet to view and manage your MCP servers.
                    </p>
                    <Button
                      className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
                      onClick={() => openConnectModal?.()}
                    >
                      Connect Wallet
                    </Button>
                  </div>
                ) : mockServers.length > 0 ? (
                  <div className="space-y-4">
                    {mockServers.map((server: any, index: number) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-cyan-900/30 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{server.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{server.description}</p>
                            <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500 dark:text-gray-500">
                              <span>⭐ {server.stars} stars</span>
                              <span>📥 {server.downloads} downloads</span>
                              <span>🔄 Updated {server.lastUpdated}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={server.url} target="_blank">
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Server className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You haven't submitted any MCP servers yet.
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
      </div>
    </div>
  )
}
