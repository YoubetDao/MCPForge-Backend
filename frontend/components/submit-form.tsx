"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface SubmitFormProps {
  userId?: string
}

export default function SubmitForm({ userId }: SubmitFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    category: "server", // default category
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      // 提交服务器数据
      const response = await fetch("/api/servers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit server")
      }

      setSuccess(true)
      setFormData({
        title: "",
        description: "",
        url: "",
        category: "server",
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to submit server. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit a New MCP Server</CardTitle>
        <CardDescription>
          Share your MCP server with the MCP forge community. Please provide accurate information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>Server submitted successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Server Name</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., GitHub MCP"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what your MCP server does..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Server URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com/mcp"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="server">Server</option>
              <option value="client">Client</option>
              <option value="hosted">Hosted</option>
              <option value="official">Official</option>
              <option value="innovation">Innovation</option>
            </select>
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Server"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
