import type { MCPCard } from "@/types/mcpcard";

// API base URL - should be environment variable in production
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8443";
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
    const response = await fetch(`${API_BASE_URL}/mcpcard`, {
      credentials: 'include', // 包含 cookies
    });

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
    const response = await fetch(`${API_BASE_URL}/mcpcard/${id}`, {
      credentials: 'include', // 包含 cookies
    });

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
    console.log(`Starting MCP server: name=${name}, image=${image}`);

    // Ensure empty objects for envs, labels, and annotations to avoid undefined values
    const requestBody = {
      name,
      image,
      envs: {},
      labels: {},
      annotations: {},
    };

    console.log("Request payload:", JSON.stringify(requestBody));

    const response = await fetch(`${API_BASE_URL}/mcpserver`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "Cache-Control": "no-cache", // Prevent caching
      },
      credentials: 'include', // 包含 cookies
      body: JSON.stringify(requestBody),
    });

    console.log(`Server creation response status: ${response.status}`);

    // Try to parse JSON response, but handle non-JSON responses
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      console.log("Response data:", data);
    } else {
      const text = await response.text();
      console.log("Response text:", text);
      // Create a simple object for non-JSON responses
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Failed to start MCP server (${response.status})`
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to start MCP server:", error);
    // Re-throw with a more descriptive message
    if (error instanceof Error) {
      throw new Error(`MCP server creation failed: ${error.message}`);
    } else {
      throw new Error("MCP server creation failed due to an unknown error");
    }
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

    console.log("Server status response code:", response.status);

    // 如果是404或其他错误状态码，直接返回不存在
    if (response.status === 404 || !response.ok) {
      console.log(
        `Server ${serverName} does not exist (status: ${response.status})`
      );
      return { exists: false };
    }

    try {
      const data: MCPServerResponse = await response.json();
      console.log("Server status data:", data);

      // 检查是否有完整的状态数据
      if (!data || !data.status) {
        console.log(`Server ${serverName} exists but has no status data`);
        return { exists: true };
      }

      // 返回服务器状态和URL
      return {
        exists: true,
        url: data.status?.url,
        phase: data.status?.phase,
      };
    } catch (jsonError) {
      console.error("Error parsing server status JSON:", jsonError);
      return { exists: false };
    }
  } catch (error) {
    console.error("Network error checking server status:", error);
    return { exists: false };
  }
}

export async function pollServerStatus(serverName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes at 2 seconds per attempt
    const delayMs = 2000; // Poll every 2 seconds

    console.log(`Starting to poll status for server: ${serverName}`);

    const checkInterval = setInterval(async () => {
      attempts++;
      try {
        console.log(
          `Polling attempt ${attempts}/${maxAttempts} for ${serverName}`
        );

        const response = await fetch(`${API_BASE_URL}/mcpserver/${serverName}`, {
          credentials: 'include', // 包含 cookies
        });

        // Handle non-200 responses
        if (!response.ok) {
          console.log(`Poll received status ${response.status}`);
          if (response.status === 404) {
            console.log("Server not found during polling");
            // Continue polling - the server might not be registered yet
            return;
          }

          // For other errors, try to get response text
          const errorText = await response.text();
          console.log(`Error response: ${errorText}`);
          return; // Continue polling
        }

        // Parse response data
        let data: MCPServerResponse;
        try {
          data = await response.json();
          console.log(
            `Polling server status (attempt ${attempts}):`,
            data.status?.phase || "No phase",
            data.status?.url || "No URL"
          );
        } catch (jsonError) {
          console.error(
            "Error parsing JSON response during polling:",
            jsonError
          );
          return; // Continue polling
        }

        // 只有当状态为 Running 且有 URL 时才认为服务器准备就绪
        if (data.status?.phase === "Running" && data.status?.url) {
          console.log(
            `Server ${serverName} is now running with URL: ${data.status.url}`
          );
          clearInterval(checkInterval);
          resolve(data.status.url);
        } else if (data.status?.phase === "Failed") {
          // If server status is Failed, stop polling
          console.error(
            `Server ${serverName} failed to start: ${
              data.status?.message || "Unknown error"
            }`
          );
          clearInterval(checkInterval);
          reject(
            new Error(
              `Server failed to start: ${
                data.status?.message || "Unknown error"
              }`
            )
          );
        }
      } catch (error) {
        console.error(
          `Error polling server status (attempt ${attempts}):`,
          error
        );
      }

      // Check if we've exceeded max attempts
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log(
          `Exceeded maximum number of polling attempts (${maxAttempts})`
        );
        reject(
          new Error(
            `Server startup timeout after ${
              maxAttempts * (delayMs / 1000)
            } seconds`
          )
        );
      }
    }, delayMs);

    // Safety timeout in case the interval somehow doesn't clear properly
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log("Polling safety timeout reached");
      reject(new Error("Server startup absolute timeout reached"));
    }, maxAttempts * delayMs + 10000); // Add 10 seconds buffer
  });
}

export async function deleteMCPServer(serverName: string): Promise<void> {
  try {
    console.log("Deleting MCP server:", serverName);
    const response = await fetch(`${API_BASE_URL}/mcpserver/${serverName}`, {
      method: "DELETE",
      headers: {
        "Cache-Control": "no-cache", // Prevent caching
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    console.log(`Delete response status: ${response.status}`);

    // Try to parse the response, but handle non-JSON responses gracefully
    let errorMessage = `Failed to delete server: ${response.statusText}`;

    if (!response.ok) {
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("Delete error response:", data);
          errorMessage = data.message || errorMessage;
        } else {
          const text = await response.text();
          console.log("Delete error text:", text);
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      } catch (parseError) {
        // If we can't parse the response, just throw with the status text
        throw new Error(`Failed to delete server: ${response.statusText}`);
      }
    }

    console.log("Server deleted successfully");
  } catch (error) {
    console.error("Error deleting MCP server:", error);
    // Rethrow with a better message
    if (error instanceof Error) {
      throw new Error(`Failed to delete MCP server: ${error.message}`);
    } else {
      throw new Error("Failed to delete MCP server due to an unknown error");
    }
  }
}
