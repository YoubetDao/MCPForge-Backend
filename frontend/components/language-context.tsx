"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Locale } from "../lib/i18n-config"
import { i18n } from "../lib/i18n-config"

// 预定义字典加载函数
const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  zh: () => import("@/dictionaries/zh-CN.json").then((module) => module.default),
}

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  dictionary: any
  setDictionary: (dict: any) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
  initialLocale,
  initialDictionary,
}: {
  children: React.ReactNode
  initialLocale: Locale
  initialDictionary: any
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [dictionary, setDictionaryState] = useState(initialDictionary)
  const [isLoading, setIsLoading] = useState(false)

  // 加载字典的辅助函数
  const loadDictionary = async (localeToLoad: Locale) => {
    setIsLoading(true)
    try {
      // 使用预定义的字典加载函数
      const dict = await dictionaries[localeToLoad]()
      setDictionaryState(dict)
      return dict
    } catch (error) {
      console.error(`Failed to load dictionary for ${localeToLoad}:`, error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // 当语言改变时，保存到 localStorage 并加载新字典
  const setLocale = async (newLocale: Locale) => {
    if (newLocale !== locale && !isLoading) {
      const dict = await loadDictionary(newLocale)
      if (dict) {
        setLocaleState(newLocale)
        localStorage.setItem("preferred-language", newLocale)
      }
    }
  }

  // 设置字典的方法
  const setDictionary = (dict: any) => {
    setDictionaryState(dict)
  }

  // 在客户端首次渲染时，检查是否有保存的语言偏好
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as Locale | null
    if (savedLanguage && i18n.locales.includes(savedLanguage) && savedLanguage !== locale) {
      loadDictionary(savedLanguage).then((dict) => {
        if (dict) {
          setLocaleState(savedLanguage)
        }
      })
    }
  }, [locale])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, dictionary, setDictionary }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
