"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-context"

export default function Logo() {
  const { locale } = useLanguage()

  return (
    <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl group">
      <div className="w-10 h-10 bg-black flex items-center justify-center rounded relative overflow-hidden border border-cyan-500 group-hover:border-pink-500 transition-colors duration-300">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 relative z-10 text-2xl font-black">
          M
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 font-cyberpunk">
        MCP forge
      </span>
    </Link>
  )
}
