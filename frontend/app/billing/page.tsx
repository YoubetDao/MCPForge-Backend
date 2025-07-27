"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Home, CreditCard, Calendar, Clock, CheckCircle, XCircle, Loader2, PlayCircle } from "lucide-react";
import AuthButton from "@/components/auth-button";
import { useLanguage } from "@/lib/language-context";
import { useRouter } from "next/navigation";
import { createMCPServerSubscription } from "@/lib/contracts/MCPServerSubscription";

export default function BillingPage() {
  const { dictionary: dict } = useLanguage();
  const router = useRouter();
  
  // 用户和钱包状态
  const [user, setUser] = useState<any>(null);
  const [bscAccount, setBscAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // 订阅状态
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [isSubscriptionValid, setIsSubscriptionValid] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 订阅弹窗和支付状态
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'plus' | null>(null);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // 检查用户登录状态
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // 未登录，跳转到首页
      router.push("/");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  // 检查钱包连接状态
  useEffect(() => {
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

  // 检查订阅状态
  useEffect(() => {
    if (bscAccount && user) {
      checkSubscriptionStatus();
    }
  }, [bscAccount, user]);

  const checkWalletConnection = async () => {
    if (!window.ethereum) return;
    
    try {
      // 检查当前网络
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // 如果不是BSC测试网，尝试切换
      if (chainId !== '0x61') {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x61' }],
          });
        } catch (switchError: any) {
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
  };

  const connectBscWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    if (!window.ethereum) {
      setError("No BSC wallet found. Please install MetaMask.");
      setIsConnecting(false);
      return;
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x61' }],
      });
    } catch (switchError: any) {
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
          setError('Failed to add BSC Testnet to wallet.');
          setIsConnecting(false);
          return;
        }
      } else {
        setError('Failed to switch to BSC Testnet.');
        setIsConnecting(false);
        return;
      }
    }
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setBscAccount(accounts[0]);
      setIsConnecting(false);
      
      if (accounts[0]) {
        checkSubscriptionStatus(accounts[0]);
      }
    } catch (error) {
      setError('Wallet connection rejected.');
      setIsConnecting(false);
    }
  };

  const checkSubscriptionStatus = async (accountAddress?: string) => {
    const account = accountAddress || bscAccount;
    if (!account) return;
    
    setIsCheckingSubscription(true);
    setError(null);
    
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
    } catch (error: any) {
      console.error('Error checking subscription status:', error);
      setError('Failed to check subscription status.');
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setError("Please select a subscription plan.");
      return;
    }
    
    setIsSubscriptionDialogOpen(false);
    await handleTransferBsc();
  };

  const handleTransferBsc = async () => {
    setError(null);
    setTransactionHash(null);

    // 如果未连接钱包，尝试连接
    if (!bscAccount) {
      await connectBscWallet();
      // 等待连接完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 再次检查是否连接成功
      const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        setError("Please connect your wallet first.");
        return;
      }
    }

    // 继续执行交易...
    try {
      setIsTransactionPending(true);

      // 创建合约实例
      const mcpContract = await createMCPServerSubscription();
      
      // 购买订阅
      const tx = await mcpContract.purchaseSubscription();
      
      console.log("Transaction sent:", tx.hash);
      setTransactionHash(tx.hash);
      
      // 等待交易确认
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      setIsTransactionPending(false);
      
      // 重新检查订阅状态
      await checkSubscriptionStatus();
      
    } catch (error: any) {
      console.error("Transaction error:", error);
      setError(error.message || "Transaction failed");
      setIsTransactionPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-300">
      {/* Cyber lines background */}
      <div className="fixed inset-0 z-0 opacity-20 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/cyber-grid.svg')] bg-repeat"></div>
      </div>

      <div className="container mx-auto py-6 px-4 relative z-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
            <span className="text-cyan-600 dark:text-cyan-400">Billing</span>
          </div>
          
          {/* Auth Button */}
          <AuthButton dict={dict?.auth || {
            profile: "Profile",
            dashboard: "Dashboard",
            settings: "Settings",
            signOut: "Sign out"
          }} />
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-pink-600 dark:from-cyan-400 dark:to-pink-500">
            Billing & Subscription
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your MCP Forge subscription and billing information
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* Wallet Connection Card */}
          <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Wallet Connection
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {bscAccount ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-cyan-600 dark:text-cyan-400 font-mono">
                      <p className="break-all flex items-center">
                        <span className="inline-block w-3 h-3 bg-green-500 mr-2 rounded-full"></span>
                        Connected: {bscAccount.slice(0, 6)}...{bscAccount.slice(-4)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-cyan-700 hover:border-cyan-500 text-cyan-600 hover:text-cyan-400"
                      onClick={async () => {
                        try {
                          await window.ethereum.request({
                            method: 'wallet_requestPermissions',
                            params: [{
                              eth_accounts: {}
                            }]
                          });
                          await connectBscWallet();
                        } catch (error) {
                          console.error('Failed to switch account:', error);
                        }
                      }}
                    >
                      Switch Account
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Connect your wallet to view subscription details
                  </p>
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
                    onClick={connectBscWallet}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Wallet'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Status Card */}
          {bscAccount && (
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
              
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  Subscription Status
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {isCheckingSubscription ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-cyan-500" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Checking subscription status...
                    </p>
                  </div>
                ) : subscriptionInfo ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <div className="flex items-center gap-2">
                          {subscriptionInfo.isValid ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-red-500" />
                              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {subscriptionInfo.isValid && (
                        <Badge 
                          variant="outline" 
                          className="bg-cyan-500/10 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 dark:border-cyan-800"
                        >
                          PRO PLAN
                        </Badge>
                      )}
                    </div>

                    {subscriptionInfo.isValid ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <Clock className="h-4 w-4 inline mr-1" />
                              Expires On
                            </p>
                            <p className="text-lg font-semibold">
                              {formatDate(subscriptionInfo.expiryTime)}
                            </p>
                          </div>
                          
                          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <Calendar className="h-4 w-4 inline mr-1" />
                              Days Remaining
                            </p>
                            <p className="text-lg font-semibold">
                              {subscriptionInfo.remainingDays} days
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg">
                          <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                            Pro Plan Features
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            <li className="flex items-center">
                              <span className="text-green-500 mr-2">✓</span>
                              Run up to 50 MCP servers simultaneously
                            </li>
                            <li className="flex items-center">
                              <span className="text-green-500 mr-2">✓</span>
                              Up to 10 client connections per server
                            </li>
                            <li className="flex items-center">
                              <span className="text-green-500 mr-2">✓</span>
                              Access to chat functionality
                            </li>
                          </ul>
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
                          onClick={() => router.push('/servers')}
                        >
                          Browse MCP Servers
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          You don't have an active subscription. Subscribe to start using MCP servers.
                        </p>
                        <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0"
                            >
                              <PlayCircle className="mr-2 h-5 w-5" />
                              Subscribe Now
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
                              {error && (
                                <div className="text-sm text-red-500 dark:text-red-400 mr-auto">
                                  {error}
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
                      </div>
                    )}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 dark:text-red-400">{error}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Transaction Status */}
          {transactionHash && (
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-cyan-900/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
              
              <CardContent className="p-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                    Subscription Successful!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your Pro subscription has been activated
                  </p>
                  <a
                    href={`https://testnet.bscscan.com/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-mono text-sm break-all"
                  >
                    View Transaction: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}