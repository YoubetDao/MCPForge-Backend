"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import ChatSidebar from "@/components/chat/chat-sidebar"
import MessageList from "@/components/chat/message-list"
import ChatInput from "@/components/chat/chat-input"
import { ChatProvider } from "@/components/chat/chat-context"
import { Message, ToolCall, ToolResult } from "@/types/chat"
import { ChatAPI } from "@/lib/api/chat"

// 可用的工具定义
const availableTools = [
  {
    name: "read_file",
    description: "Read contents of a file",
    inputSchema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to read"
        }
      },
      required: ["file_path"]
    }
  },
  {
    name: "write_file", 
    description: "Write content to a file",
    inputSchema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to write"
        },
        content: {
          type: "string", 
          description: "Content to write to the file"
        }
      },
      required: ["file_path", "content"]
    }
  },
  {
    name: "search_web",
    description: "Search the web for information",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_weather",
    description: "Get weather information for a location",
    inputSchema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City or location name"
        }
      },
      required: ["location"]
    }
  },
  {
    name: "list_directory",
    description: "List files in a directory",
    inputSchema: {
      type: "object",
      properties: {
        directory_path: {
          type: "string",
          description: "Path to the directory to list"
        }
      },
      required: ["directory_path"]
    }
  }
]

function ChatPageContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to MCPForge Chat! I'm your AI assistant powered by OpenAI. You can ask me questions or use MCP tools to enhance your experience. What would you like to do today?",
      timestamp: new Date(),
    }
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string, selectedTools?: string[]) => {
    if (!content.trim() && !selectedTools?.length) return

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // 准备发送给OpenAI的消息
      const messagesToSend = [...messages, userMessage]
      
      // 准备工具定义
      const toolsToSend = selectedTools?.length 
        ? availableTools.filter(tool => selectedTools.includes(tool.name))
        : availableTools // 如果没有选择特定工具，发送所有可用工具

      // 调用OpenAI API
      const response = await ChatAPI.sendMessageWithTools(messagesToSend, toolsToSend)
      
      // 创建AI回复消息
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        toolResults: response.toolResults,
      }
      
      setMessages(prev => [...prev, aiMessage])
      
    } catch (error) {
      console.error("Error sending message:", error)
      
      // 添加错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your OpenAI API key configuration.`,
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-300">
      {/* Cyber lines background */}
      <div className="fixed inset-0 z-0 opacity-20 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/cyber-grid.svg')] bg-repeat"></div>
      </div>

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-cyan-900/50 bg-white dark:bg-black">
          <ChatSidebar />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-gray-200 dark:border-cyan-900/50 bg-white dark:bg-black flex items-center px-6">
            <h1 className="text-xl font-bold font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-pink-600 dark:from-cyan-400 dark:to-pink-500">
              MCPForge Chat
            </h1>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden">
            <MessageList messages={messages} isLoading={isLoading} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-cyan-900/50 bg-white dark:bg-black p-4">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  )
} 