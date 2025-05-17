"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NewsletterSignupProps {
  dict: {
    subscribe: string
    subscribeText: string
    yourEmail: string
    subscribe_button: string
    sending: string
    thankYou: string
  }
}

export default function NewsletterSignup({ dict }: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSuccess(true)
    setEmail("")
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black border border-gray-200 dark:border-cyan-900/50 p-6 rounded-none relative overflow-hidden cyber-box group hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-100 group-hover:animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-100 group-hover:animate-pulse"></div>
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
      <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 font-cyberpunk mb-4">{dict.subscribe}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{dict.subscribeText}</p>

      {isSuccess ? (
        <div className="text-cyan-600 dark:text-cyan-400 font-mono">{dict.thankYou}</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder={dict.yourEmail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/90 dark:bg-black/60 border border-gray-300 dark:border-cyan-800 rounded-none focus:outline-none focus:border-pink-500 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 font-mono"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-cyan-500 to-pink-500 dark:from-cyan-500 dark:to-pink-500 hover:from-cyan-400 hover:to-pink-400 dark:hover:from-cyan-400 dark:hover:to-pink-400 text-black dark:text-black font-cyberpunk border-0 cyber-button"
          >
            {isSubmitting ? dict.sending : dict.subscribe_button}
          </Button>
        </form>
      )}
    </div>
  )
}
