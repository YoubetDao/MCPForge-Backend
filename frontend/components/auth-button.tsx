"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet } from "lucide-react"
import LoginDialog from "@/components/login-dialog"
import { useLanguage } from "@/lib/language-context"

interface AuthButtonProps {
  dict: {
    profile: string
    dashboard: string
    settings: string
    signOut: string
  }
}

export default function AuthButton({ dict }: AuthButtonProps) {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const { locale } = useLanguage()
  const router = useRouter()

  // 用户状态管理
  const [user, setUser] = useState<any>(null)

  // 在组件挂载时检查localStorage和URL参数
  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error reading user data:", error)
      }
    }

    // 检查 URL 参数中的错误信息
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')

    if (error) {
      // 处理登录错误
      console.error('GitHub OAuth error:', error)
      // 清除 URL 参数
      window.history.replaceState({}, document.title, window.location.pathname)
    } else {
      // 正常加载，检查本地存储的用户信息
      checkUser()
    }

    // 监听认证状态变化
    const handleAuthChange = () => {
      checkUser()
    }

    window.addEventListener("auth-change", handleAuthChange)

    return () => {
      window.removeEventListener("auth-change", handleAuthChange)
    }
  }, [])

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    // 触发自定义事件通知其他组件
    window.dispatchEvent(new CustomEvent("auth-change"))
  }

  // 处理导航到个人资料页面
  const handleNavigateToProfile = () => {
    router.push("/profile")
  }

  // 处理导航到我的服务器页面
  const handleNavigateToMyServers = () => {
    router.push("/my-servers")
  }

  if (user) {
    const isWalletUser = user.user_id?.toString().startsWith("0x") || user.auth_methods?.some((auth: any) => auth.auth_type === 'web3')
    const displayName = user.username || user.email || "User"

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border border-binance-gray-3 hover:border-binance-yellow/70 hover:bg-binance-yellow/10 text-binance-black dark:text-binance-gray-1 group binance-button-secondary"
          >
            <div className="w-8 h-8 rounded-md bg-binance-gray-5 flex items-center justify-center text-binance-yellow mr-2 overflow-hidden relative shadow-binance">
              {user.image ? (
                <img src={user.image || "/placeholder.svg"} alt={displayName} className="w-full h-full object-cover" />
              ) : isWalletUser ? (
                <Wallet className="h-4 w-4 text-binance-yellow" />
              ) : (
                displayName[0].toUpperCase()
              )}
              <div className="absolute inset-0 bg-binance-yellow/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </div>
            <span className="max-w-[100px] truncate hidden sm:block font-inter">{displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-binance-gray-6 border border-binance-gray-4 text-binance-black dark:text-binance-gray-1 shadow-binance">
          <div className="flex items-center justify-start p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user.username && <p className="font-medium text-binance-black dark:text-binance-gray-1">{user.username}</p>}
              {user.email && <p className="w-[200px] truncate text-sm text-binance-gray-3 font-inter">{user.email}</p>}
              {user.role && <p className="text-xs text-binance-green">{user.role}</p>}
            </div>
          </div>
          {/* <DropdownMenuSeparator className="bg-binance-gray-4" />
          <DropdownMenuItem
            onClick={handleNavigateToProfile}
            className="cursor-pointer hover:bg-binance-gray-5 hover:text-binance-yellow focus:bg-binance-gray-5 focus:text-binance-yellow"
          >
            {dict.profile}
          </DropdownMenuItem> */}
          <DropdownMenuSeparator className="bg-binance-gray-4" />
          <DropdownMenuItem
            onClick={handleNavigateToMyServers}
            className="cursor-pointer hover:bg-binance-gray-5 hover:text-binance-yellow focus:bg-binance-gray-5 focus:text-binance-yellow"
          >
            My Servers
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-binance-gray-4" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-binance-red hover:bg-binance-gray-5 focus:bg-binance-gray-5"
          >
            {dict.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <Button
        className="binance-button-primary text-binance-black font-inter border-0"
        onClick={() => setIsLoginDialogOpen(true)}
      >
        SIGN IN
      </Button>

      <LoginDialog isOpen={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)} />
    </>
  )
}
