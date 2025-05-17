import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  if (!address) {
    return new NextResponse("Address is required", { status: 400 })
  }

  // 使用地址生成一个简单的颜色
  const color = generateColorFromAddress(address)

  // 生成一个简单的SVG头像
  const svg = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${color}" />
      <text x="50" y="50" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${address.substring(0, 2)}...${address.substring(address.length - 2)}
      </text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}

// 从地址生成颜色
function generateColorFromAddress(address: string): string {
  // 简单的哈希函数
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash)
  }

  // 转换为颜色
  const c = (hash & 0x00ffffff).toString(16).toUpperCase()
  return "#" + "00000".substring(0, 6 - c.length) + c
}
