import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-mono">Loading chat interface...</p>
      </div>
    </div>
  )
} 