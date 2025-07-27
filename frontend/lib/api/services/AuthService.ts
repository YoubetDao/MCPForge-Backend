/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * @returns any
     * @throws ApiError
     */
    public static authControllerGetCurrentUser(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/me',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static authControllerGetBearerToken(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/bearer-token',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static authControllerGetAuthStatus(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/status',
        });
    }
}
