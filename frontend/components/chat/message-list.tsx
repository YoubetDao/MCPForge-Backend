"use client"

import { useEffect, useRef } from "react"
import { Message } from "@/types/chat"
import MessageBubble from "./message-bubble"
import { Loader2 } from "lucide-react"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {isLoading && (
        <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-mono">AI is thinking...</span>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
} 