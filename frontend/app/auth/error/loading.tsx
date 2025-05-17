import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-black border border-cyan-900/50 text-gray-300">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-400">Loading...</p>
        </CardContent>
      </Card>
    </div>
  )
}
