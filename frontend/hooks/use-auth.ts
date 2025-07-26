"use client"

import { useState, useEffect } from 'react'
import { getCurrentUser, checkAuthStatus } from '@/lib/api-client'

interface User {
  userId: number
  username: string
  role: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const isAuth = await checkAuthStatus()
      
      if (isAuth) {
        const userData = await getCurrentUser()
        setAuthState({
          user: userData.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        })
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      })
    }
  }

  const logout = async () => {
    try {
      // 调用后端登出接口
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    checkAuth()

    // 监听认证状态变化事件
    const handleAuthChange = () => {
      checkAuth()
    }

    window.addEventListener('auth-change', handleAuthChange)
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  return {
    ...authState,
    checkAuth,
    logout,
  }
}
