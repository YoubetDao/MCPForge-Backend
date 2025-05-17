import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { McpCardController } from "./mcpcard.controller";
import { McpCardService } from "./mcpcard.service";
import { McpCard } from "./entities/mcpcard.entity";

@Module({
  imports: [TypeOrmModule.forFeature([McpCard]), HttpModule],
  controllers: [McpCardController],
  providers: [McpCardService],
  exports: [McpCardService],
})
export class McpserverModule {}
