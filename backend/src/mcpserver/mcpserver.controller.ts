import { Controller, Get, Post, Body, Param, Query, Delete } from "@nestjs/common";
import { McpServerService } from "./mcpserver.service";
import { K8sResponse } from "./interfaces/k8s.interface";

@Controller("mcpserver")
export class McpServerController {
    constructor(private readonly McpServerService: McpServerService) { }
    @Get(":name")
    getMcpServerByName(@Param("name") name: string): Promise<any> {
        return this.McpServerService.getMcpServerByName(name);
    }
    @Get()
    getMcpServerList(): Promise<K8sResponse> {
        return this.McpServerService.getMcpServerList();
    }



    @Post()
    createMcpServer(@Body() name: string, @Body() image: string): Promise<any> {
        return this.McpServerService.createMcpServer(name, image);
    }

    @Delete(":name")
    deleteMcpServer(@Param("name") name: string): Promise<any> {
        return this.McpServerService.deleteMcpServer(name);
    }
}
