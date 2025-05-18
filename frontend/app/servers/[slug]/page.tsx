"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Home,
  Copy,
  Clock,
  ServerIcon,
  PenToolIcon as Tool,
  MessageSquare,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getMCPCards,
  startMCPServer,
  checkMCPServerStatus,
  pollServerStatus,
  deleteMCPServer,
} from "@/lib/api";
import { distributor } from "@/lib/distributor";
import ReactMarkdown from "react-markdown";

// Add Ethereum to the window object type
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function ServerDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
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

  // 处理转账
  const handleTransferEth = async () => {
    setTransactionError(null);
    setTransactionHash(null);
    setIsWalletConnecting(true);

    if (!window.ethereum) {
      setTransactionError("No Ethereum wallet found. Please install MetaMask.");
      setIsWalletConnecting(false);
      return;
    }
    // 先切换到 OP Sepolia (chainId: 0xaa37dc)
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa37dc" }],
      });
    } catch (switchError: any) {
      // 如果没有添加该链，则尝试添加
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa37dc",
                chainName: "OP Sepolia",
                rpcUrls: ["https://sepolia.optimism.io"],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                blockExplorerUrls: ["https://sepolia-optimism.etherscan.io"],
              },
            ],
          });
        } catch (addError) {
          setTransactionError("Failed to add OP Sepolia network to wallet.");
          setIsWalletConnecting(false);
          return;
        }
      } else {
        setTransactionError("Failed to switch to OP Sepolia network.");
        setIsWalletConnecting(false);
        return;
      }
    }
    // 切换成功后再请求账户授权
    let accounts;
    try {
      accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
    } catch (err) {
      setTransactionError("Wallet connection rejected.");
      setIsWalletConnecting(false);
      return;
    }
    const addressFrom = accounts[0];
    setIsWalletConnecting(false);
    setIsTransactionPending(true);
    const id = Math.random().toString(36).substring(2, 15); // random id

    // mock github 用户和金额
    const users = [{ login: "wfnuser" }, { login: "null" }];
    const amounts = [1, 2];

    const githubIds = users.map((user) => user.login);
    const [symbol, decimals] = await distributor.getTokenSymbolAndDecimals();
    const amountsInWei = amounts.map((amount) =>
      BigInt(Math.floor(amount * 10 ** Number(decimals)))
    );
    const totalAmount = amountsInWei.reduce((a, b) => a + b, 0n);
    const currentAllowance = await distributor.getAllowance(addressFrom);
    const MIN_ALLOWANCE = BigInt(50) * BigInt(10) ** BigInt(decimals);
    if (currentAllowance < totalAmount) {
      await distributor.approveAllowance(MIN_ALLOWANCE * BigInt(10));
    }
    const tx = await distributor.createRedPacket(id, githubIds, amountsInWei);
    setTransactionHash(tx.hash);
    setIsTransactionPending(false);
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
            // 处理markdown内容
            overview:
              typeof card.overview === "string"
                ? card.overview
                    .replace(/\\n/g, "\n")
                    .replace(/^"/, "")
                    .replace(/"$/, "")
                : "No overview available",
            tools:
              typeof card.tools === "string"
                ? (card.tools as string)
                    .replace(/\\n/g, "\n")
                    .replace(/^"/, "")
                    .replace(/"$/, "") // Clean up any quotes and replace escaped newlines
                : Object.entries(card.tools)
                    .map(
                      ([key, value]) =>
                        `## ${key}\n\n${String(value).replace(/\\n/g, "\n")}`
                    )
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
            overview: "Information about this server is currently unavailable.",
            tools: "No tools information available.",
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
          overview: "There was an error loading information about this server.",
          tools: "No tools information available.",
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
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
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

        {/* Server header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 font-cyberpunk text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-pink-600 dark:from-cyan-400 dark:to-pink-500">
            {server.title}
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
                        }}
                      >
                        {server.tools}
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
            {/* Transfer ETH button - 只在服务器不存在且未进行支付时显示 */}
            {showTransferButton && !transactionHash && (
              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-cyberpunk border-0 h-12"
                onClick={handleTransferEth}
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
                    Pay MCP server hosting fee
                  </>
                )}
              </Button>
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
                  href={`https://optimism-sepolia.blockscout.com/tx/${transactionHash}`}
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
