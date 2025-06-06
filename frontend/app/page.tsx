"use client"
import { useLanguage } from "@/components/language-context"
import Home from "@/components/home"

export default function Page() {
  const { locale, dictionary } = useLanguage()

  // 直接渲染主页组件，不再重定向
  return <Home />
}
