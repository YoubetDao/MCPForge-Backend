"use client"

import { FlameIcon as Fire, Clock, Users, Server, Award, Lightbulb } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"

interface CategoryTabsProps {
  dict: {
    featured: string
    latest: string
    clients: string
    hosted: string
    official: string
    innovations: string
  }
}

export default function CategoryTabs({ dict }: CategoryTabsProps) {
  const { locale } = useLanguage()

  const categories = [
    { name: dict.featured, icon: <Fire className="w-4 h-4" />, active: true },
    { name: dict.latest, icon: <Clock className="w-4 h-4" /> },
    { name: dict.clients, icon: <Users className="w-4 h-4" /> },
    { name: dict.hosted, icon: <Server className="w-4 h-4" /> },
    { name: dict.official, icon: <Award className="w-4 h-4" /> },
    { name: dict.innovations, icon: <Lightbulb className="w-4 h-4" /> },
  ]

  return (
    <div className="border-y border-gray-200 dark:border-cyan-900/30 bg-white/80 dark:bg-black/60 backdrop-blur-sm relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-center overflow-x-auto py-4 gap-2 scrollbar-hide">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={`/${locale}`}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm whitespace-nowrap transition-all font-mono ${
                category.active
                  ? "text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 cyber-tab-active"
                  : "text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-cyan-900/50 hover:border-cyan-500/70 hover:text-cyan-600 dark:hover:text-cyan-400 cyber-tab"
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
