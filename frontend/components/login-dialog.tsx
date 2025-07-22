"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Github, X, Wallet, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { ethers } from "ethers"
import { UserService, OpenAPI } from "@/lib/api/index";
import type { Web3AuthDto } from "@/lib/api/index";
import { useEffect } from "react";
import { useUser } from "@/lib/hooks/useUser"

declare global {
  interface Window {
    ethereum?: any
  }
}

interface LoginDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isWalletConnecting, setIsWalletConnecting] = useState(false)
  const [walletError, setWalletError] = useState("")
  const { setUser } = useUser()

  // 设置 OpenAPI BASE 地址优先用 .env，否则用本地
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8443";
    if (OpenAPI.BASE !== backendUrl) {
      OpenAPI.BASE = backendUrl;
    }
  }, []);

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true)
      setError("")
      // 获取当前页面 URL 作为 redirect_uri
      const redirectUri = OpenAPI.BASE + "/user/auth/github/callback"
      // 获取后端返回的 GitHub OAuth 跳转链接
      const result = await UserService.userControllerGithubAuth(redirectUri)
      if (result && result.url) {
        window.location.href = result.url
      } else {
        throw new Error("Failed to get GitHub OAuth URL")
      }
    } catch (err) {
      console.error("GitHub login error:", err)
      setError("Failed to initiate GitHub login. Please try again.")
      setIsLoading(false)
    }
  }

  const handleWalletLogin = async () => {
    try {
      setIsWalletConnecting(true)
      setWalletError("")
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.')
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]
      if (!address) {
        throw new Error('No wallet address found')
      }
      setWalletAddress(address)
      console.log('Wallet connected:', address)

      // 获取 Web3 挑战
      const challenge = await UserService.userControllerGetWeb3Challenge(address.toLowerCase())
      if (new Date(challenge.expires_at) < new Date()) {
        throw new Error('Challenge has expired. Please try again.')
      }
      // 请求用户签名
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [challenge.nonce, address],
      })

      console.log('Signature received:', signature)

      // 检查用户是否已存在
      try {
        const payload: Web3AuthDto = {
          address: address.toLowerCase(),
          signature,
          nonce: challenge.nonce,
        };
        console.log("Web3AuthDto payload:", payload);
        const authResult = await UserService.userControllerVerifyWeb3Auth(payload);
        setUser(authResult.user)
        onClose()
        window.dispatchEvent(new Event("auth-change"))
      } catch (error: any) {
        if (error.message.includes('User not found') || error.message.includes('Username is required')) {
          setWalletError("Wallet authentication failed.")
        } else {
          throw error
        }
      }
    } catch (err) {
      console.error("Wallet connection error:", err)
      setWalletError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setIsWalletConnecting(false)
    }
  }

  const resetWalletState = () => {
    setWalletAddress(null)
    setWalletError("")
    localStorage.removeItem('web3_auth_data')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] sm:max-w-md border border-cyan-900/50 bg-black text-gray-300">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <X size={18} />
        </button>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
            Sign In
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Sign in to your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {(error || walletError) && (
            <Alert variant="destructive" className="bg-red-900/20 border border-red-800 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || walletError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center justify-center py-4">
            {/* <Button
              variant="outline"
              className="w-full max-w-xs bg-transparent border border-cyan-900/50 hover:border-cyan-500/70 hover:bg-cyan-900/10 text-gray-300 py-6"
              onClick={handleGitHubLogin}
              type="button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span className="text-base">Connecting to GitHub...</span>
                </>
              ) : (
                <>
                  <Github className="mr-2 h-5 w-5" />
                  <span className="text-base">Sign in with GitHub</span>
                </>
              )}
            </Button> */}

            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cyan-900/30"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black px-2 text-gray-500 font-mono">OR</span>
              </div>
            </div> */}

            <Button
              variant="outline"
              className="w-full max-w-xs bg-transparent border border-cyan-900/50 hover:border-cyan-500/70 hover:bg-cyan-900/10 text-gray-300 py-6"
              onClick={handleWalletLogin}
              type="button"
              disabled={isLoading || isWalletConnecting}
            >
              {isWalletConnecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span className="text-base">Connecting Wallet...</span>
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-5 w-5" />
                  <span className="text-base">Connect Ethereum Wallet</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
