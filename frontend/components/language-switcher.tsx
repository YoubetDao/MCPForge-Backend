"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/lib/i18n-config"

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { locale, setLocale } = useLanguage()
  const [isChanging, setIsChanging] = useState(false)

  const languageNames: Record<string, string> = {
    en: "English",
    zh: "中文",
  }

  // 切换语言的函数
  const switchLanguage = async (newLocale: Locale) => {
    // 如果已经是当前语言或正在切换中，不做任何操作
    if (newLocale === locale || isChanging) {
      setIsOpen(false)
      return
    }

    setIsChanging(true)

    // 使用 setLocale 方法更新语言和字典
    await setLocale(newLocale)

    setIsChanging(false)
    // 关闭下拉菜单
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
        disabled={isChanging}
      >
        <span>{isChanging ? "Loading..." : languageNames[locale] || locale}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-black border border-cyan-900/50 shadow-lg z-50">
          <ul className="py-1">
            {Object.entries(languageNames).map(([langCode, name]) => (
              <li key={langCode}>
                <button
                  onClick={() => switchLanguage(langCode as Locale)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    locale === langCode
                      ? "text-cyan-400 bg-cyan-900/20"
                      : "text-gray-400 hover:text-cyan-400 hover:bg-black/40"
                  }`}
                  disabled={isChanging}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
