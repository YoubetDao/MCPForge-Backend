'use client';

import { ReactNode, useEffect } from 'react';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 定义钱包全局类型
declare global {
  interface Window {
    suiWallet?: any;
    martian?: any;
    suiet?: any;
  }
}

// 创建网络配置 - 明确指定所有需要的网络
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  devnet: { url: getFullnodeUrl('devnet') },
  localnet: { url: 'http://127.0.0.1:9000' },
});

// 创建查询客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

export default function SuiProviders({ children }: { children: ReactNode }) {
  // 添加调试钩子
  useEffect(() => {
    console.log('SuiProviders mounted - wallet connection available');

    // 检查是否有钱包可用
    const checkWallets = () => {
      if (window.suiWallet) {
        console.log('Sui Wallet detected');
      }
      if (window.martian) {
        console.log('Martian Wallet detected');
      }
      if (window.suiet) {
        console.log('Suiet Wallet detected');
      }
      // 如果没有检测到任何钱包
      if (!window.suiWallet && !window.martian && !window.suiet) {
        console.log('No Sui wallets detected');
      }
    };

    // 页面加载后执行检查
    setTimeout(checkWallets, 1000);

    return () => {
      console.log('SuiProviders unmounted');
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider
          autoConnect={true}
          preferredWallets={['Sui Wallet', 'Suiet', 'Martian Wallet']}
        >
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}