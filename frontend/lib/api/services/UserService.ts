/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BindAuthMethodDto } from '../models/BindAuthMethodDto';
import type { CreateUserDto } from '../models/CreateUserDto';
import type { GitHubAuthDto } from '../models/GitHubAuthDto';
import type { UpdateUserDto } from '../models/UpdateUserDto';
import type { Web3AuthDto } from '../models/Web3AuthDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static userControllerCreate(
        requestBody: CreateUserDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static userControllerFindAll(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user',
        });
    }
    /**
     * @param authType Authentication type, e.g., web3, google, github
     * @param authIdentifier Unique identifier for the auth method
     * @returns any
     * @throws ApiError
     */
    public static userControllerFindByAuthMethod(
        authType: 'web3' | 'google' | 'github',
        authIdentifier: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/by-auth',
            query: {
                'auth_type': authType,
                'auth_identifier': authIdentifier,
            },
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static userControllerFindOne(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static userControllerUpdateUser(
        id: number,
        requestBody: UpdateUserDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/user/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static userControllerRemove(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/user/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static userControllerBindAuthMethod(
        id: number,
        requestBody: BindAuthMethodDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/{id}/bind-auth',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param redirectUri
     * @returns any
     * @throws ApiError
     */
    public static userControllerGithubAuth(
        redirectUri: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/auth/github',
            query: {
                'redirect_uri': redirectUri,
            },
        });
    }
    /**
     * @param code
     * @param state
     * @returns any
     * @throws ApiError
     */
    public static userControllerGithubCallback(
        code: string,
        state?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/auth/github/callback',
            query: {
                'code': code,
                'state': state,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static userControllerGithubCallbackPost(
        requestBody: GitHubAuthDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/auth/github/callback',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param address
     * @returns any
     * @throws ApiError
     */
    public static userControllerGetWeb3Challenge(
        address: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/auth/web3/challenge',
            query: {
                'address': address,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static userControllerVerifyWeb3Auth(
        requestBody: Web3AuthDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/auth/web3/verify',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
