import { Suspense } from "react"
import { Search } from "lucide-react"
import Link from "next/link"
import ServerCard from "@/components/server-card"
import { db } from "@/lib/db"

async function getServers(query: string) {
  // 在实际应用中，这里应该调用数据库进行搜索
  // 这里我们使用内存数据库进行简单的搜索
  const allServers = await db.getServers()

  if (!query) return []

  const lowerQuery = query.toLowerCase()
  return allServers.filter(
    (server) =>
      server.title.toLowerCase().includes(lowerQuery) || server.description.toLowerCase().includes(lowerQuery),
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const query = typeof searchParams.q === "string" ? searchParams.q : ""
  const results = query ? await getServers(query) : []

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-xl mx-auto mb-8">
          <h1 className="text-2xl font-bold mb-4">Search Results</h1>
          <div className="relative">
            <form action="/search" method="get">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search with keywords"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>

        <Suspense fallback={<div>Loading results...</div>}>
          {query ? (
            <>
              <p className="mb-4">
                {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
              </p>
              {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((server) => (
                    <ServerCard
                      key={server.id}
                      title={server.title}
                      description={server.description}
                      isFeatured={server.isFeatured}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No results found for "{query}"</p>
                  <p className="text-gray-500">
                    Try different keywords or{" "}
                    <Link href="/submit" className="text-orange-600 hover:underline">
                      submit a new server to MCP forge
                    </Link>
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Enter a search term to find MCP servers</p>
            </div>
          )}
        </Suspense>
      </div>
    </main>
  )
}
