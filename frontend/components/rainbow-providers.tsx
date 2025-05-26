"use client"

import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains'
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query"

const config = getDefaultConfig({
  appName: 'MCP Forge',
  projectId: '138d5bc2bbba94379fb7b1d2fb73712f', // 公共项目ID
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // 如果你的 dApp 使用服务器端渲染 (SSR)
})

const queryClient = new QueryClient()

export function RainbowProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}