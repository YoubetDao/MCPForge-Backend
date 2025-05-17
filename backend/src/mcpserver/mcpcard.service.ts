import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { McpCard } from "./entities/mcpcard.entity";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { CreateMcpCardDto } from "./dto/create-mcpcard.dto";
import { ImportMcpCardDto } from "./dto/import-mcpcard.dto";
import { GenerateMcpServerDto } from "./dto/generate-mcp-server.dto";
import { firstValueFrom } from "rxjs";

@Injectable()
export class McpCardService {
  private httpClient: any;

  constructor(
    @InjectRepository(McpCard)
    private McpCardRepository: Repository<McpCard>,
    httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    // Cast HttpService to any to avoid TypeScript errors
    this.httpClient = httpService;
  }

  async create(createMcpCardDto: CreateMcpCardDto): Promise<McpCard> {
    const McpCard = this.McpCardRepository.create(createMcpCardDto);
    return this.McpCardRepository.save(McpCard);
  }

  async findAll(): Promise<McpCard[]> {
    return this.McpCardRepository.find();
  }


  async findOne(id: number): Promise<McpCard> {
    const McpCard = await this.McpCardRepository.findOneBy({ id });
    if (!McpCard) {
      throw new NotFoundException(`McpCard with ID ${id} not found`);
    }
    return McpCard;
  }

  async import(importMcpCardDto: ImportMcpCardDto): Promise<McpCard> {
    try {
      // Normalize GitHub URL
      const githubUrl = this.normalizeGithubUrl(importMcpCardDto.github_url);
      return this.create({
        name: this.extractRepoName(githubUrl),
        github_url: githubUrl,
      });
    } catch (error) {
      throw new HttpException(
        `Failed to import MCP server: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private normalizeGithubUrl(url: string): string {
    // Convert URL to lowercase
    url = url.toLowerCase();

    // Handle GitHub short format (username/repo)
    if (!url.includes("://")) {
      // Remove @ prefix if present
      if (url.startsWith("@")) {
        url = url.substring(1);
      }

      // Check if the URL is in the format username/repo
      if (/^[^/]+\/[^/]+$/.test(url)) {
        return `https://github.com/${url}`;
      }
    }

    // Handle full URLs with @ prefix
    if (url.startsWith("@")) {
      url = url.substring(1);
    }

    return url;
  }

  private extractRepoName(githubUrl: string): string {
    // Extract repository name from GitHub URL
    const match = githubUrl.match(/github\.com\/[^/]+\/([^/]+)/);
    return match ? match[1] : "Unknown Repository";
  }

  private readonly fakeMcpGenerateData = {
    "apiVersion": "toolhive.stacklok.dev/v1alpha1",
    "kind": "MCPServer",
    "metadata": {
      "annotations": {
        "kubectl.kubernetes.io/last-applied-configuration": "{\"apiVersion\":\"toolhive.stacklok.dev/v1alpha1\",\"kind\":\"MCPServer\",\"metadata\":{\"annotations\":{},\"name\":\"wikipedia-fake\",\"namespace\":\"toolhive-system\"},\"spec\":{\"image\":\"docker.io/mcp/wikipedia-mcp:latest\",\"permissionProfile\":{\"name\":\"network\",\"type\":\"builtin\"},\"port\":8080,\"resources\":{\"limits\":{\"cpu\":\"2\",\"memory\":\"4Gi\"},\"requests\":{\"cpu\":\"2\",\"memory\":\"4Gi\"}},\"transport\":\"stdio\"}}\n"
      },
      "creationTimestamp": "2025-05-17T03:03:56Z",
      "generation": 1,
      "managedFields": [
        {
          "apiVersion": "toolhive.stacklok.dev/v1alpha1",
          "fieldsType": "FieldsV1",
          "fieldsV1": {
            "f:metadata": {
              "f:annotations": {
                ".": {},
                "f:kubectl.kubernetes.io/last-applied-configuration": {}
              }
            },
            "f:spec": {
              ".": {},
              "f:image": {},
              "f:permissionProfile": {
                ".": {},
                "f:name": {},
                "f:type": {}
              },
              "f:port": {},
              "f:resources": {
                ".": {},
                "f:limits": {
                  ".": {},
                  "f:cpu": {},
                  "f:memory": {}
                },
                "f:requests": {
                  ".": {},
                  "f:cpu": {},
                  "f:memory": {}
                }
              },
              "f:transport": {}
            }
          },
          "manager": "kubectl",
          "operation": "Update",
          "time": "2025-05-17T03:03:56Z"
        }
      ],
      "name": "wikipedia-fake3",
      "namespace": "toolhive-system",
      "resourceVersion": "1747451036751071007",
      "uid": "b2026bfa-ffff-408a-a781-d8d730afa5c5"
    },
    "spec": {
      "image": "docker.io/mcp/wikipedia-mcp:latest",
      "permissionProfile": {
        "name": "network",
        "type": "builtin"
      },
      "port": 8080,
      "resources": {
        "limits": {
          "cpu": "2",
          "memory": "4Gi"
        },
        "requests": {
          "cpu": "2",
          "memory": "4Gi"
        }
      },
      "transport": "stdio"
    }
  };

  fakeFindOneMcpserver = {
    "apiVersion": "toolhive.stacklok.dev/v1alpha1",
    "kind": "MCPServer",
    "metadata": {
        "annotations": {
            "kubectl.kubernetes.io/last-applied-configuration": "{\"apiVersion\":\"toolhive.stacklok.dev/v1alpha1\",\"kind\":\"MCPServer\",\"metadata\":{\"annotations\":{},\"name\":\"wikipedia-fake\",\"namespace\":\"toolhive-system\"},\"spec\":{\"image\":\"docker.io/mcp/wikipedia-mcp:latest\",\"permissionProfile\":{\"name\":\"network\",\"type\":\"builtin\"},\"port\":8080,\"resources\":{\"limits\":{\"cpu\":\"2\",\"memory\":\"4Gi\"},\"requests\":{\"cpu\":\"2\",\"memory\":\"4Gi\"}},\"transport\":\"stdio\"}}\n"
        },
        "creationTimestamp": "2025-05-17T03:03:56Z",
        "finalizers": [
            "mcpserver.toolhive.stacklok.dev/finalizer"
        ],
        "generation": 1,
        "managedFields": [
            {
                "apiVersion": "toolhive.stacklok.dev/v1alpha1",
                "fieldsType": "FieldsV1",
                "fieldsV1": {
                    "f:metadata": {
                        "f:annotations": {
                            ".": {},
                            "f:kubectl.kubernetes.io/last-applied-configuration": {}
                        }
                    },
                    "f:spec": {
                        ".": {},
                        "f:image": {},
                        "f:permissionProfile": {
                            ".": {},
                            "f:name": {},
                            "f:type": {}
                        },
                        "f:port": {},
                        "f:resources": {
                            ".": {},
                            "f:limits": {
                                ".": {},
                                "f:cpu": {},
                                "f:memory": {}
                            },
                            "f:requests": {
                                ".": {},
                                "f:cpu": {},
                                "f:memory": {}
                            }
                        },
                        "f:transport": {}
                    }
                },
                "manager": "kubectl",
                "operation": "Update",
                "time": "2025-05-17T03:03:56Z"
            },
            {
                "apiVersion": "toolhive.stacklok.dev/v1alpha1",
                "fieldsType": "FieldsV1",
                "fieldsV1": {
                    "f:metadata": {
                        "f:finalizers": {
                            ".": {},
                            "v:\"mcpserver.toolhive.stacklok.dev/finalizer\"": {}
                        }
                    }
                },
                "manager": "thv-operator",
                "operation": "Update",
                "time": "2025-05-17T03:03:56Z"
            },
            {
                "apiVersion": "toolhive.stacklok.dev/v1alpha1",
                "fieldsType": "FieldsV1",
                "fieldsV1": {
                    "f:status": {
                        ".": {},
                        "f:message": {},
                        "f:phase": {},
                        "f:url": {}
                    }
                },
                "manager": "thv-operator",
                "operation": "Update",
                "subresource": "status",
                "time": "2025-05-17T03:04:58Z"
            }
        ],
        "name": "wikipedia-fake3",
        "namespace": "toolhive-system",
        "resourceVersion": "1747451098190111007",
        "uid": "b2026bfa-ffff-408a-a781-d8d730afa5c5"
    },
    "spec": {
        "image": "docker.io/mcp/wikipedia-mcp:latest",
        "permissionProfile": {
            "name": "network",
            "type": "builtin"
        },
        "port": 8080,
        "resources": {
            "limits": {
                "cpu": "2",
                "memory": "4Gi"
            },
            "requests": {
                "cpu": "2",
                "memory": "4Gi"
            }
        },
        "transport": "stdio"
    },
    "status": {
        "message": "MCP server is starting",
        "phase": "Pending",
        "url": "http://34.80.187.36:8080/sse"
    }
}


  async generateService(
    generateServiceDto: GenerateMcpServerDto
  ): Promise<Record<string, any>> {
    try {
      // const { McpCard_id, user_id, config } = generateServiceDto;
      // const McpCard = await this.findOne(McpCard_id);

      // Return fake data instead of making actual API call
      return this.fakeMcpGenerateData;
    } catch (error) {
      throw new HttpException(
        `Failed to generate service: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getMcpServerByName(name: string): Promise<Record<string, any>> {
    return this.fakeFindOneMcpserver;
  }
}
