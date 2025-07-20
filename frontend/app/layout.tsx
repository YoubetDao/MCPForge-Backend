import type React from "react"
import type { Metadata } from "next"
import { Inter, Share_Tech_Mono } from "next/font/google"
import "./globals.css"
import "@mysten/dapp-kit/dist/index.css"
import { Providers } from "./providers"
import { i18n } from "@/lib/i18n-config"
import type { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/dictionary"
import { LanguageProvider } from "@/lib/language-context"
import SuiProviders from "@/components/SuiProviders"

const inter = Inter({ subsets: ["latin"] })

// Properly load Share Tech Mono font
const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-share-tech-mono",
})

export const metadata: Metadata = {
  title: "MCP forge - Find Awesome MCP Servers and Clients",
  description: "The largest collection of MCP Servers.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 获取默认语言和字典
  const defaultLocale = i18n.defaultLocale as Locale
  const dictionary = await getDictionary(defaultLocale)

  return (
    <html lang={defaultLocale}>
      <body className={`${inter.className} ${shareTechMono.variable}`}>
        <Providers>
          <LanguageProvider initialLocale={defaultLocale} initialDictionary={dictionary}>
            <SuiProviders>{children}</SuiProviders>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  )
}
