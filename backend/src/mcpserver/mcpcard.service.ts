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

  async generateService(
    generateServiceDto: GenerateMcpServerDto
  ): Promise<Record<string, any>> {
    try {
      const { McpCard_id, user_id, config } = generateServiceDto;
      const McpCard = await this.findOne(McpCard_id);

      // Call Kubernetes API to create/get resource
      const k8sResponse = await firstValueFrom(
        this.httpClient.post(
          `${this.configService.get("KUBERNETES_API_URL")}/resources`,
          {
            card: McpCard,
            user_id,
            config,
          }
        )
      );

      return k8sResponse.data;
    } catch (error) {
      throw new HttpException(
        `Failed to generate service: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
