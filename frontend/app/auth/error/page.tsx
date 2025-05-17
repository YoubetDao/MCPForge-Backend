"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  // Map error codes to user-friendly messages
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return "There is a problem with the server configuration. Please contact support."
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in."
      case "Verification":
        return "The verification link is no longer valid. It may have been used already or it may have expired."
      case "OAuthSignin":
        return "Error in the OAuth sign-in process. Please try again."
      case "OAuthCallback":
        return "Error in the OAuth callback process. Please try again."
      case "OAuthCreateAccount":
        return "Could not create OAuth provider account. Please try another provider."
      case "EmailCreateAccount":
        return "Could not create email provider account. Please try another method."
      case "Callback":
        return "Error in the authentication callback. Please try again."
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account. Please sign in using the original provider."
      case "EmailSignin":
        return "Error sending the email. Please try again."
      case "CredentialsSignin":
        return "Sign in failed. Check the details you provided are correct."
      case "SessionRequired":
        return "Please sign in to access this page."
      default:
        return "An unexpected error occurred. Please try again later."
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-black border border-cyan-900/50 text-gray-300">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4 text-red-500">
            <AlertCircle size={48} />
          </div>
          <CardTitle className="text-2xl font-bold text-center font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-center text-gray-400">{getErrorMessage(error)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-sm text-gray-500">Error code: {error || "Unknown"}</div>
          <Button
            className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
            asChild
          >
            <Link href="/">Return to Home</Link>
          </Button>
          <Button
            variant="outline"
            className="w-full bg-transparent border border-cyan-900/50 hover:border-cyan-500/70 hover:bg-cyan-900/10 text-gray-300"
            asChild
          >
            <Link href="/auth/signin">Try Again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
