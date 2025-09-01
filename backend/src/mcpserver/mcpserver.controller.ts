import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { McpServerService } from './mcpserver.service';
import { K8sResponse } from './interfaces/k8s.interface';
import { Request } from 'express';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SessionPayload } from '../auth/auth.service';

@Controller('mcpserver')
// @UseGuards(CookieAuthGuard)
export class McpServerController {
  constructor(private readonly McpServerService: McpServerService) {}

  @Get(':name')
  getMcpServerByName(
    @Param('name') name: string,
    @CurrentUser() user: SessionPayload,
  ): Promise<any> {
    return this.McpServerService.getMcpServerByName(name);
  }

  @Get()
  getMcpServerList(
    @Req() req: Request,
    @CurrentUser() user: SessionPayload,
  ): Promise<K8sResponse> {
    // any query params
    const queryParams = req.query;
    return this.McpServerService.getMcpServerList(queryParams, user);
  }

  @Post()
  createMcpServer(
    @Body('name') name: string,
    @Body('image') image: string,
    @Body('envs') envs: object = {},
    @Body('labels') labels: object = {},
    @Body('annotations') annotations: object = {},
    @CurrentUser() user: SessionPayload,
  ): Promise<any> {
    return this.McpServerService.createMcpServer(
      name,
      image,
      envs,
      labels,
      annotations,
      user,
    );
  }

  @Delete(':name')
  deleteMcpServer(
    @Param('name') name: string,
    @CurrentUser() user: SessionPayload,
  ): Promise<any> {
    return this.McpServerService.deleteMcpServer(name);
  }
}
