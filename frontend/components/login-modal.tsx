"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Github, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // 模拟状态，实际业务逻辑已移除
  const error = ""
  const isLoading = false

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-md bg-black border border-cyan-900/50 p-6 text-gray-300 animate-in fade-in zoom-in-95 duration-300 mx-auto">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
            ACCESS TERMINAL
          </h2>
          <p className="text-gray-400 text-sm mt-1">Choose your preferred authentication method</p>
        </div>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border border-red-800 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OAuth Providers */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="w-full max-w-xs bg-transparent border border-cyan-900/50 hover:border-cyan-500/70 hover:bg-cyan-900/10 text-gray-300"
              onClick={() => {}}
              type="button"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-cyan-900/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-500 font-mono">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 font-mono">
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="bg-black/60 border border-cyan-900/50 focus:border-cyan-500 text-gray-300 placeholder-gray-500 font-mono"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300 font-mono">
                  PASSWORD
                </Label>
                <button type="button" className="text-xs text-cyan-400 hover:text-pink-400 transition-colors font-mono">
                  FORGOT CODE?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                className="bg-black/60 border border-cyan-900/50 focus:border-cyan-500 text-gray-300 placeholder-gray-500 font-mono"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
              disabled={isLoading}
            >
              {isLoading ? "CONNECTING..." : "LOGIN"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            <span>New user? </span>
            <button
              type="button"
              className="text-cyan-400 hover:text-pink-400 transition-colors font-mono"
              onClick={() => {}}
            >
              CREATE ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
