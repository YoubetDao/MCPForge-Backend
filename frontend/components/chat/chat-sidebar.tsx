"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Server, 
  Plus, 
  Wrench, 
  HelpCircle, 
  Zap,
  Circle,
  ExternalLink,
  ChevronRight
} from "lucide-react"
import { MCPServer, MCPTool } from "@/types/chat"
import { useChatContext } from "./chat-context"

export default function ChatSidebar() {
  const [activeTab, setActiveTab] = useState<"tools" | "settings" | "help">("tools")
  const { selectToolFromSidebar } = useChatContext()
  
  // 模拟MCP服务器数据
  const [mcpServers] = useState<MCPServer[]>([
    {
      id: "1",
      name: "File System MCP",
      description: "Access and manipulate files on your system",
      status: "connected",
      tools: [
        { name: "read_file", description: "Read contents of a file" },
        { name: "write_file", description: "Write content to a file" },
        { name: "list_directory", description: "List files in a directory" }
      ]
    },
    {
      id: "2", 
      name: "Web Search MCP",
      description: "Search the web for information",
      status: "disconnected",
      tools: [
        { name: "search_web", description: "Search the web for a query" },
        { name: "get_weather", description: "Get weather information" }
      ]
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500"
      case "disconnected":
        return "bg-gray-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleToolClick = (tool: MCPTool) => {
    selectToolFromSidebar(tool)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-cyan-900/50">
        <h2 className="text-lg font-bold font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-pink-600 dark:from-cyan-400 dark:to-pink-500">
          MCP Tools
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-cyan-900/50">
        <Button
          variant={activeTab === "tools" ? "default" : "ghost"}
          onClick={() => setActiveTab("tools")}
          className={`flex-1 rounded-none ${
            activeTab === "tools" 
              ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-black" 
              : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-900"
          }`}
        >
          <Wrench className="h-4 w-4 mr-2" />
          Tools
        </Button>
        <Button
          variant={activeTab === "settings" ? "default" : "ghost"}
          onClick={() => setActiveTab("settings")}
          className={`flex-1 rounded-none ${
            activeTab === "settings" 
              ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-black" 
              : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-900"
          }`}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button
          variant={activeTab === "help" ? "default" : "ghost"}
          onClick={() => setActiveTab("help")}
          className={`flex-1 rounded-none ${
            activeTab === "help" 
              ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-black" 
              : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-900"
          }`}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "tools" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">MCP Servers</h3>
              <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-600 hover:bg-cyan-50">
                <Plus className="h-3 w-3 mr-1" />
                Add Server
              </Button>
            </div>

            <div className="space-y-3">
              {mcpServers.map((server) => (
                <Card key={server.id} className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-cyberpunk text-gray-800 dark:text-gray-200">
                        {server.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Circle className={`h-2 w-2 ${getStatusColor(server.status)} rounded-full`} />
                        <Badge variant="outline" className="text-xs border-cyan-500 text-cyan-600">
                          {server.tools.length} tools
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {server.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {server.tools.map((tool) => (
                        <div
                          key={tool.name}
                          onClick={() => handleToolClick(tool)}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer transition-colors group"
                        >
                          <div className="flex-1">
                            <div className="text-xs font-mono text-gray-800 dark:text-gray-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                              {tool.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {tool.description}
                            </div>
                          </div>
                          <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Chat Settings</h3>
            
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto-scroll</span>
                    <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                      <div className="w-4 h-4 bg-cyan-500 rounded-full absolute top-1 left-1"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show timestamps</span>
                    <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                      <div className="w-4 h-4 bg-cyan-500 rounded-full absolute top-1 left-1"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Dark mode</span>
                    <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                      <div className="w-4 h-4 bg-cyan-500 rounded-full absolute top-1 right-1"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "help" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Help & Tips</h3>
            
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
              
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-cyan-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">Quick Commands</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Use <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Shift+Enter</kbd> for new line
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-200 dark:bg-cyan-900/30" />
                  
                  <div className="flex items-start gap-2">
                    <Server className="h-4 w-4 text-cyan-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">MCP Tools</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Click on any tool in the sidebar to automatically select it in the input area
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-200 dark:bg-cyan-900/30" />
                  
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-cyan-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">Learn More</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Visit our documentation for advanced features
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 