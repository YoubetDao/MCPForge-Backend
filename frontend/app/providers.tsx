"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { useEffect, useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [initialTheme, setInitialTheme] = useState<string | undefined>("dark")

  // 在客户端首次渲染时，检查是否有保存的主题
  useEffect(() => {
    // 从 sessionStorage 中获取保存的主题
    const savedTheme = sessionStorage.getItem("preferred-theme")
    if (savedTheme) {
      setInitialTheme(savedTheme)
    }
    setMounted(true)
  }, [])

  // 避免服务器端渲染不匹配
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeProvider attribute="class" defaultTheme={initialTheme} enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
