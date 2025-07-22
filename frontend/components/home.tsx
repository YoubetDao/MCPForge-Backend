"use client"

import { Search } from "lucide-react"
import Link from "next/link"
import ServerCard from "@/components/server-card"
import CategoryTabs from "@/components/category-tabs"
import AuthButton from "@/components/auth-button"
import NewsletterSignup from "@/components/newsletter-signup"
import LanguageSwitcher from "@/components/language-switcher"
import Logo from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/lib/language-context"

import { useEffect, useState } from "react"
import { getMCPCards } from "@/lib/api"
import type { MCPCard } from "@/types/mcpcard"
import { ConnectButton } from '@mysten/dapp-kit';
import '@mysten/dapp-kit/dist/index.css';

export default function Home() {
  // 使用语言上下文获取当前语言和字典
  const { locale, dictionary: dict } = useLanguage()

  const [mcpCards, setMcpCards] = useState<MCPCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadMCPCards() {
      setIsLoading(true)
      try {
        const cards = await getMCPCards()
        setMcpCards(cards)
      } catch (error) {
        console.error("Error loading MCP cards:", error)
        // The getMCPCards function now handles errors and returns mock data,
        // so this catch block should rarely be triggered
      } finally {
        setIsLoading(false)
      }
    }

    loadMCPCards()
  }, [])

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-binance-black dark:text-white font-inter">

      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 relative z-10">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Logo />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <Link
              href="/submit"
              className="hidden sm:flex text-binance-yellow hover:text-binance-yellow/80 font-medium transition-binance"
            >
              {dict.nav.submit}
            </Link>
            <AuthButton dict={dict.auth} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 bg-gray-50 dark:bg-gray-800">
        {/* Hero content */}
        <div className="container mx-auto px-4 flex flex-col items-center">
          {/* Main title */}
          <div className="flex flex-col items-center justify-center mb-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 text-binance-black dark:text-white">
              {dict.hero.title1}
            </h1>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4">
              <span className="text-binance-yellow">{dict.hero.title2}</span>
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-center text-lg mb-10 max-w-2xl mx-auto">
            {dict.hero.subtitle}
          </p>

          {/* Search box */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <input
                type="text"
                placeholder={dict.hero.searchPlaceholder}
                className="binance-input pr-12 text-base"
              />
              <div className="absolute top-0 right-0 bottom-0 w-12 flex items-center justify-center text-gray-400 hover:text-binance-yellow transition-binance cursor-pointer">
                <Search size={20} />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">{dict.hero.popular}</span>
              <Link
                href="#"
                className="text-binance-yellow hover:text-binance-yellow/80 transition-binance font-medium"
              >
                GitHub
              </Link>
              <Link
                href="#"
                className="text-binance-yellow hover:text-binance-yellow/80 transition-binance font-medium"
              >
                EdgeOne
              </Link>
              <Link
                href="#"
                className="text-binance-yellow hover:text-binance-yellow/80 transition-binance font-medium"
              >
                MiniMax
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs - Updated styling */}
      <CategoryTabs />

      {/* Featured Servers */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-binance-black dark:text-white">
              {dict.sections.featuredServers}
            </h2>
            <Link
              href="/view-all"
              className="text-binance-yellow hover:text-binance-yellow/80 font-medium flex items-center gap-2 group transition-binance"
            >
              {dict.sections.viewAll}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              // Show loading skeletons while loading
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="h-64 bg-white/20 dark:bg-gray-900/30 animate-pulse rounded-md"></div>
                ))
            ) : mcpCards.length > 0 ? (
              // Show actual MCP cards
              mcpCards.map((card) => (
                <ServerCard
                  key={card.id}
                  id={card.id.toString()}
                  title={card.name}
                  description={card.description}
                  isFeatured={true}
                />
              ))
            ) : (
              // Fallback to static examples if no cards are available
              <>
                <ServerCard
                  title="GitHub"
                  description="Repository management, file operations, and GitHub API integration"
                  isFeatured={true}
                />
                <ServerCard
                  title="EdgeOne Pages MCP"
                  description="An MCP service designed for deploying HTML content to EdgeOne Pages and obtaining an accessible public URL"
                  isFeatured={true}
                />
                <ServerCard
                  title="MiniMax MCP"
                  description="Official MiniMax Model Context Protocol (MCP) server that enables interaction with powerful Text to Speech, Image generation"
                  isFeatured={true}
                />
                <ServerCard title="Amap Maps" description="高德地图方 MCP Server" isFeatured={true} />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <NewsletterSignup dict={dict.sections} />
          </div>
        </div>
      </section>
    </main>
  )
}
