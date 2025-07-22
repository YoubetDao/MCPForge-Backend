"use client"

import { FlameIcon as Fire, Clock, Users, Server, Award, Lightbulb } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export default function CategoryTabs() {
  const { locale, dictionary: dict } = useLanguage()

  const categories = [
    { name: dict.featured, icon: <Fire className="w-4 h-4" />, active: true },
    { name: dict.latest, icon: <Clock className="w-4 h-4" /> },
    { name: dict.clients, icon: <Users className="w-4 h-4" /> },
    { name: dict.hosted, icon: <Server className="w-4 h-4" /> },
    { name: dict.official, icon: <Award className="w-4 h-4" /> },
    { name: dict.innovations, icon: <Lightbulb className="w-4 h-4" /> },
  ]

  return (
    <div className="border-y border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-center overflow-x-auto py-6 gap-3 scrollbar-hide">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={`/${locale}`}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-binance rounded-lg ${
                category.active
                  ? "text-binance-black bg-binance-yellow hover:bg-binance-yellow/90 shadow-binance-sm"
                  : "text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-binance-yellow/50 hover:text-binance-yellow bg-white dark:bg-gray-800"
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
