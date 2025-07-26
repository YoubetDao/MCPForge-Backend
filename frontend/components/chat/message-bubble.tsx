"use client"

import { Message } from "@/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { Bot, User } from "lucide-react"

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-pink-500">
          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-pink-500 text-black font-bold">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isUser ? "order-first" : ""}`}>
        <Card className={`overflow-hidden ${
          isUser 
            ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-black border-0" 
            : "bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50"
        }`}>
          <div className={`absolute top-0 left-0 w-full h-0.5 ${
            isUser 
              ? "bg-gradient-to-r from-transparent via-white to-transparent" 
              : "bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
          }`}></div>
          <div className={`absolute bottom-0 left-0 w-full h-0.5 ${
            isUser 
              ? "bg-gradient-to-r from-transparent via-white to-transparent" 
              : "bg-gradient-to-r from-transparent via-pink-500 to-transparent"
          }`}></div>
          
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="text-sm">
                {message.content}
              </div>
              
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.toolCalls.map((toolCall) => (
                    <div key={toolCall.id} className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <div className="font-mono text-cyan-600 dark:text-cyan-400">
                        Tool: {toolCall.name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {JSON.stringify(toolCall.arguments, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {message.toolResults && message.toolResults.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.toolResults.map((result) => (
                    <div key={result.toolCallId} className="text-xs bg-green-100 dark:bg-green-900/20 p-2 rounded">
                      <div className="font-mono text-green-600 dark:text-green-400">
                        Result: {result.content}
                      </div>
                      {result.error && (
                        <div className="text-red-600 dark:text-red-400">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
          isUser ? "text-right" : "text-left"
        }`}>
          {format(message.timestamp, "HH:mm")}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 bg-gradient-to-br from-gray-400 to-gray-600">
          <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white font-bold">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
} 