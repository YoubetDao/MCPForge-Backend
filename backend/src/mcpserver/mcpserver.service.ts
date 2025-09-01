import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { McpServer } from './entities/mcpserver.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { K8sResponse } from './interfaces/k8s.interface';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { ParsedQs } from 'qs';

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
    private readonly configService: ConfigService,
  ) {
    this.K8S_API_HOST = this.configService.get<string>(
      'K8S_API_HOST',
      'https://34.80.208.87',
    );
    this.K8S_BEARER_TOKEN = this.configService.get<string>(
      'K8S_BEARER_TOKEN',
      '',
    );
  }

  private getK8sHeaders() {
    return {
      Accept: 'application/json',
      Authorization: `Bearer ${this.K8S_BEARER_TOKEN}`,
      'User-Agent': 'kubectl/v1.32.4 (linux/amd64) kubernetes/2917b10',
    };
  }

  private getHttpConfig() {
    return {
      headers: this.getK8sHeaders(),
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        secureProtocol: 'TLSv1_2_method',
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
          timeout: 5000,
        }),
      );
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      console.error(
        'Connection test failed:',
        error.code,
        error.syscall,
        error.address,
        error.port,
        error.response?.status,
        error.response?.data,
      );
      return {
        error: error.message,
        code: error.code,
        response: error.response?.data,
      };
    }
  }

  private makeDirectRequest(
    url: string,
    method: string = 'GET',
    body?: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(`Making direct ${method} request to: ${url}`);

      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: method,
        rejectUnauthorized: false,
        headers: {
          ...this.getK8sHeaders(),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };

      if (body) {
        const bodyStr = JSON.stringify(body);
        options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        console.log('Request body being sent:', bodyStr);
      }

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
            console.log('Response data:', JSON.stringify(parsedData, null, 2));
            if (res.statusCode >= 400) {
              const error = new Error(
                `HTTP ${res.statusCode}: ${parsedData.message || 'Unknown error'}`,
              );
              error['response'] = { data: parsedData };
              reject(error);
            } else {
              resolve(parsedData);
            }
          } catch (e) {
            console.error('Error parsing JSON:', e.message);
            reject(e);
          }
        });
      });

      req.on('error', (error: Error & { code?: string }) => {
        console.error('Direct request error:', error.message, error.code);
        reject(error);
      });

      if (body) {
        const bodyStr = JSON.stringify(body);
        req.write(bodyStr);
        console.log('Sent body:', bodyStr);
      }

      req.end();
    });
  }

  async getMcpServerList(queryParams: ParsedQs, user?: any) {
    try {
      // 尝试使用直接的HTTPS请求
      // convert queryParams to labelSelector
      let labelSelectors = Object.entries(queryParams)
        .map(([key, value]) => `${key}=${value}`);
      
      // 添加用户ID过滤
      if (user?.userId) {
        labelSelectors.push(`user=${user.userId}`);
      }
      
      const labelSelector = labelSelectors.join(',');
      console.log('labelSelector value as:', labelSelector);
      const url = `${this.K8S_API_HOST}/apis/${this.K8S_API_GROUP}/${this.K8S_API_VERSION}/namespaces/${this.K8S_NAMESPACE}/${this.K8S_RESOURCE}?limit=500&labelSelector=${labelSelector}`;
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
          this.httpService.get(url, config),
        );

        console.log('Response status:', response.status);
        return response.data;
      }
    } catch (error) {
      console.error(
        'All request methods failed:',
        error.code,
        error.syscall,
        error.address,
        error.port,
        error.response?.status,
        error.response?.data,
      );

      throw new HttpException(
        `Failed to list servers: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getMcpServerByName(name: string) {
    try {
      const url = `${this.K8S_API_HOST}/apis/${this.K8S_API_GROUP}/${this.K8S_API_VERSION}/namespaces/${this.K8S_NAMESPACE}/${this.K8S_RESOURCE}/${name}`;

      try {
        const directData = await this.makeDirectRequest(url);
        console.log('Direct request succeeded');
        return directData;
      } catch (directError) {
        console.error('Direct request failed:', directError.message);

        // If direct request fails, try the original method
        const connectionTest = await this.testConnection();
        console.log('Connection test result:', connectionTest);

        console.log(`Requesting via HttpService: ${url}`);

        const config = this.getHttpConfig();
        console.log('Request config:', JSON.stringify(config, null, 2));

        const response = await firstValueFrom(
          this.httpService.get(url, config),
        );

        console.log('Response status:', response.status);
        return response.data;
      }
    } catch (error) {
      console.error(
        'All request methods failed:',
        error.code,
        error.syscall,
        error.address,
        error.port,
        error.response?.status,
        error.response?.data,
      );

      throw new HttpException(
        `Failed to get server: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async createMcpServer(
    name: string,
    image: string,
    envs: object = {},
    labels: object = {},
    annotations: object = {},
    user: any,
  ) {
    console.log('createMcpServer', name, image, envs, labels, annotations);

    envs = envs || {};
    labels = labels || {};
    annotations = annotations || {};
    
    // 生成唯一资源名称：原始名称 + 用户ID + 随机数字
    let resourceName = name;
    if (user?.userId) {
      const randomNum = Math.floor(Math.random() * 10000); // 4位随机数
      resourceName = `${name}-${user.userId}-${randomNum}`.toLowerCase()
        .replace(/[^a-z0-9-]/g, '-') // 替换非法字符为连字符
        .replace(/-+/g, '-')         // 合并多个连字符
        .substring(0, 63);           // 限制长度
      annotations['original-name'] = name; // 保留原始名称
    }

    if (name === 'mcp4meme') {
      envs = {
        ...envs,
        BITQUERY_API_KEY:
          'ory_at_wnTc9_uxMrQGq48rkMnihSqaGpOQCCO76bJwjlKqb68.SsZB--RuAUSP09gZva4FnScLpfWDcv94xKwRF1GQkr8',
      };
    }
    let memory = name === 'wikipedia-mcp' ? '1Gi' : '2Gi';

    if (user) {
      labels['user'] = `${user.userId}`;
      annotations['username'] = user.username;
    }



    try {
      const url = `${this.K8S_API_HOST}/apis/${this.K8S_API_GROUP}/${this.K8S_API_VERSION}/namespaces/${this.K8S_NAMESPACE}/${this.K8S_RESOURCE}`;
      const envArray = Object.entries(envs).map(([key, value]) => ({
        name: key,
        value: value,
      }));
      const requestBody = {
        apiVersion: `${this.K8S_API_GROUP}/${this.K8S_API_VERSION}`,
        kind: 'MCPServer',
        metadata: {
          name: resourceName,
          namespace: this.K8S_NAMESPACE,
          labels,
          annotations,
        },
        spec: {
          image,
          permissionProfile: {
            name: 'network',
            type: 'builtin',
          },
          env: envArray,
          port: 8080,
          resources: {
            limits: {
              cpu: '1',
              memory: memory,
            },
            requests: {
              cpu: '1',
              memory: memory,
            },
          },
          transport: 'stdio',
        },
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      try {
        const directData = await this.makeDirectRequest(
          url,
          'POST',
          requestBody,
        );
        console.log('Direct request succeeded');
        return directData;
      } catch (directError) {
        console.error('Direct request failed:', directError.message);
        if (directError.response) {
          console.error('Error response:', directError.response.data);
        }

        // If direct request fails, try the original method
        const connectionTest = await this.testConnection();
        console.log('Connection test result:', connectionTest);

        console.log(`Requesting via HttpService: ${url}`);

        const config = this.getHttpConfig();
        console.log('Request config:', JSON.stringify(config, null, 2));

        const response = await firstValueFrom(
          this.httpService.post(url, requestBody, config),
        );

        console.log('Response status:', response.status);
        return response.data;
      }
    } catch (error) {
      console.error(
        'All request methods failed:',
        error.code,
        error.syscall,
        error.address,
        error.port,
        error.response?.status,
        error.response?.data,
      );

      throw new HttpException(
        `Failed to create server: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async deleteMcpServer(name: string) {
    try {
      const url = `${this.K8S_API_HOST}/apis/${this.K8S_API_GROUP}/${this.K8S_API_VERSION}/namespaces/${this.K8S_NAMESPACE}/${this.K8S_RESOURCE}/${name}`;

      try {
        const directData = await this.makeDirectRequest(url, 'DELETE');
        console.log('Direct request succeeded');
        return directData;
      } catch (directError) {
        console.error('Direct request failed:', directError.message);
        if (directError.response) {
          console.error('Error response:', directError.response.data);
        }

        // If direct request fails, try the original method
        const connectionTest = await this.testConnection();
        console.log('Connection test result:', connectionTest);

        console.log(`Requesting via HttpService: ${url}`);

        const config = this.getHttpConfig();
        console.log('Request config:', JSON.stringify(config, null, 2));

        const response = await firstValueFrom(
          this.httpService.delete(url, config),
        );

        console.log('Response status:', response.status);
        return response.data;
      }
    } catch (error) {
      console.error(
        'All request methods failed:',
        error.code,
        error.syscall,
        error.address,
        error.port,
        error.response?.status,
        error.response?.data,
      );

      throw new HttpException(
        `Failed to delete server: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
