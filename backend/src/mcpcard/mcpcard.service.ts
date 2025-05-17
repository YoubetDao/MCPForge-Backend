import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DeepPartial } from "typeorm";
import { McpCard } from "./entities/mcpcard.entity";
import { ImportMcpCardDto } from "./dto/import-mcpcard.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class McpCardService {
  private httpClient: any;

  constructor(
    @InjectRepository(McpCard)
    private McpCardRepository: Repository<McpCard>,
    private configService: ConfigService
  ) {}

  async create(createMcpCardDto: DeepPartial<McpCard>): Promise<McpCard> {
    return this.McpCardRepository.save(
      this.McpCardRepository.create(createMcpCardDto)
    );
  }

  async findAll(): Promise<McpCard[]> {
    return this.McpCardRepository.find();
  }

  async findOne(id: number): Promise<McpCard> {
    const result = await this.McpCardRepository.findOneBy({ id });
    if (!result) {
      throw new NotFoundException(`McpCard with ID ${id} not found`);
    }
    return result as McpCard;
  }

  async import(importMcpCardDto: ImportMcpCardDto): Promise<McpCard> {
    try {
      // Normalize GitHub URL
      const githubUrl = this.normalizeGithubUrl(importMcpCardDto.github);

      // Get the Deepflow service URL from environment
      const deepflowServiceUrl = this.configService.get<string>(
        "DEEPFLOW_SERVICE_URL"
      );
      if (!deepflowServiceUrl) {
        throw new Error("DEEPFLOW_SERVICE_URL is not configured");
      }

      // Call Deepflow API to get MCP server details
      const response = await fetch(`${deepflowServiceUrl}/v1/mcp/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ github: githubUrl }),
      });

      if (!response.ok) {
        throw new Error(
          `Deepflow API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success || !data.mcpServerContent) {
        throw new Error("Failed to get MCP server content from Deepflow");
      }

      const serverContent = data.mcpServerContent;

      // Create a new McpCard with the data from Deepflow
      return this.create({
        name: serverContent.name,
        author: serverContent.author,
        github_url: githubUrl,
        tags: serverContent.tags,
        description: serverContent.description,
        overview: serverContent.overview,
        tools: serverContent.tools
          ? JSON.stringify(serverContent.tools)
          : undefined,
        docker_image: serverContent.dockerImage,
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
}
