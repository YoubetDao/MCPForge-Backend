import type { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { ethers } from "ethers"

export const authConfig: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Ethereum Wallet",
      credentials: {
        address: { label: "Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.address || !credentials?.signature || !credentials?.message) {
            return null
          }

          // 验证签名
          const address = credentials.address
          const sig = credentials.signature
          const message = credentials.message

          // 验证签名是否来自提供的地址
          const recoveredAddress = ethers.verifyMessage(message, sig)

          if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return null
          }

          // 返回用户对象
          return {
            id: address,
            name: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
            email: `${address.toLowerCase()}@ethereum.org`, // 虚拟邮箱
            image: `/api/avatar?address=${address}`, // 可以实现一个基于地址生成头像的API
          }
        } catch (e) {
          console.error("Wallet authentication error:", e)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || (token.id as string)
        // 添加钱包地址到会话
        if (token.address) {
          session.user.address = token.address as string
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // 如果是钱包登录，保存地址
        if (account?.provider === "credentials") {
          token.address = user.id // 钱包地址存储在 user.id 中
        }
      }
      return token
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}
