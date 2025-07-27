import { ethers } from 'ethers';
import { contractConfig } from './config';

// MCPServerSubscription 合约 ABI
export const MCPServerSubscriptionABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_monthlyPrice", "type": "uint256"},
      {"internalType": "address", "name": "_treasuryAddress", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "FundsWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "oldPrice", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "newPrice", "type": "uint256"}
    ],
    "name": "PriceUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "newExpiryTime", "type": "uint256"}
    ],
    "name": "SubscriptionExtended",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "expiryTime", "type": "uint256"}
    ],
    "name": "SubscriptionPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "oldAddress", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "newAddress", "type": "address"}
    ],
    "name": "TreasuryAddressUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MONTH_DURATION",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_user", "type": "address"},
      {"internalType": "uint256", "name": "_expiryTime", "type": "uint256"},
      {"internalType": "bool", "name": "_isActive", "type": "bool"}
    ],
    "name": "adminSetSubscription",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address[]", "name": "_users", "type": "address[]"}],
    "name": "batchCheckSubscriptions",
    "outputs": [{"internalType": "bool[]", "name": "", "type": "bool[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractStats",
    "outputs": [
      {"internalType": "uint256", "name": "_totalSubscribers", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalRevenue", "type": "uint256"},
      {"internalType": "uint256", "name": "_contractBalance", "type": "uint256"},
      {"internalType": "uint256", "name": "_monthlyPrice", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getSubscriptionInfo",
    "outputs": [
      {"internalType": "uint256", "name": "expiryTime", "type": "uint256"},
      {"internalType": "bool", "name": "isValid", "type": "bool"},
      {"internalType": "uint256", "name": "remainingDays", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "isSubscriptionValid",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "monthlyPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "purchaseSubscription",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_newPrice", "type": "uint256"}],
    "name": "setMonthlyPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_newTreasuryAddress", "type": "address"}],
    "name": "setTreasuryAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "subscriptions",
    "outputs": [
      {"internalType": "uint256", "name": "expiryTime", "type": "uint256"},
      {"internalType": "uint256", "name": "lastPayment", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalRevenue",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSubscribers",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "treasuryAddress",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// 合约地址配置
export const MCPServerSubscriptionAddress = contractConfig.MCPServerSubscription;

// 获取当前网络的合约地址
export function getContractAddress(chainId: number): string {
  if (chainId === 97) {
    // BSC Testnet
    return MCPServerSubscriptionAddress.bscTestnet;
  }
  throw new Error(`Unsupported chain ID: ${chainId}. Only BSC Testnet (97) is supported.`);
}

// 订阅信息接口
export interface SubscriptionInfo {
  expiryTime: number;
  isValid: boolean;
  remainingDays: number;
}

// 合约统计信息接口
export interface ContractStats {
  totalSubscribers: number;
  totalRevenue: bigint;
  contractBalance: bigint;
  monthlyPrice: bigint;
}

// MCPServerSubscription 合约封装类
export class MCPServerSubscription {
  private contract: ethers.Contract;
  private provider: ethers.BrowserProvider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.BrowserProvider, signer?: ethers.Signer, chainId?: number) {
    this.provider = provider;
    this.signer = signer;
    
    // 获取合约地址
    const address = chainId ? getContractAddress(chainId) : MCPServerSubscriptionAddress.bscTestnet;
    
    // 创建合约实例
    this.contract = new ethers.Contract(
      address,
      MCPServerSubscriptionABI,
      signer || provider
    );
  }

  // 设置签名者
  setSigner(signer: ethers.Signer) {
    this.signer = signer;
    this.contract = new ethers.Contract(
      this.contract.target as string,
      MCPServerSubscriptionABI,
      signer
    );
  }

  // 获取月度价格
  async getMonthlyPrice(): Promise<bigint> {
    return await this.contract.monthlyPrice();
  }

  // 获取月度价格（格式化为 BNB）
  async getMonthlyPriceInBNB(): Promise<string> {
    const price = await this.getMonthlyPrice();
    return ethers.formatEther(price);
  }

  // 购买订阅
  // 注意：此函数会自动为 msg.sender（调用者）购买订阅
  // 订阅是绑定到用户钱包地址的，不是特定服务器
  // 如果用户已有有效订阅，会自动延长一个月
  async purchaseSubscription(overrides?: ethers.Overrides): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error("Signer required for purchasing subscription");
    }
    
    const monthlyPrice = await this.getMonthlyPrice();
    
    return await this.contract.purchaseSubscription({
      ...overrides,
      value: monthlyPrice
    });
  }

  // 检查用户订阅是否有效
  async isSubscriptionValid(userAddress: string): Promise<boolean> {
    return await this.contract.isSubscriptionValid(userAddress);
  }

  // 获取用户订阅信息
  async getSubscriptionInfo(userAddress: string): Promise<SubscriptionInfo> {
    const [expiryTime, isValid, remainingDays] = await this.contract.getSubscriptionInfo(userAddress);
    
    return {
      expiryTime: Number(expiryTime),
      isValid,
      remainingDays: Number(remainingDays)
    };
  }

  // 批量检查订阅状态
  async batchCheckSubscriptions(addresses: string[]): Promise<boolean[]> {
    return await this.contract.batchCheckSubscriptions(addresses);
  }

  // 获取合约统计信息
  async getContractStats(): Promise<ContractStats> {
    const [totalSubscribers, totalRevenue, contractBalance, monthlyPrice] = 
      await this.contract.getContractStats();
    
    return {
      totalSubscribers: Number(totalSubscribers),
      totalRevenue,
      contractBalance,
      monthlyPrice
    };
  }

  // 获取合约余额
  async getContractBalance(): Promise<bigint> {
    return await this.contract.getContractBalance();
  }

  // 获取合约余额（格式化为 BNB）
  async getContractBalanceInBNB(): Promise<string> {
    const balance = await this.getContractBalance();
    return ethers.formatEther(balance);
  }

  // 监听订阅购买事件
  onSubscriptionPurchased(
    callback: (user: string, amount: bigint, expiryTime: bigint, event: ethers.EventLog) => void
  ): void {
    this.contract.on("SubscriptionPurchased", (user, amount, expiryTime, event) => {
      callback(user, amount, expiryTime, event);
    });
  }

  // 监听订阅延长事件
  onSubscriptionExtended(
    callback: (user: string, amount: bigint, newExpiryTime: bigint, event: ethers.EventLog) => void
  ): void {
    this.contract.on("SubscriptionExtended", (user, amount, newExpiryTime, event) => {
      callback(user, amount, newExpiryTime, event);
    });
  }

  // 移除所有事件监听
  removeAllListeners(): void {
    this.contract.removeAllListeners();
  }

  // 获取合约地址
  getAddress(): string {
    return this.contract.target as string;
  }

  // 获取合约实例
  getContract(): ethers.Contract {
    return this.contract;
  }
}

// 创建合约实例的便捷函数
export async function createMCPServerSubscription(
  provider?: ethers.BrowserProvider
): Promise<MCPServerSubscription> {
  // 如果没有提供 provider，使用 window.ethereum
  if (!provider && typeof window !== 'undefined' && window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }
  
  if (!provider) {
    throw new Error("No Ethereum provider found");
  }

  // 获取网络信息
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  // 尝试获取签名者
  let signer;
  try {
    signer = await provider.getSigner();
  } catch (e) {
    // 用户未连接钱包，使用只读模式
    console.log("No signer available, using read-only mode");
  }

  return new MCPServerSubscription(provider, signer, chainId);
}