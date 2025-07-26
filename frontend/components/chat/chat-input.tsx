"use client"

import { useState, KeyboardEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Loader2, Wrench, X, ChevronDown } from "lucide-react"
import { MCPTool } from "@/types/chat"
import { useChatContext } from "./chat-context"

interface ChatInputProps {
  onSendMessage: (content: string, selectedTools?: string[]) => void
  isLoading: boolean
}

// 模拟可用的MCP工具
const availableTools: MCPTool[] = [
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

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [toolParams, setToolParams] = useState<Record<string, string>>({})
  
  const { 
    selectedTool, 
    setSelectedTool, 
    showToolSelector, 
    setShowToolSelector,
    clearToolSelection 
  } = useChatContext()

  const handleSend = () => {
    if (!input.trim() && !selectedTool) return
    
    let messageContent = input.trim()
    let tools: string[] = []
    
    // 如果有选择工具，添加到消息中
    if (selectedTool) {
      const tool = availableTools.find(t => t.name === selectedTool)
      if (tool) {
        const toolCall = {
          name: tool.name,
          description: tool.description,
          parameters: toolParams
        }
        messageContent += `\n\n[Tool Call: ${tool.name}]\nParameters: ${JSON.stringify(toolParams, null, 2)}`
        tools.push(selectedTool)
      }
    }
    
    onSendMessage(messageContent, tools)
    setInput("")
    clearToolSelection()
    setToolParams({})
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName)
    const tool = availableTools.find(t => t.name === toolName)
    if (tool && tool.inputSchema?.properties) {
      const initialParams: Record<string, string> = {}
      Object.keys(tool.inputSchema.properties).forEach(key => {
        initialParams[key] = ""
      })
      setToolParams(initialParams)
    }
  }

  const updateToolParam = (key: string, value: string) => {
    setToolParams(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const getSelectedTool = () => availableTools.find(t => t.name === selectedTool)

  // 当从侧边栏选择工具时，自动显示工具选择器
  useEffect(() => {
    if (selectedTool && !showToolSelector) {
      setShowToolSelector(true)
      // 初始化工具参数
      const tool = availableTools.find(t => t.name === selectedTool)
      if (tool && tool.inputSchema?.properties) {
        const initialParams: Record<string, string> = {}
        Object.keys(tool.inputSchema.properties).forEach(key => {
          initialParams[key] = ""
        })
        setToolParams(initialParams)
      }
    }
  }, [selectedTool, showToolSelector])

  return (
    <div className="space-y-3">
      {/* Tool Selector */}
      {showToolSelector && (
        <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
          
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-cyberpunk text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Select MCP Tool
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowToolSelector(false)
                  clearToolSelection()
                }}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-gray-600 dark:text-gray-400">Choose Tool</Label>
              <Select value={selectedTool || ""} onValueChange={handleToolSelect}>
                <SelectTrigger className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50">
                  <SelectValue placeholder="Select a tool..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTools.map((tool) => (
                    <SelectItem key={tool.name} value={tool.name}>
                      <div className="flex flex-col">
                        <span className="font-medium">{tool.name}</span>
                        <span className="text-xs text-gray-500">{tool.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTool && getSelectedTool() && (
              <div className="space-y-3">
                <Label className="text-xs text-gray-600 dark:text-gray-400">Tool Parameters</Label>
                {Object.entries(getSelectedTool()!.inputSchema?.properties || {}).map(([key, schema]) => {
                  const schemaObj = schema as any
                  return (
                    <div key={key}>
                      <Label className="text-xs text-gray-600 dark:text-gray-400">
                        {key} {schemaObj.required && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        value={toolParams[key] || ""}
                        onChange={(e) => updateToolParam(key, e.target.value)}
                        placeholder={schemaObj.description || key}
                        className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
            className="min-h-[60px] max-h-[120px] resize-none bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 focus:border-cyan-500 dark:focus:border-cyan-400 font-mono text-sm"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => setShowToolSelector(!showToolSelector)}
            variant="outline"
            className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 h-[30px] px-3"
          >
            <Wrench className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedTool) || isLoading}
            className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0 h-[30px] px-3"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Selected Tool Indicator */}
      {selectedTool && (
        <div className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400">
          <Wrench className="h-3 w-3" />
          <span>Tool selected: {selectedTool}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearToolSelection}
            className="h-4 w-4 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
} 