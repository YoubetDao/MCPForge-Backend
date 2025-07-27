"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
// import { Transaction } from '@mysten/sui/transactions';
import {
  Home,
  Copy,
  Clock,
  ServerIcon,
  MessageSquare,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  getMCPCards,
  startMCPServer,
  checkMCPServerStatus,
  pollServerStatus,
  deleteMCPServer,
} from "@/lib/api";
import ReactMarkdown from "react-markdown";
// import { Transaction } from '@mysten/sui/transactions';
// import { SuiClient } from '@mysten/sui/client';
// import { useCurrentAccount, useSignAndExecuteTransaction, useConnectWallet, useWallets } from '@mysten/dapp-kit';
// import { WebCryptoSigner } from '@mysten/signers/webcrypto';
// import '@mysten/dapp-kit/dist/index.css';
import { createMCPServerSubscription } from '@/lib/contracts/MCPServerSubscription';
import AuthButton from "@/components/auth-button";
import { useLanguage } from "@/lib/language-context";

// Add Ethereum to the window object type
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function ServerDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { dictionary: dict } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [server, setServer] = useState<any>(null);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [isStartingServer, setIsStartingServer] = useState(false);
  const [serverStartResponse, setServerStartResponse] = useState<any>(null);
  const [serverStartError, setServerStartError] = useState<string | null>(null);
  const [showTransferButton, setShowTransferButton] = useState(true); // 默认显示转账按钮
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [serverPhase, setServerPhase] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubscriptionValid, setIsSubscriptionValid] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'plus' | null>(null);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);

  // BSC 钱包状态
  const [bscAccount, setBscAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // 检查钱包连接状态
  useEffect(() => {
    // 先检查用户是否已登录
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // 用户未登录，不检查钱包连接
      setSubscriptionInfo(null);
      setIsSubscriptionValid(false);
      setShowTransferButton(true);
      return;
    }
    
    checkWalletConnection();
    
    // 监听账户和网络变化
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setBscAccount(accounts[0]);
        } else {
          setBscAccount(null);
          setSubscriptionInfo(null);
          setIsSubscriptionValid(false);
        }
      };
      
      const handleChainChanged = () => {
        // 重新加载页面以确保正确的网络状态
        window.location.reload();
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  // 监听用户登出事件
  useEffect(() => {
    const handleAuthChange = async () => {
      // 检查用户是否已登出
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        // 用户已登出，清除所有状态
        setBscAccount(null);
        setSubscriptionInfo(null);
        setIsSubscriptionValid(false);
        setShowTransferButton(true);
        setTransactionHash(null);
        setServerUrl(null);
        setServerPhase(null);
        setIsServerRunning(false);
        setSelectedPlan(null);
        setIsSubscriptionDialogOpen(false);
        
        // 清除任何钱包相关的错误信息
        setTransactionError(null);
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  // 检查订阅状态
  useEffect(() => {
    // 先检查用户是否已登录
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // 用户未登录，清除所有订阅相关状态
      setSubscriptionInfo(null);
      setIsSubscriptionValid(false);
      setShowTransferButton(true);
      return;
    }
    
    // 用户已登录且有BSC账户，检查订阅状态
    if (bscAccount) {
      checkSubscriptionStatus();
    }
  }, [bscAccount]);
  
  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        // 检查当前网络
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        // 如果不是BSC测试网，尝试切换
        if (chainId !== '0x61') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x61' }], // BSC Testnet chainId
            });
          } catch (switchError: any) {
            // 如果网络不存在，添加 BSC 测试网
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x61',
                  chainName: 'BSC Testnet',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18
                  },
                  rpcUrls: ['https://bsc-testnet.public.blastapi.io'],
                  blockExplorerUrls: ['https://testnet.bscscan.com/']
                }]
              });
            }
          }
        }
        
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setBscAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const checkSubscriptionStatus = async (accountAddress?: string) => {
    const account = accountAddress || bscAccount;
    if (!account) return;
    
    setIsCheckingSubscription(true);
    try {
      // 确保连接到BSC测试网
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x61') {
          console.log('Not on BSC Testnet, skipping subscription check');
          return;
        }
      }
      
      const mcpContract = await createMCPServerSubscription();
      const info = await mcpContract.getSubscriptionInfo(account);
      
      setSubscriptionInfo(info);
      setIsSubscriptionValid(info.isValid);
      
      // 如果订阅有效，隐藏支付按钮
      if (info.isValid) {
        setShowTransferButton(false);
      }
    } catch (error: any) {
      console.error('Error checking subscription status:', error);
      if (error.message?.includes('Unsupported chain ID')) {
        setTransactionError('Please switch to BSC Testnet to use this service.');
      }
    } finally {
      setIsCheckingSubscription(false);
    }
  };
  
  const connectBscWallet = async () => {
    setIsConnecting(true);
    setTransactionError(null);
    
    if (!window.ethereum) {
      setTransactionError("No BSC wallet found. Please install MetaMask.");
      setIsConnecting(false);
      return;
    }
    
    try {
      // 清除当前账户状态
      setBscAccount(null);
      setSubscriptionInfo(null);
      setIsSubscriptionValid(false);
      
      // 切换到 BSC 测试网
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }], // BSC Testnet chainId
      });
    } catch (switchError: any) {
      // 如果网络不存在，添加 BSC 测试网
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x61',
              chainName: 'BSC Testnet',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
              },
              rpcUrls: ['https://bsc-testnet.public.blastapi.io'],
              blockExplorerUrls: ['https://testnet.bscscan.com/']
            }]
          });
        } catch (addError) {
          setTransactionError('Failed to add BSC Testnet to wallet.');
          setIsConnecting(false);
          return;
        }
      } else {
        setTransactionError('Failed to switch to BSC Testnet.');
        setIsConnecting(false);
        return;
      }
    }
    
    try {
      // 直接请求账户，这会返回当前在 MetaMask 中选中的账户
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // 如果返回的账户与之前的不同，或者用户想要切换账户
      // 可以通过 wallet_requestPermissions 强制显示账户选择器
      if (accounts && accounts.length > 0) {
        // 检查是否是用户在 MetaMask 中当前选中的账户
        const currentAccount = accounts[0];
        setBscAccount(currentAccount);
        setIsConnecting(false);
        
        // 连接成功后立即检查订阅状态
        checkSubscriptionStatus(currentAccount);
      } else {
        // 如果没有账户，请求权限
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{
            eth_accounts: {}
          }]
        });
        
        // 再次请求账户
        const newAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (newAccounts && newAccounts[0]) {
          setBscAccount(newAccounts[0]);
          checkSubscriptionStatus(newAccounts[0]);
        }
        setIsConnecting(false);
      }
    } catch (error) {
      setTransactionError('Wallet connection rejected.');
      setIsConnecting(false);
    }
  };
  
  // 计算 BSC 探索器 URL
  const explorerUrl = useMemo(() => {
    if (!transactionHash) return '';
    return `https://testnet.bscscan.com/tx/${transactionHash}`;
  }, [transactionHash]);

  // 检查服务器状态
  useEffect(() => {
    async function checkStatus() {
      if (server?.title) {
        try {
          const status = await checkMCPServerStatus(server.title);
          console.log("Server status check result:", status);

          // 默认显示转账按钮，除非确认服务器存在
          setShowTransferButton(!status.exists);

          if (status.exists && status.url) {
            setServerUrl(status.url);
            setServerPhase(status.phase || null);
            setIsServerRunning(status.phase === "Running");
          } else {
            // 如果服务器不存在，清除之前可能存在的状态
            setServerUrl(null);
            setServerPhase(null);
            setIsServerRunning(false);
          }
        } catch (error) {
          console.error("Error checking server status:", error);
          // 发生错误时，默认显示转账按钮
          setShowTransferButton(true);
        }
      } else {
        // 如果没有server.title，默认显示转账按钮
        setShowTransferButton(true);
      }
    }
    checkStatus();
  }, [server?.title]);


  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setTransactionError("Please select a subscription plan.");
      return;
    }
    
    setIsSubscriptionDialogOpen(false);
    await handleTransferBsc();
  };

  const handleTransferBsc = async () => {
    setTransactionError(null);
    setTransactionHash(null);
    setIsWalletConnecting(true);

    // 如果未连接钱包，尝试连接
    if (!bscAccount) {
      await connectBscWallet();
      // 等待连接完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 再次检查是否连接成功
      const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        setTransactionError("Please connect your wallet first.");
        setIsWalletConnecting(false);
        return;
      }
    }

    // 继续执行交易...
    try {
      setIsWalletConnecting(false);
      setIsTransactionPending(true);

      // 创建合约实例
      const mcpContract = await createMCPServerSubscription();
      
      // 购买订阅
      // 注意：这会为当前用户购买/延长平台级订阅
      // 用户购买一次订阅后，可以使用平台上的所有 MCP 服务器
      const tx = await mcpContract.purchaseSubscription();
      
      console.log("Transaction sent:", tx.hash);
      setTransactionHash(tx.hash);
      
      // 等待交易确认
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      setIsTransactionPending(false);
      
      // 一旦支付成功，就不再显示转账按钮
      setShowTransferButton(false);
      
      // 重新检查订阅状态
      await checkSubscriptionStatus();
      
    } catch (error: any) {
      console.error("Transaction error:", error);
      setTransactionError(error.message || "Transaction failed");
      setIsTransactionPending(false);
    }
  };

  // 修改loadMCPCardData函数中处理服务器数据的部分
  useEffect(() => {
    async function loadMCPCardData() {
      setIsLoading(true);
      try {
        // Fetch all cards and find the one matching the slug
        const cards = await getMCPCards();
        // Try to match by ID or name
        const card = cards.find(
          (c) =>
            c.id.toString() === slug ||
            c.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]+/g, "") === slug
        );

        if (card) {
          // Transform the data to match our UI structure
          setServer({
            id: card.id.toString(),
            title: card.name,
            description: card.description,
            creator: "MCP forge",
            createdAt: new Date(card.created_at).toLocaleDateString(),
            tags: ["mcp", card.name.split("-")[0] || "server"],
            github_url: card.github_url,
            // 处理markdown内容
            overview: card.overview || "No overview available",
            // 处理 tools 对象，确保Markdown正确渲染
            tools:
              typeof card.tools === "string"
                ? (card.tools as string)
                    .replace(/\\n/g, "\n")
                    .replace(/^"(#+)/gm, "$1")
                : Object.entries(card.tools || {})
                    .map(([key, value]) => `## ${key}\n\n${value}`)
                    .join("\n\n"),
            config: JSON.stringify(
              {
                mcpServers: { [card.name]: { dockerImage: card.docker_image } },
              },
              null,
              2
            ),
            price: card.price,
            recommendedServers: cards
              .filter((c) => c.id !== card.id)
              .slice(0, 2)
              .map((c) => ({
                id: c.id.toString(),
                title: c.name,
                description: c.description,
                isFeatured: true,
              })),
          });
        } else {
          // If no matching card is found, create a fallback server object
          setServer({
            id: "not-found",
            title: slug.replace(/-/g, " "),
            description: "This server information is not available.",
            creator: "Unknown",
            createdAt: "N/A",
            tags: ["mcp", "unknown"],
            github_url: `https://github.com/mcp-plugins/${slug.toLowerCase()}`,
            overview: "Information about this server is currently unavailable.",
            tools:
              "## Tools\n\nNo tools information available for this server.",
            config: JSON.stringify(
              {
                mcpServers: {
                  example: { dockerImage: "example/image:latest" },
                },
              },
              null,
              2
            ),
            price: "Unknown",
            recommendedServers: [],
          });
        }
      } catch (error) {
        console.error("Error loading MCP card:", error);
        // Create a fallback server object in case of error
        setServer({
          id: "error",
          title: slug.replace(/-/g, " "),
          description: "Error loading server information.",
          creator: "Unknown",
          createdAt: "N/A",
          tags: ["mcp", "error"],
          github_url: `https://github.com/mcp-plugins/${slug.toLowerCase()}`,
          overview: "There was an error loading information about this server.",
          tools: "## Tools\n\nNo tools information available for this server.",
          config: JSON.stringify(
            {
              mcpServers: { example: { dockerImage: "example/image:latest" } },
            },
            null,
            2
          ),
          price: "Unknown",
          recommendedServers: [],
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadMCPCardData();
  }, [slug]);

  // 修改启动服务器的处理函数
  const handleServerAction = async () => {
    if (isServerRunning) {
      try {
        setIsDeleting(true);
        await deleteMCPServer(server.title);
        // 重置状态
        setServerUrl(null);
        setServerPhase(null);
        setIsServerRunning(false);
        setShowTransferButton(true);
      } catch (error) {
        console.error("Error stopping server:", error);
        setServerStartError(
          error instanceof Error ? error.message : "Failed to stop MCP server"
        );
      } finally {
        setIsDeleting(false);
      }
      return;
    }

    try {
      setIsStartingServer(true);
      setServerStartError(null);
      setServerStartResponse(null);
      setServerUrl(null);

      // 提取 docker image
      let dockerImage;
      try {
        const serverConfig = JSON.parse(server.config);
        dockerImage = serverConfig.mcpServers[server.title]?.dockerImage;

        if (!dockerImage) {
          // Try to use a fallback if the server.title doesn't match exactly
          // This happens when slugs differ from actual server names
          const firstServerKey = Object.keys(serverConfig.mcpServers)[0];
          if (firstServerKey) {
            dockerImage = serverConfig.mcpServers[firstServerKey]?.dockerImage;
            console.log(
              `Using fallback docker image from key: ${firstServerKey}`
            );
          }
        }
      } catch (error) {
        console.error("Error parsing server config:", error);
      }

      // Final fallback to a known working image if we still don't have one
      if (!dockerImage) {
        dockerImage = "docker.io/heha37/evm-mcp-server:2.0";
        console.log("Using default docker image as fallback");
      }

      console.log("Starting MCP server:", {
        serverName: server.title,
        dockerImage: dockerImage,
      });

      // 启动服务器
      const data = await startMCPServer(server.title, dockerImage);
      console.log("Server start response:", data);
      setServerStartResponse(data);

      // 开始轮询服务器状态
      setIsPolling(true);
      try {
        const url = await pollServerStatus(server.title);
        setServerUrl(url);
        setServerPhase("Running");
        setIsServerRunning(true); // 确保在服务器成功启动后设置为运行状态
        console.log("Server is ready with URL:", url);
      } catch (error) {
        console.error("Polling error:", error);
        setServerStartError("Server startup timeout or error occurred");
        setIsServerRunning(false); // 如果启动失败，确保设置为非运行状态
      } finally {
        setIsPolling(false);
      }
    } catch (error) {
      console.error("Error starting MCP server:", error);
      setServerStartError(
        error instanceof Error ? error.message : "Failed to start MCP server"
      );
      setIsServerRunning(false); // 如果出错，确保设置为非运行状态
    } finally {
      setIsStartingServer(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-t-2 border-r-2 border-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-mono">
            LOADING SERVER DATA...
          </p>
        </div>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Server not found
          </p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-300">
      {/* Cyber lines background */}
      <div className="fixed inset-0 z-0 opacity-20 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/cyber-grid.svg')] bg-repeat"></div>
      </div>

      <div className="container mx-auto py-6 px-4 relative z-1">
        {/* Header with Auth Button */}
        <div className="flex items-center justify-between mb-6">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/"
            className="flex items-center hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <Home className="h-4 w-4 mr-1" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link
            href="/servers"
            className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            Servers
          </Link>
          <span>/</span>
          <span className="text-cyan-600 dark:text-cyan-400">
            {server.title}
          </span>
          </div>
          
          {/* Auth Button */}
          <AuthButton dict={dict?.auth || {
            profile: "Profile",
            dashboard: "Dashboard",
            settings: "Settings",
            signOut: "Sign out"
          }} />
        </div>

        {/* Server header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-pink-600 dark:from-cyan-400 dark:to-pink-500">
            <a
              href={server.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              {server.title}
            </a>
          </h1>

          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">
                Created by
              </span>
              <span className="font-medium text-cyan-600 dark:text-cyan-400">
                {server.creator}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {server.createdAt}
              </span>
            </div>
          </div>

          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            {server.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {server.tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-cyan-500/10 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 dark:border-cyan-800 font-mono text-xs"
              >
                #{tag}
              </Badge>
            ))}
          </div>
          {server.price && (
            <div className="mt-2">
              <Badge
                variant="outline"
                className="bg-pink-500/10 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border border-pink-500/30 dark:border-pink-800 font-mono"
              >
                ${server.price} USD
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-gray-100 dark:bg-gray-900/50 p-0 h-12 w-full rounded-none border-b border-gray-200 dark:border-gray-800">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-white data-[state=active]:dark:bg-black data-[state=active]:text-cyan-600 data-[state=active]:dark:text-cyan-400 rounded-none h-12 font-medium"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="content"
                    className="data-[state=active]:bg-white data-[state=active]:dark:bg-black data-[state=active]:text-cyan-600 data-[state=active]:dark:text-cyan-400 rounded-none h-12 font-medium"
                  >
                    Content
                  </TabsTrigger>
                  <TabsTrigger
                    value="tools"
                    className="data-[state=active]:bg-white data-[state=active]:dark:bg-black data-[state=active]:text-cyan-600 data-[state=active]:dark:text-cyan-400 rounded-none h-12 font-medium"
                  >
                    Tools
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="data-[state=active]:bg-white data-[state=active]:dark:bg-black data-[state=active]:text-cyan-600 data-[state=active]:dark:text-cyan-400 rounded-none h-12 font-medium"
                  >
                    Comments
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-6">
                  <div className="markdown-content text-gray-700 dark:text-gray-300">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-2xl font-bold mt-6 mb-4"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-xl font-bold mt-5 mb-3"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-lg font-bold mt-4 mb-2"
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="my-2" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-6 my-3" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="my-1" {...props} />
                          ),
                        }}
                      >
                        {server.overview}
                      </ReactMarkdown>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="p-6">
                  <div className="text-center py-10">
                    <ServerIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Content information will be available soon.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="tools" className="p-6">
                  <div className="markdown-content text-gray-700 dark:text-gray-300">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-2xl font-bold mt-6 mb-4"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-xl font-bold mt-5 mb-3"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-lg font-bold mt-4 mb-2"
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="my-2" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-6 my-3" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="my-1" {...props} />
                          ),
                          code: ({ node, ...props }) => (
                            <code
                              className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {/* Clean up any quotes at the beginning of the string */}
                        {server.tools?.replace(/^["']/, "")}
                      </ReactMarkdown>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="p-6">
                  <div className="text-center py-10">
                    <MessageSquare className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Comments will be available soon.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* 显示钱包连接状态和按钮 */}
            <Card className="bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center justify-between">
                    BSC Wallet Status
                  </h3>
                </div>

                <div className="p-4">
                  {bscAccount ? (
                    <div>
                      <div className="text-cyan-600 dark:text-cyan-400 font-mono">
                        <p className="break-all flex items-center">
                          <span className="inline-block w-3 h-3 bg-green-500 mr-2 rounded-full"></span>
                          Connected: {bscAccount.slice(0, 6)}...{bscAccount.slice(-4)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 border-cyan-700 hover:border-cyan-500 text-cyan-600 hover:text-cyan-400"
                        onClick={async () => {
                          try {
                            // 强制显示账户选择器
                            await window.ethereum.request({
                              method: 'wallet_requestPermissions',
                              params: [{
                                eth_accounts: {}
                              }]
                            });
                            // 重新连接钱包
                            await connectBscWallet();
                          } catch (error) {
                            console.error('Failed to switch account:', error);
                          }
                        }}
                      >
                        Switch Account
                      </Button>
                    </div>
                  ) : (
                      <div className="flex flex-wrap items-center gap-4">
                        <p className="text-yellow-600 dark:text-yellow-400 font-mono flex items-center mb-0">
                          <span className="inline-block w-3 h-3 bg-yellow-500 mr-2 rounded-full"></span>
                          Not Connected
                        </p>
                        <Button
                          className="ml-auto bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0 h-12"
                          onClick={connectBscWallet}
                          disabled={isConnecting}
                        >
                          {isConnecting ? 'Connecting...' : 'Connect your wallet'}
                        </Button>
                      </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 显示订阅状态信息 - 只在用户登录时显示 */}
            {subscriptionInfo && localStorage.getItem("user") && (
              <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
                
                <CardContent className="p-0">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Subscription Status</h3>
                  </div>
                  <div className="p-4">
                    {subscriptionInfo.isValid ? (
                      <div className="text-green-600 dark:text-green-400">
                        <p className="flex items-center mb-2">
                          <span className="inline-block w-3 h-3 bg-green-500 mr-2 rounded-full"></span>
                          Active Subscription
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Expires in {subscriptionInfo.remainingDays} days
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Expiry: {new Date(subscriptionInfo.expiryTime * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="text-yellow-600 dark:text-yellow-400">
                        <p className="flex items-center">
                          <span className="inline-block w-3 h-3 bg-yellow-500 mr-2 rounded-full"></span>
                          No Active Subscription
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Purchase a subscription to start MCP servers
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Dialog and Button - 只在用户登录时显示 */}
            {showTransferButton && !isSubscriptionValid && !transactionHash && localStorage.getItem("user") && (
              <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0 h-12"
                    disabled={isWalletConnecting || isTransactionPending}
                  >
                    {isWalletConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Connecting wallet...
                      </>
                    ) : isTransactionPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Transaction processing...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Subscribe to MCP Forge
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-black border border-cyan-900/50">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
                      Choose Your Subscription Plan
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Select a plan to unlock MCP server hosting capabilities
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    {/* Pro Plan */}
                    <div 
                      className={`p-6 border rounded-lg cursor-pointer transition-all ${
                        selectedPlan === 'pro' 
                          ? 'border-cyan-500 bg-cyan-500/10' 
                          : 'border-gray-700 hover:border-cyan-700'
                      }`}
                      onClick={() => setSelectedPlan('pro')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">Monthly Pro</h3>
                          <p className="text-cyan-400 text-2xl font-bold mb-3">0.01 BNB<span className="text-sm text-gray-400">/month</span></p>
                          <ul className="space-y-2 text-gray-300">
                            <li className="flex items-center">
                              <span className="text-cyan-500 mr-2">✓</span>
                              Run up to 50 MCP servers simultaneously
                            </li>
                            <li className="flex items-center">
                              <span className="text-cyan-500 mr-2">✓</span>
                              Up to 10 client connections per server
                            </li>
                            <li className="flex items-center">
                              <span className="text-cyan-500 mr-2">✓</span>
                              Access to chat functionality
                            </li>
                          </ul>
                        </div>
                        <div className="ml-4">
                          <div className={`w-6 h-6 rounded-full border-2 ${
                            selectedPlan === 'pro' 
                              ? 'border-cyan-500 bg-cyan-500' 
                              : 'border-gray-500'
                          }`}>
                            {selectedPlan === 'pro' && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-black"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Plus Plan */}
                    <div 
                      className="p-6 border rounded-lg cursor-not-allowed transition-all relative overflow-hidden border-gray-700 opacity-60"
                    >
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                        COMING SOON
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-400 mb-2">Monthly Plus</h3>
                          <p className="text-gray-500 text-2xl font-bold mb-3">0.01 BNB<span className="text-sm text-gray-400">/month</span></p>
                          <ul className="space-y-2 text-gray-500">
                            <li className="flex items-center">
                              <span className="text-gray-600 mr-2">✓</span>
                              Everything in Pro plan
                            </li>
                            <li className="flex items-center">
                              <span className="text-gray-600 mr-2">✓</span>
                              Unlimited MCP servers
                            </li>
                            <li className="flex items-center">
                              <span className="text-gray-600 mr-2">✓</span>
                              Unlimited client connections
                            </li>
                            <li className="flex items-center">
                              <span className="text-gray-600 mr-2">✓</span>
                              Priority support & advanced features
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    {transactionError && (
                      <div className="text-sm text-red-500 dark:text-red-400 mr-auto">
                        {transactionError}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setIsSubscriptionDialogOpen(false)}
                      className="border-gray-700 hover:border-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
                      onClick={handleSubscribe}
                      disabled={!selectedPlan || isTransactionPending}
                    >
                      {isTransactionPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Subscribe Now'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Show transaction error if any */}
            {transactionError && (
              <div className="mt-2 text-sm text-red-500 dark:text-red-400">
                Error: {transactionError}
              </div>
            )}

            {/* Show transaction hash if available */}
            {transactionHash && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="font-mono break-all">
                    Transaction Hash: {transactionHash}
                  </span>
                </a>
              </div>
            )}

            {/* 显示服务器URL和状态 */}
            {serverUrl && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md">
                <h3 className="text-green-700 dark:text-green-400 font-medium mb-2">
                  Server Status: {serverPhase || "Unknown"}
                </h3>
                <p className="text-green-600 dark:text-green-500 font-mono text-sm break-all">
                  Server URL: {serverUrl}
                </p>
              </div>
            )}

            {/* 添加轮询状态显示 */}
            {isPolling && (
              <div className="mt-4 flex items-center text-cyan-600 dark:text-cyan-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Waiting for server to be ready...</span>
              </div>
            )}

            {/* 只在用户登录且订阅有效时显示启动/停止服务器按钮 */}
            {isSubscriptionValid && localStorage.getItem("user") && (
              <Button
                className={`w-full mt-4 bg-gradient-to-r ${
                  isServerRunning
                    ? "from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
                    : "from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400"
                } text-black font-cyberpunk border-0 h-12`}
                onClick={handleServerAction}
                disabled={isStartingServer || isPolling || isDeleting}
              >
                {isStartingServer ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Starting MCP Server...
                  </>
                ) : isPolling ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Waiting for Server...
                  </>
                ) : isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Stopping MCP Server...
                  </>
                ) : isServerRunning ? (
                  <>
                    <ServerIcon className="mr-2 h-5 w-5" />
                    Stop MCP Server
                  </>
                ) : (
                  <>
                    <ServerIcon className="mr-2 h-5 w-5" />
                    Start MCP Server
                  </>
                )}
              </Button>
            )}
            {/* Show server start error if any */}
            {serverStartError && (
              <div className="mt-2 text-sm text-red-500 dark:text-red-400">
                Server start error: {serverStartError}
              </div>
            )}

            {/* Show server start response if available */}
            {serverStartResponse && (
              <div className="mt-4 text-center text-green-600 dark:text-green-400 font-medium">
                Server started
              </div>
            )}

            {/* Server Config */}
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center justify-between">
                    Server Config
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-cyan-500"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </h3>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                    {server.config}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Servers */}
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">
                    Recommend Servers
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {server.recommendedServers.map((rec: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 dark:border-cyan-900/30 hover:border-cyan-500/50 transition-colors rounded-md"
                    >
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {rec.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
