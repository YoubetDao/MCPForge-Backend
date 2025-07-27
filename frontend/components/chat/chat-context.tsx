"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { MCPTool } from "@/types/chat"

interface ChatContextType {
  // 工具选择状态
  selectedTool: string | null
  setSelectedTool: (toolName: string | null) => void
  
  // 工具选择器显示状态
  showToolSelector: boolean
  setShowToolSelector: (show: boolean) => void
  
  // 从侧边栏选择工具
  selectToolFromSidebar: (tool: MCPTool) => void
  
  // 清除工具选择
  clearToolSelection: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [showToolSelector, setShowToolSelector] = useState(false)

  const selectToolFromSidebar = (tool: MCPTool) => {
    setSelectedTool(tool.name)
    setShowToolSelector(true)
  }

  const clearToolSelection = () => {
    setSelectedTool(null)
    setShowToolSelector(false)
  }

  return (
    <ChatContext.Provider value={{
      selectedTool,
      setSelectedTool,
      showToolSelector,
      setShowToolSelector,
      selectToolFromSidebar,
      clearToolSelection
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
} 