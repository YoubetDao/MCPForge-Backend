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
import { K8sResponse } from "./interfaces/k8s.interface";
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

@Injectable()
export class McpServerService {
    private readonly K8S_API_GROUP = 'toolhive.stacklok.dev';
    private readonly K8S_API_VERSION = 'v1alpha1';
    private readonly K8S_NAMESPACE = 'toolhive-system';
    private readonly K8S_RESOURCE = 'mcpservers';
    private readonly K8S_API_HOST: string;
    private readonly K8S_BEARER_TOKEN: string;

    constructor(
        @InjectRepository(McpServer)
        private McpServerRepository: Repository<McpServer>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.K8S_API_HOST = this.configService.get<string>('K8S_API_HOST', 'https://34.80.208.87');
        this.K8S_BEARER_TOKEN = this.configService.get<string>('K8S_BEARER_TOKEN', '');
    }

    private getK8sHeaders() {
        return {
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.K8S_BEARER_TOKEN}`,
            'User-Agent': 'kubectl/v1.32.4 (linux/amd64) kubernetes/2917b10'
        };
    }

    private getHttpConfig() {
        return {
            headers: this.getK8sHeaders(),
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
                secureProtocol: 'TLSv1_2_method'
            }),
            timeout: 10000,
            maxRedirects: 5,
        };
    }

    async testConnection() {
        try {
            const url = `${this.K8S_API_HOST}/healthz`;
            console.log(`Testing connection to: ${url}`);
            const response = await firstValueFrom(
                this.httpService.get(url, {
                    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                    timeout: 5000
                })
            );
            return {
                status: response.status,
                data: response.data
            };
        } catch (error) {
            console.error('Connection test failed:', 
                error.code, 
                error.syscall, 
                error.address, 
                error.port,
                error.response?.status,
                error.response?.data
            );
            return {
                error: error.message,
                code: error.code,
                response: error.response?.data
            };
        }
    }

    private makeDirectRequest(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(`Making direct request to: ${url}`);
            
            const parsedUrl = new URL(url);
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: `${parsedUrl.pathname}${parsedUrl.search}`,
                method: 'GET',
                rejectUnauthorized: false,
                headers: this.getK8sHeaders()
            };
            
            console.log('Request options:', JSON.stringify(options, null, 2));
            
            const req = https.request(options, (res) => {
                console.log(`Status Code: ${res.statusCode}`);
                console.log(`Headers: ${JSON.stringify(res.headers)}`);
                
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log('Response data length:', data.length);
                    try {
                        const parsedData = data ? JSON.parse(data) : {};
                        resolve(parsedData);
                    } catch (e) {
                        console.error('Error parsing JSON:', e.message);
                        resolve({ raw: data });
                    }
                });
            });
            
            req.on('error', (error: Error & { code?: string }) => {
                console.error('Direct request error:', error.message, error.code);
                reject(error);
            });
            
            req.end();
        });
    }

    async getMcpServerList() {
        try {
            // 尝试使用直接的HTTPS请求
            const url = `${this.K8S_API_HOST}/apis/${this.K8S_API_GROUP}/${this.K8S_API_VERSION}/namespaces/${this.K8S_NAMESPACE}/${this.K8S_RESOURCE}?limit=500`;
            
            try {
                const directData = await this.makeDirectRequest(url);
                console.log('Direct request succeeded');
                return directData;
            } catch (directError) {
                console.error('Direct request failed:', directError.message);
                
                // 如果直接请求失败，尝试原来的方法
                const connectionTest = await this.testConnection();
                console.log('Connection test result:', connectionTest);
                
                console.log(`Requesting via HttpService: ${url}`);
                
                const config = this.getHttpConfig();
                console.log('Request config:', JSON.stringify(config, null, 2));
                
                const response = await firstValueFrom(
                    this.httpService.get(url, config)
                );
                
                console.log('Response status:', response.status);
                return response.data;
            }
        } catch (error) {
            console.error('All request methods failed:', 
                error.code, 
                error.syscall, 
                error.address, 
                error.port,
                error.response?.status,
                error.response?.data
            );
            
            throw new HttpException(
                `Failed to list servers: ${error.message}`,
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    async getMcpServerByName(name: string) {
        try {
            const url = `${this.K8S_API_HOST}/apis/${this.K8S_API_GROUP}/${this.K8S_API_VERSION}/namespaces/${this.K8S_NAMESPACE}/${this.K8S_RESOURCE}/${name}`;
            const response = await firstValueFrom(
                this.httpService.get(url, this.getHttpConfig())
            );
            return response.data;
        } catch (error) {
            console.error('K8s API Error:', error.response?.status, error.response?.data || error.message);
            throw new HttpException(
                `Failed to get server: ${error.message}`,
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    async createMcpServer(name: string, image: string) {
        try {
            const url = `${this.K8S_API_HOST}/apis/${this.K8S_API_GROUP}/${this.K8S_API_VERSION}/namespaces/${this.K8S_NAMESPACE}/${this.K8S_RESOURCE}`;
            const response = await firstValueFrom(
                this.httpService.post(url, { image }, this.getHttpConfig())
            );
            return response.data;
        } catch (error) {
            console.error('K8s API Error:', error.response?.status, error.response?.data || error.message);
            throw new HttpException(
                `Failed to create server: ${error.message}`,
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    async deleteMcpServer(name: string) {
        try {
            const url = `${this.K8S_API_HOST}/apis/${this.K8S_API_GROUP}/${this.K8S_API_VERSION}/namespaces/${this.K8S_NAMESPACE}/${this.K8S_RESOURCE}/${name}`;
            const response = await firstValueFrom(
                this.httpService.delete(url, this.getHttpConfig())
            );
            return response.data;
        } catch (error) {
            console.error('K8s API Error:', error.response?.status, error.response?.data || error.message);
            throw new HttpException(
                `Failed to delete server: ${error.message}`,
                HttpStatus.BAD_GATEWAY
            );
        }
    }
}
