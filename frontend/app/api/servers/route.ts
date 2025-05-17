import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // 验证用户是否已登录
    const session = await getServerSession(authConfig)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // 解析请求体
    const body = await request.json()

    // 验证必填字段
    if (!body.title || !body.description) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // 添加服务器
    const newServer = await db.addServer({
      title: body.title,
      description: body.description,
      url: body.url,
      category: body.category,
      userId: session.user?.id,
    })

    return NextResponse.json(newServer, { status: 201 })
  } catch (error) {
    console.error("Error creating server:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
