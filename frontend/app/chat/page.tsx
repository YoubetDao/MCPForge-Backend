"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import ChatSidebar from "@/components/chat/chat-sidebar"
import MessageList from "@/components/chat/message-list"
import ChatInput from "@/components/chat/chat-input"
import { ChatProvider } from "@/components/chat/chat-context"
import { Message, ToolCall, ToolResult } from "@/types/chat"

function ChatPageContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to MCPForge Chat! I'm your AI assistant. You can ask me questions or use MCP tools to enhance your experience. What would you like to do today?",
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
      // 模拟AI回复，包含工具调用
      setTimeout(() => {
        let aiContent = `I received your message: "${content}". `
        
        const toolCalls: ToolCall[] = []
        const toolResults: ToolResult[] = []
        
        // 如果有工具调用，模拟工具执行
        if (selectedTools && selectedTools.length > 0) {
          aiContent += `I'll help you with the requested tools. `
          
          selectedTools.forEach((toolName, index) => {
            const toolCallId = `tool_${Date.now()}_${index}`
            
            // 创建工具调用
            toolCalls.push({
              id: toolCallId,
              name: toolName,
              arguments: { query: "sample parameter" }
            })
            
            // 模拟工具执行结果
            let resultContent = ""
            switch (toolName) {
              case "read_file":
                resultContent = "File content: This is a sample file content that was read successfully."
                break
              case "write_file":
                resultContent = "File written successfully to the specified path."
                break
              case "search_web":
                resultContent = "Search results: Found 5 relevant results for your query."
                break
              case "get_weather":
                resultContent = "Weather data: Sunny, 25°C, Humidity: 60%"
                break
              default:
                resultContent = `Tool ${toolName} executed successfully.`
            }
            
            toolResults.push({
              toolCallId,
              content: resultContent
            })
          })
          
          aiContent += `I've executed the requested tools and here are the results:`
        } else {
          aiContent += `This is a placeholder response. MCP tool integration is working! You can try selecting tools from the wrench icon above the input box or from the sidebar.`
        }
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiContent,
          timestamp: new Date(),
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          toolResults: toolResults.length > 0 ? toolResults : undefined,
        }
        
        setMessages(prev => [...prev, aiMessage])
        setIsLoading(false)
      }, 1500) // 稍微增加延迟以模拟工具执行时间
    } catch (error) {
      console.error("Error sending message:", error)
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