"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 在组件挂载后再渲染，避免水合不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      className="p-2 rounded border border-gray-300 bg-white/80 hover:border-pink-500/50 hover:bg-pink-500/10 transition-colors theme-toggle-button dark:bg-black/60 dark:border-cyan-900/50 dark:hover:bg-pink-900/10"
      onClick={() => {
        // 直接使用 setTheme 切换，而不是依赖于当前 theme 状态
        setTheme(theme === "dark" ? "light" : "dark")

        // 添加调试日志
        console.log(`切换主题: 当前主题=${theme}, 切换到=${theme === "dark" ? "light" : "dark"}`)
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-5 w-5 text-yellow-400" />
          <span className="sr-only">切换到亮色模式</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 text-blue-600" />
          <span className="sr-only">切换到暗色模式</span>
        </>
      )}
    </button>
  )
}
