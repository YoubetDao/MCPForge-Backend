import {
    Injectable,
    NotFoundException,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { McpServer } from "./entities/mcpserver.entity";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

interface K8sResponse {
    data: any;
}

@Injectable()
export class McpServerService {
    private readonly httpClient: any;
    private readonly K8S_API_GROUP = 'toolhive.stacklok.dev';
    private readonly K8S_API_VERSION = 'v1alpha1';
    private readonly K8S_NAMESPACE = 'toolhive-system';
    private readonly K8S_RESOURCE = 'mcpservers';
    private readonly K8S_API_HOST: string;
    private readonly K8S_BEARER_TOKEN: string;
    constructor(
        @InjectRepository(McpServer)
        private McpServerRepository: Repository<McpServer>,
        httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.httpClient = httpService;
        this.K8S_API_HOST = this.configService.get<string>('K8S_API_HOST', 'https://34.80.208.87');
        this.K8S_BEARER_TOKEN = this.configService.get<string>('K8S_BEARER_TOKEN', '');
    }

    makeK8sClient(name: string = 'wikipedia-fake3') {
        const baseUrl = `${this.K8S_API_HOST}/apis/${this.K8S_API_GROUP}/${this.K8S_API_VERSION}/namespaces/${this.K8S_NAMESPACE}/${this.K8S_RESOURCE}`;
        const headers = {
            'Authorization': `Bearer ${this.K8S_BEARER_TOKEN}`,
            'Accept': 'application/json',
            'User-Agent': 'kubectl/v1.32.4 (linux/amd64) kubernetes/2917b10'
        };
        return {
            getServer: async (): Promise<K8sResponse> => {
                return firstValueFrom(
                    this.httpClient.get(`${baseUrl}/${name}`, { headers })
                );
            },
            listServers: async (): Promise<K8sResponse> => {
                return firstValueFrom(
                    this.httpClient.get(baseUrl + `?limit=500`, { headers })
                );
            },
            createServer: async (image: string): Promise<K8sResponse> => {
                return firstValueFrom(
                    this.httpClient.post(baseUrl, { image }, { headers })
                );
            },
            deleteServer: async (serverName: string): Promise<K8sResponse> => {
                return firstValueFrom(
                    this.httpClient.delete(`${baseUrl}/${serverName}`, { headers })
                );
            }
        };
    }

    async getMcpServerList() {
        const k8sClient = this.makeK8sClient();
        const response = await k8sClient.listServers();
        return response;
    }

    async getMcpServerByName(name: string) {
        const k8sClient = this.makeK8sClient(name);
        const response = await k8sClient.getServer();
        return response.data;
    }

    async createMcpServer(name: string, image: string) {
        const k8sClient = this.makeK8sClient(name);
        const response = await k8sClient.createServer(image);
        return response.data;
    }


    async deleteMcpServer(name: string) {
        const k8sClient = this.makeK8sClient(name);
        const response = await k8sClient.deleteServer(name);
        return response.data;
    }



    // get mcp server list
    // get mcp server by name
    // create mcp server
}
