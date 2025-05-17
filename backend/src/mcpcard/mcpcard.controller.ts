import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { McpCardService } from "./mcpcard.service";
import { CreateMcpCardDto } from "./dto/create-mcpcard.dto";
import { ImportMcpCardDto } from "./dto/import-mcpcard.dto";
import { McpCard } from "./entities/mcpcard.entity";

@Controller("mcpcard")
export class McpCardController {
  constructor(private readonly McpCardService: McpCardService) {}

  @Post()
  create(@Body() createMcpCardDto: CreateMcpCardDto): Promise<McpCard> {
    return this.McpCardService.create(createMcpCardDto);
  }

  @Post("import")
  import(@Body() importMcpCardDto: ImportMcpCardDto): Promise<McpCard> {
    return this.McpCardService.import(importMcpCardDto);
  }

  @Get()
  async findAll(): Promise<McpCard[]> {
    const result = await this.McpCardService.findAll();
    return result as McpCard[];
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<McpCard> {
    return this.McpCardService.findOne(+id);
  }
}
