"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/hooks/use-auth'
import { getBearerToken, getCurrentUser, checkAuthStatus } from '@/lib/api-client'
import { toast } from "sonner"

export default function AuthTestPage() {
  const { user, isLoading, isAuthenticated, error, checkAuth } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testAuthStatus = async () => {
    try {
      const isAuth = await checkAuthStatus()
      addTestResult(`Auth Status Check: ${isAuth ? 'Authenticated' : 'Not Authenticated'}`)
    } catch (error) {
      addTestResult(`Auth Status Check Failed: ${error}`)
    }
  }

  const testGetCurrentUser = async () => {
    try {
      const userData = await getCurrentUser()
      addTestResult(`Get Current User: Success - ${JSON.stringify(userData)}`)
    } catch (error) {
      addTestResult(`Get Current User Failed: ${error}`)
    }
  }

  const testGetBearerToken = async () => {
    try {
      const tokenData = await getBearerToken()
      addTestResult(`Get Bearer Token: Success - Token length: ${tokenData.bearer_token?.length || 0}`)
    } catch (error) {
      addTestResult(`Get Bearer Token Failed: ${error}`)
    }
  }

  const testDirectFetch = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8443'}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        addTestResult(`Direct Fetch: Success - ${JSON.stringify(data)}`)
      } else {
        addTestResult(`Direct Fetch: Failed - Status: ${response.status}`)
      }
    } catch (error) {
      addTestResult(`Direct Fetch: Error - ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>认证系统测试页面</CardTitle>
          <CardDescription>
            用于测试 httpOnly cookies 认证是否正常工作
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 当前认证状态 */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">当前认证状态</h3>
            <div className="space-y-1 text-sm">
              <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>User: {user ? JSON.stringify(user) : 'None'}</p>
              <p>Error: {error || 'None'}</p>
            </div>
          </div>

          {/* 测试按钮 */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={testAuthStatus}>测试认证状态</Button>
            <Button onClick={testGetCurrentUser}>测试获取用户信息</Button>
            <Button onClick={testGetBearerToken}>测试获取Bearer Token</Button>
            <Button onClick={testDirectFetch}>测试直接Fetch</Button>
            <Button onClick={checkAuth} variant="outline">刷新认证状态</Button>
            <Button onClick={clearResults} variant="destructive">清空结果</Button>
          </div>

          {/* 测试结果 */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">测试结果</h3>
            <div className="space-y-1 text-sm font-mono bg-gray-100 p-2 rounded max-h-60 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">暂无测试结果</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="border-b pb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 登录链接 */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">登录测试</h3>
            <p className="text-sm text-gray-600 mb-2">
              如果未登录，请使用以下链接进行登录测试：
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8443'}/user/auth/github?redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}`, '_blank')}
                variant="outline"
              >
                GitHub 登录测试
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
