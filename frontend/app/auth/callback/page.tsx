"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// 简单的认证服务
class AuthService {
  // 处理登录回调
  static async handleCallback(userId: string): Promise<any> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8443'
      const response = await fetch(`${backendUrl}/user/${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      const userData = await response.json()
      
      // 打印后端返回的响应
      console.log('GitHub login successful! Backend response:', userData)
      
      return userData
    } catch (error) {
      console.error('Error fetching user data:', error)
      throw error
    }
  }
}

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const userId = searchParams.get('user_id')
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'true' && userId) {
      // 登录成功，获取用户数据并保存
      console.log('Processing GitHub OAuth callback with userId:', userId)
      
      AuthService.handleCallback(userId)
        .then((userData) => {
          console.log('User data received and saved to localStorage:', userData)
          // 保存用户信息到 localStorage
          localStorage.setItem("user", JSON.stringify(userData))
          // 触发认证状态变化事件
          window.dispatchEvent(new CustomEvent("auth-change"))
          // 重定向到首页
          router.push('/')
        })
        .catch((error) => {
          console.error('Login failed:', error)
          // 登录失败，重定向到首页并显示错误
          router.push('/?error=' + encodeURIComponent('Failed to fetch user data'))
        })
    } else if (error) {
      // 登录失败，重定向到首页并显示错误
      console.error('Authentication error:', error)
      router.push('/?error=' + encodeURIComponent(error))
    } else {
      // 无效的回调参数，重定向到首页
      router.push('/')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-cyan-500" />
        <p className="text-gray-300">Processing authentication...</p>
      </div>
    </div>
  )
} 