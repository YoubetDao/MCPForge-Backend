"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// 模拟钱包数据
const mockWallets = [
  { id: "metamask", name: "MetaMask", icon: "🦊" },
  { id: "coinbase", name: "Coinbase Wallet", icon: "🔵" },
  { id: "trust", name: "Trust Wallet", icon: "🔐" },
  { id: "rainbow", name: "Rainbow", icon: "🌈" },
]

export default function WalletConnectButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const handleConnect = async (walletId: string) => {
    setIsConnecting(walletId)

    // 模拟连接延迟
    setTimeout(() => {
      setIsConnecting(null)
      setIsOpen(false)
    }, 1500)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0 w-full"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] sm:max-w-md border border-cyan-900/50 bg-black text-gray-300">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
              Connect Wallet
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              Choose your preferred wallet provider
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {mockWallets.map((wallet) => (
              <Button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={isConnecting !== null}
                className="bg-transparent border border-cyan-900/50 hover:border-cyan-500/70 hover:bg-cyan-900/10 text-gray-300 justify-start"
              >
                {isConnecting === wallet.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="mr-2 text-lg">{wallet.icon}</span>
                )}
                {wallet.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
