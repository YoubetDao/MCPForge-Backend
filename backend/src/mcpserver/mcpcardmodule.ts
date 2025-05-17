import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { McpCardController } from "./mcpcard.controller";
import { McpServerController } from "./mcpserver.controller";
import { McpCardService } from "./mcpcard.service";
import { McpCard } from "./entities/mcpcard.entity";
import { McpServerService } from "./mcpserver.service";
@Module({
  imports: [TypeOrmModule.forFeature([McpCard]), HttpModule],
  controllers: [McpCardController, McpServerController],
  providers: [McpCardService, McpServerService],
  exports: [McpCardService, McpServerService],
})
export class McpserverModule {}
