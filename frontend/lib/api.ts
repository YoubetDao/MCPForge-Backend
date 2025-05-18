import type { MCPCard } from "@/types/mcpcard";

// API base URL - should be environment variable in production
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5190";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "your-default-api-key";

// Mock data to use when API is unavailable
const mockMCPCards: MCPCard[] = [
  {
    id: 1,
    name: "GitHub",
    github_url: "https://github.com/mcp-plugins/github",
    description:
      "Repository management, file operations, and GitHub API integration",
    overview:
      "The GitHub MCP Server provides a bridge between AI assistants and GitHub repositories, allowing for seamless interaction with code, issues, and pull requests.",
    tools: {
      repository: "Manage GitHub repositories",
      issues: "Create and manage issues",
      "pull-requests": "Handle pull requests",
      code: "Access and modify code",
    },
    price: "Free",
    configs: {},
    docker_image: "mcpso/github:latest",
    mcp_servers: {},
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "EdgeOne Pages MCP",
    github_url: "https://github.com/mcp-plugins/edgeone",
    description:
      "An MCP service designed for deploying HTML content to EdgeOne Pages and obtaining an accessible public URL",
    overview:
      "EdgeOne Pages MCP allows AI assistants to deploy static websites and preview HTML content with a public URL.",
    tools: {
      deploy: "Deploy HTML content to EdgeOne Pages",
      preview: "Generate preview links for content",
    },
    price: "Free",
    configs: {},
    docker_image: "mcpso/edgeone:latest",
    mcp_servers: {},
    created_at: "2023-02-15T00:00:00Z",
    updated_at: "2023-02-15T00:00:00Z",
  },
  {
    id: 3,
    name: "MiniMax MCP",
    github_url: "https://github.com/mcp-plugins/minimax",
    description:
      "Official MiniMax Model Context Protocol (MCP) server that enables interaction with powerful Text to Speech, Image generation",
    overview:
      "MiniMax MCP provides AI assistants with access to MiniMax's suite of AI capabilities including text-to-speech and image generation.",
    tools: {
      tts: "Convert text to natural-sounding speech",
      "image-gen": "Generate images from text descriptions",
    },
    price: "Pay-as-you-go",
    configs: {},
    docker_image: "mcpso/minimax:latest",
    mcp_servers: {},
    created_at: "2023-03-10T00:00:00Z",
    updated_at: "2023-03-10T00:00:00Z",
  },
  {
    id: 4,
    name: "Amap Maps",
    github_url: "https://github.com/mcp-plugins/amap",
    description: "高德地图方 MCP Server",
    overview:
      "Amap Maps MCP Server provides location-based services and mapping capabilities for AI assistants.",
    tools: {
      geocoding: "Convert addresses to coordinates",
      routing: "Calculate routes between locations",
      poi: "Find points of interest",
    },
    price: "Free tier available",
    configs: {},
    docker_image: "mcpso/amap:latest",
    mcp_servers: {},
    created_at: "2023-04-05T00:00:00Z",
    updated_at: "2023-04-05T00:00:00Z",
  },
];

export async function getMCPCards(): Promise<MCPCard[]> {
  try {
    // First try to fetch from the API
    const response = await fetch(`${API_BASE_URL}/mcpcard`);

    if (!response.ok) {
      console.warn(
        `API returned status ${response.status}, using mock data instead`
      );
      return [...mockMCPCards];
    }

    return await response.json();
  } catch (error) {
    console.warn(
      "Failed to fetch MCP cards from API, using mock data instead:",
      error
    );
    return [...mockMCPCards];
  }
}

export async function getMCPCardById(id: number): Promise<MCPCard | null> {
  try {
    // First try to fetch from the API
    const response = await fetch(`${API_BASE_URL}/mcpcard/${id}`);

    if (!response.ok) {
      console.warn(
        `API returned status ${response.status}, using mock data instead`
      );
      // Return the matching mock card if available
      return mockMCPCards.find((card) => card.id === id) || null;
    }

    return await response.json();
  } catch (error) {
    console.warn(
      `Failed to fetch MCP card with ID ${id}, using mock data instead:`,
      error
    );
    // Return the matching mock card if available
    return mockMCPCards.find((card) => card.id === id) || null;
  }
}

export async function startMCPServer(name: string, image: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/mcpserver`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ name, image }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to start MCP server");
    }

    return data;
  } catch (error) {
    console.error("Failed to start MCP server:", error);
    throw error;
  }
}

interface MCPServerResponse {
  apiVersion: string;
  kind: string;
  metadata: {
    creationTimestamp: string;
    finalizers: string[];
    generation: number;
    name: string;
    namespace: string;
    resourceVersion: string;
    uid: string;
  };
  spec: {
    image: string;
    permissionProfile: {
      name: string;
      type: string;
    };
    port: number;
    resources: {
      limits: {
        cpu: string;
        memory: string;
      };
      requests: {
        cpu: string;
        memory: string;
      };
    };
    transport: string;
  };
  status: {
    message: string;
    phase: string;
    url: string;
  };
}

export async function checkMCPServerStatus(
  serverName: string
): Promise<{ exists: boolean; url?: string; phase?: string }> {
  try {
    if (!serverName) {
      console.error("Server name is empty");
      return { exists: false };
    }

    console.log("Checking server status for:", serverName);
    const response = await fetch(`${API_BASE_URL}/mcpserver/${serverName}`);

    console.log("Server status response:", response.status);

    // 如果是404，直接返回不存在
    if (response.status === 404) {
      return { exists: false };
    }

    const data: MCPServerResponse = await response.json();
    console.log("Server status data:", data);

    // 返回服务器状态和URL
    return {
      exists: true,
      url: data.status?.url,
      phase: data.status?.phase,
    };
  } catch (error) {
    console.error("Error checking server status:", error);
    return { exists: false };
  }
}

export async function pollServerStatus(serverName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/mcpserver/${serverName}`);
        const data: MCPServerResponse = await response.json();

        console.log("Polling server status:", data);

        // 只有当状态为 Running 且有 URL 时才认为服务器准备就绪
        if (data.status?.phase === "Running" && data.status?.url) {
          clearInterval(checkInterval);
          resolve(data.status.url);
        }
      } catch (error) {
        console.error("Error polling server status:", error);
      }
    }, 1000); // 每秒轮询一次

    // 设置2分钟超时
    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error("Server startup timeout after 2 minutes"));
    }, 120000); // 120s = 2min
  });
}

export async function deleteMCPServer(serverName: string): Promise<void> {
  try {
    console.log("Deleting MCP server:", serverName);
    const response = await fetch(`${API_BASE_URL}/mcpserver/${serverName}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.message || `Failed to delete server: ${response.statusText}`
      );
    }

    console.log("Server deleted successfully");
  } catch (error) {
    console.error("Error deleting MCP server:", error);
    throw error;
  }
}
