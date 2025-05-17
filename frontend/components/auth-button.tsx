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
import { useSession, signOut } from "next-auth/react"

interface AuthButtonProps {
  dict: {
    profile: string
    dashboard: string
    settings: string
    signOut: string
  }
}

export default function AuthButton({ dict }: AuthButtonProps) {
  const { data: session, status } = useSession()
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const { locale } = useLanguage()
  const router = useRouter()

  // 添加模拟用户状态
  const [mockUser, setMockUser] = useState<any>(null)

  // 在组件挂载和模拟登录状态变化时检查localStorage
  useEffect(() => {
    const checkMockUser = () => {
      try {
        const storedUser = localStorage.getItem("mockUser")
        if (storedUser) {
          setMockUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error reading mock user:", error)
      }
    }

    // 初始检查
    checkMockUser()

    // 监听模拟登录状态变化
    const handleAuthChange = () => {
      checkMockUser()
    }

    window.addEventListener("mock-auth-change", handleAuthChange)

    return () => {
      window.removeEventListener("mock-auth-change", handleAuthChange)
    }
  }, [])

  // 处理模拟登出
  const handleMockSignOut = () => {
    localStorage.removeItem("mockUser")
    setMockUser(null)
  }

  // 处理导航到个人资料页面
  const handleNavigateToProfile = () => {
    router.push("/profile")
  }

  const isLoading = status === "loading" && !mockUser
  const isLoggedIn = status === "authenticated" || mockUser

  // 优先使用模拟用户，如果没有则使用session
  const user = mockUser || session?.user

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="w-24 border-cyan-900/50 text-gray-500">
        <span className="loading-text">LOADING</span>
      </Button>
    )
  }

  if (isLoggedIn && user) {
    const isWalletUser = user.id?.startsWith("0x")
    const displayName = user.name || user.email || "User"

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border border-cyan-900/50 hover:border-cyan-500/70 hover:bg-cyan-900/10 text-gray-300 group"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-black mr-2 overflow-hidden relative">
              {user.image ? (
                <img src={user.image || "/placeholder.svg"} alt={displayName} className="w-full h-full object-cover" />
              ) : isWalletUser ? (
                <Wallet className="h-4 w-4" />
              ) : (
                displayName[0].toUpperCase()
              )}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </div>
            <span className="max-w-[100px] truncate hidden sm:block font-mono">{displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-black border border-cyan-900 text-gray-300">
          <div className="flex items-center justify-start p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user.name && <p className="font-medium text-gray-100">{user.name}</p>}
              {user.email && <p className="w-[200px] truncate text-sm text-gray-400 font-mono">{user.email}</p>}
            </div>
          </div>
          <DropdownMenuSeparator className="bg-cyan-900/30" />
          <DropdownMenuItem
            onClick={handleNavigateToProfile}
            className="cursor-pointer hover:bg-cyan-900/20 hover:text-cyan-400 focus:bg-cyan-900/20 focus:text-cyan-400"
          >
            {dict.profile}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-cyan-900/30" />
          <DropdownMenuItem
            onClick={mockUser ? handleMockSignOut : () => signOut({ callbackUrl: "/" })}
            className="cursor-pointer text-pink-400 hover:bg-pink-900/20 focus:bg-pink-900/20"
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
        className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
        onClick={() => setIsLoginDialogOpen(true)}
      >
        SIGN IN
      </Button>

      <LoginDialog isOpen={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)} />
    </>
  )
}
