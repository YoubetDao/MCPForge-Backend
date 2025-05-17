import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward the request to the external API
    const response = await fetch("http://43.130.247.176:5190/mcpserver", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to start MCP server" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in start-mcp-server API route:", error)
    return NextResponse.json({ error: "Failed to start MCP server" }, { status: 500 })
  }
}
