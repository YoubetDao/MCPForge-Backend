"use client"

import { Search } from "lucide-react"
import Link from "next/link"
import ServerCard from "@/components/server-card"
import CategoryTabs from "@/components/category-tabs"
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
    <main className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-300">
      {/* Cyber lines background - 在亮色模式下降低不透明度 */}
      <div className="fixed inset-0 z-0 opacity-20 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/cyber-grid.svg')] bg-repeat"></div>
      </div>

      {/* Top glowing line */}
      <div className="w-full h-0.5 bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500 relative z-10"></div>

      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-cyan-900/30 bg-white/90 dark:bg-black/80 backdrop-blur-md relative z-10">
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
              className="hidden sm:flex text-pink-500 dark:text-pink-500 hover:text-pink-400 dark:hover:text-pink-400 font-medium transition-colors cyber-box-sm"
            >
              {dict.nav.submit}
            </Link>
            <ConnectButton 
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400"
              style={{ 
                border: 'none',
                color: 'black',
                fontFamily: 'var(--font-share-tech-mono)',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      </nav>

      {/* Hero Section - 修复暗色模式背景 */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-30 dark:opacity-30 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 35%, rgba(0, 255, 255, 0.2) 0%, transparent 25%), 
                              radial-gradient(circle at 75% 65%, rgba(255, 0, 255, 0.2) 0%, transparent 25%)`,
            }}
          ></div>
        </div>

        {/* Hero content */}
        <div className="container mx-auto px-4 relative z-1 flex flex-col items-center">
          {/* Server count badges */}
          {/* <div className="flex justify-center mb-6 gap-2">
            <span className="bg-gradient-to-r from-cyan-500/20 to-cyan-400/20 dark:from-cyan-900/50 dark:to-cyan-800/50 text-cyan-600 dark:text-cyan-400 px-3 py-1 rounded text-sm font-mono border border-cyan-500/30 dark:border-cyan-700/50 cyber-box">
              <span className="text-cyan-700 dark:text-white">131</span>KB
            </span>
            <span className="bg-gradient-to-r from-pink-500/20 to-pink-400/20 dark:from-pink-900/50 dark:to-pink-800/50 text-pink-600 dark:text-pink-400 px-3 py-1 rounded text-sm font-mono border border-pink-500/30 dark:border-pink-700/50 cyber-box">
              <span className="text-pink-700 dark:text-white">INDEXED</span>
            </span>
          </div> */}

          {/* Main title */}
          <div className="flex flex-col items-center justify-center mb-4 relative">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-2 font-cyberpunk uppercase glitch-title"
              data-text={dict.hero.title1}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-gray-800 to-pink-600 dark:from-cyan-400 dark:via-white dark:to-pink-500">
                {dict.hero.title1}
              </span>
            </h1>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-2 font-cyberpunk uppercase glitch-title"
              data-text={dict.hero.title2}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 dark:from-pink-500 dark:via-purple-500 dark:to-cyan-500">
                {dict.hero.title2}
              </span>
            </h1>

            {/* Decorative lines */}
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-2"></div>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent mt-1"></div>
          </div>

          <p
            className="text-gray-600 dark:text-gray-400 text-center text-lg mb-10 max-w-2xl mx-auto w-full glitch-text"
            data-text={dict.hero.subtitle}
          >
            {dict.hero.subtitle}
          </p>

          {/* Search box */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative cyber-search-box">
              <input
                type="text"
                placeholder={dict.hero.searchPlaceholder}
                className="w-full px-5 py-4 pr-12 bg-white/90 dark:bg-black/60 border border-gray-300 dark:border-cyan-800 rounded-none focus:outline-none focus:border-pink-500 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 font-mono"
              />
              <div className="absolute top-0 right-0 bottom-0 w-12 flex items-center justify-center text-cyan-600 dark:text-cyan-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer">
                <Search size={20} />
              </div>
              <div className="absolute left-0 bottom-0 w-2 h-2 border-l border-b border-cyan-500"></div>
              <div className="absolute right-0 bottom-0 w-2 h-2 border-r border-b border-cyan-500"></div>
              <div className="absolute left-0 top-0 w-2 h-2 border-l border-t border-cyan-500"></div>
              <div className="absolute right-0 top-0 w-2 h-2 border-r border-t border-cyan-500"></div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-gray-500 dark:text-gray-500 font-mono">
              <span>{dict.hero.popular}</span>
              <Link
                href="#"
                className="text-cyan-600 dark:text-cyan-400 hover:text-pink-600 dark:hover:text-pink-400 transition-all"
              >
                GITHUB
              </Link>
              <Link
                href="#"
                className="text-cyan-600 dark:text-cyan-400 hover:text-pink-600 dark:hover:text-pink-400 transition-all"
              >
                EDGEONE
              </Link>
              <Link
                href="#"
                className="text-cyan-600 dark:text-cyan-400 hover:text-pink-600 dark:hover:text-pink-400 transition-all"
              >
                MINIMAX
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs - Updated styling */}
      <CategoryTabs dict={dict.categories} />

      {/* Featured Servers */}
      <section className="py-12 bg-white/90 dark:bg-black/70 backdrop-blur-sm border-y border-gray-200 dark:border-cyan-900/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-cyberpunk flex items-center">
              <span className="w-3 h-3 bg-cyan-500 mr-2"></span>
              {dict.sections.featuredServers}
              <span className="w-3 h-3 bg-pink-500 ml-2"></span>
            </h2>
            <Link
              href="/view-all"
              className="text-cyan-600 dark:text-cyan-400 hover:text-pink-600 dark:hover:text-pink-400 font-medium flex items-center gap-1 group"
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
      <section className="py-12 bg-white/90 dark:bg-black/70 backdrop-blur-sm border-y border-gray-200 dark:border-cyan-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <NewsletterSignup dict={dict.sections} />
          </div>
        </div>
      </section>
    </main>
  )
}
