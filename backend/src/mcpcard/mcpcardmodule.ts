import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { McpCardController } from "./mcpcard.controller";
import { McpCardService } from "./mcpcard.service";
import { McpCard } from "./entities/mcpcard.entity";
import { AuthModule } from "../auth/auth.module";
@Module({
  imports: [TypeOrmModule.forFeature([McpCard]), HttpModule, AuthModule],
  controllers: [McpCardController],
  providers: [McpCardService],
  exports: [McpCardService],
})
export class McpCardModule {}
