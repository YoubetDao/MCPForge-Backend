import { Controller, Get, Post, Body, Param, Query, Delete } from "@nestjs/common";
import { McpServerService } from "./mcpserver.service";

@Controller("mcpserver")
export class McpServerController {
    constructor(private readonly McpServerService: McpServerService) { }

    @Get()
    getMcpServerList() {    
        return this.McpServerService.getMcpServerList();
    }

    @Get(":name")
    getMcpServerByName(@Param("name") name: string) {
        return this.McpServerService.getMcpServerByName(name);
    }

    @Post()
    createMcpServer(@Body() name: string, @Body() image: string) {
        return this.McpServerService.createMcpServer(name, image);
    }

    @Delete(":name")
    deleteMcpServer(@Param("name") name: string) {
        return this.McpServerService.deleteMcpServer(name);
    }
}
