/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMcpCardDto } from '../models/CreateMcpCardDto';
import type { ImportMcpCardDto } from '../models/ImportMcpCardDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class McpCardService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static mcpCardControllerCreate(
        requestBody: CreateMcpCardDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mcpcard',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static mcpCardControllerFindAll(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mcpcard',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static mcpCardControllerImport(
        requestBody: ImportMcpCardDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mcpcard/import',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static mcpCardControllerFindOne(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mcpcard/{id}',
            path: {
                'id': id,
            },
        });
    }
}
