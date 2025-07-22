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
    <div className="binance-card p-8 text-center">
      <h3 className="text-2xl font-bold text-binance-black dark:text-white mb-4">{dict.subscribe}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">{dict.subscribeText}</p>

      {isSuccess ? (
        <div className="text-binance-green font-medium text-lg">{dict.thankYou}</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder={dict.yourEmail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="binance-input flex-1"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="binance-button-primary px-8 py-3 font-medium"
          >
            {isSubmitting ? dict.sending : dict.subscribe_button}
          </Button>
        </form>
      )}
    </div>
  )
}
