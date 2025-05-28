"use client"

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
import { useLanguage } from "@/lib/language-context"
import { useConnectModal, useAccountModal } from "@rainbow-me/rainbowkit"
import { useAccount, useDisconnect } from "wagmi"

interface AuthButtonProps {
  dict: {
    profile: string
    dashboard: string
    settings: string
    signOut: string
  }
}

export default function AuthButton({ dict }: AuthButtonProps) {
  const { locale } = useLanguage()
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const { openAccountModal } = useAccountModal()
  const { openConnectModal } = useConnectModal()
  const { disconnect } = useDisconnect()

  // 处理导航到个人资料页面
  const handleNavigateToProfile = () => {
    router.push("/profile")
  }

  // 处理断开连接
  const handleDisconnect = () => {
    disconnect()
  }

  if (isConnected && address) {
    const displayName = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border border-cyan-900/50 hover:border-cyan-500/70 hover:bg-cyan-900/10 text-gray-300 group"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-black mr-2 overflow-hidden relative">
              <Wallet className="h-4 w-4" />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </div>
            <span className="max-w-[100px] truncate hidden sm:block font-mono">{displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-black border border-cyan-900 text-gray-300">
          <div className="flex items-center justify-start p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-gray-100 font-mono">{displayName}</p>
              <p className="w-[200px] truncate text-sm text-gray-400 font-mono">{address}</p>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-cyan-900/30" />
          <DropdownMenuItem
            onClick={handleNavigateToProfile}
            className="cursor-pointer hover:bg-cyan-900/20 hover:text-cyan-400 focus:bg-cyan-900/20 focus:text-cyan-400"
          >
            {dict.profile}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => openAccountModal?.()}
            className="cursor-pointer hover:bg-cyan-900/20 hover:text-cyan-400 focus:bg-cyan-900/20 focus:text-cyan-400"
          >
            Account Details
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-cyan-900/30" />
          <DropdownMenuItem
            onClick={handleDisconnect}
            className="cursor-pointer text-pink-400 hover:bg-pink-900/20 focus:bg-pink-900/20"
          >
            {dict.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
      onClick={() => openConnectModal?.()}
    >
      CONNECT WALLET
    </Button>
  )
}
