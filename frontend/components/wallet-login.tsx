"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import WalletConnectButton from "@/components/wallet-connect-button"

export default function WalletLogin() {
  // 模拟状态
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 模拟连接后的显示
  const mockWalletAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"

  return (
    <div className="flex flex-col items-center space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!walletAddress ? (
        <WalletConnectButton />
      ) : (
        <div className="w-full space-y-2">
          <div className="p-2 bg-gray-900 rounded border border-cyan-900/50 text-gray-300 text-sm font-mono break-all">
            {mockWalletAddress}
          </div>
          <Button
            onClick={() => setIsLoading(!isLoading)}
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0 w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign in with Ethereum"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
