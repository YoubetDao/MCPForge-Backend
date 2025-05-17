"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LangPage() {
  const router = useRouter()

  // 重定向到根路径，不再使用语言路径
  useEffect(() => {
    router.replace("/")
  }, [router])

  return null
}
