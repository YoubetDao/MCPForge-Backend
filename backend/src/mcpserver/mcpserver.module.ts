import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { McpServerController } from "./mcpserver.controller";
import { McpServerService } from "./mcpserver.service";
import { McpServer } from "./entities/mcpserver.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([McpServer]),
    HttpModule,
    AuthModule,
  ],
  controllers: [McpServerController],
  providers: [McpServerService],
  exports: [McpServerService],
})
export class McpserverModule {} 
