import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ServerCardProps {
  title: string
  description: string
  isFeatured?: boolean
  badge?: string
  id?: string
}

export default function ServerCard({ title, description, isFeatured = false, badge, id }: ServerCardProps) {
  // 生成一个基于标题的URL友好的slug
  const slug =
    id ||
    title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")

  return (
    <Link href={`/servers/${slug}`} className="block h-full cursor-pointer">
      <Card className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black border border-gray-200 dark:border-cyan-900/50 hover:border-cyan-500/50 transition-all duration-300 group relative overflow-hidden server-card">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-pink-500/5 dark:from-cyan-900/10 dark:to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 border-b border-gray-200 dark:border-gray-800">
          <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100 font-cyberpunk">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {badge && (
              <Badge
                variant="outline"
                className="border-pink-500/30 dark:border-pink-800 bg-pink-500/10 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 font-mono text-xs"
              >
                {badge}
              </Badge>
            )}
            {isFeatured && (
              <Star className="h-5 w-5 text-cyan-600 dark:text-cyan-400 fill-cyan-200 dark:fill-cyan-900" />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{description}</p>
          <div className="mt-4 flex gap-2">
            <Badge
              variant="secondary"
              className="bg-cyan-500/10 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 dark:border-cyan-800 font-mono text-xs"
            >
              MCP forge
            </Badge>
            <Badge
              variant="secondary"
              className="bg-pink-500/10 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border border-pink-500/30 dark:border-pink-800 font-mono text-xs"
            >
              SERVER
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
