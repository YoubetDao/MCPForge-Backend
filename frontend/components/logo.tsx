"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export default function Logo() {
  const { locale } = useLanguage()

  return (
    <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl group">
      <div className="w-10 h-10 bg-binance-black flex items-center justify-center rounded-md relative overflow-hidden border border-binance-yellow/50 group-hover:border-binance-yellow transition-colors duration-300 shadow-binance">
        <span className="text-binance-yellow relative z-10 text-2xl font-black font-inter">
          M
        </span>
        <div className="absolute inset-0 bg-binance-yellow/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <span className="text-binance-black dark:text-binance-gray-1 font-inter">
        MCPForge
      </span>
    </Link>
  )
}
