// 合约配置文件
// 部署合约后，请在此处更新合约地址

export const contractConfig = {
  // MCPServerSubscription 合约地址
  MCPServerSubscription: {
    // BSC 测试网地址 - 运行 cd contract/bsc && npm run deploy:testnet 后更新
    bscTestnet: '0x1dbbe28dEaef84aF83C36cFf06D1EA8AAcc6B82a',
  },
};

// 网络配置
export const networkConfig = {
  bscTestnet: {
    chainId: 97,
    chainName: 'BSC Testnet',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-testnet.public.blastapi.io'],
    blockExplorerUrls: ['https://testnet.bscscan.com/'],
  },
};
