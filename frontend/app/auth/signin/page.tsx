"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import WalletLogin from "@/components/wallet-login"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-black border border-cyan-900/50 text-gray-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
            ACCESS TERMINAL
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Choose your preferred authentication method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* GitHub Login */}
          <Button
            className="w-full bg-transparent border border-cyan-900/50 hover:border-cyan-500/70 hover:bg-cyan-900/10 text-gray-300"
            onClick={() => {}}
          >
            <Github className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-cyan-900/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-500 font-mono">OR</span>
            </div>
          </div>

          {/* Ethereum Wallet Login */}
          <WalletLogin />
        </CardContent>
      </Card>
    </div>
  )
}
