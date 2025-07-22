/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class McpServerService {
    /**
     * @param name
     * @returns any
     * @throws ApiError
     */
    public static mcpServerControllerGetMcpServerByName(
        name: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mcpserver/{name}',
            path: {
                'name': name,
            },
        });
    }
    /**
     * @param name
     * @returns any
     * @throws ApiError
     */
    public static mcpServerControllerDeleteMcpServer(
        name: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/mcpserver/{name}',
            path: {
                'name': name,
            },
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static mcpServerControllerGetMcpServerList(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mcpserver',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static mcpServerControllerCreateMcpServer(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mcpserver',
        });
    }
}
