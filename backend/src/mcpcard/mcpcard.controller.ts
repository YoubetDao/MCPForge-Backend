import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { McpCardService } from './mcpcard.service';
import { CreateMcpCardDto } from './dto/create-mcpcard.dto';
import { ImportMcpCardDto } from './dto/import-mcpcard.dto';
import { McpCard } from './entities/mcpcard.entity';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('mcpcard')
export class McpCardController {
  constructor(private readonly McpCardService: McpCardService) {}

  @Post()
  // @UseGuards(CookieAuthGuard, RolesGuard)
  // @Roles(UserRole.DEVELOPER)
  create(@Body() createMcpCardDto: CreateMcpCardDto): Promise<McpCard> {
    return this.McpCardService.create(createMcpCardDto);
  }

  @Post('import')
  // @UseGuards(CookieAuthGuard)
  import(@Body() importMcpCardDto: ImportMcpCardDto): Promise<McpCard> {
    console.log('importMcpCardDto', importMcpCardDto);
    return this.McpCardService.import(importMcpCardDto);
  }

  @Get()
  async findAll(): Promise<McpCard[]> {
    const result = await this.McpCardService.findAll();
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<McpCard> {
    return this.McpCardService.findOne(+id);
  }
}
