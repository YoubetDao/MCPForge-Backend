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
    <Link href={`/servers/${slug}`} className="block h-full cursor-pointer group">
      <Card className="h-full binance-card hover:border-binance-yellow/50 transition-binance group-hover:shadow-popup">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-lg font-semibold text-binance-black dark:text-white font-inter leading-tight">
            {title}
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            {badge && (
              <Badge className="binance-badge-neutral text-xs">
                {badge}
              </Badge>
            )}
            {isFeatured && (
              <Star className="h-4 w-4 text-binance-yellow fill-binance-yellow" />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4">
            {description}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge className="binance-badge-success text-xs">
              MCP Server
            </Badge>
            <Badge className="bg-binance-yellow/10 text-binance-yellow border border-binance-yellow/20 px-2 py-1 rounded text-xs font-medium">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
