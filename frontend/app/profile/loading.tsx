import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    </div>
  )
}
