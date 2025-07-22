/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateUserDto = {
    username: string;
    email?: string;
    role?: CreateUserDto.role;
    reward_address?: string;
    auth_type: CreateUserDto.auth_type;
    auth_identifier: string;
};
export namespace CreateUserDto {
    export enum role {
        USER = 'user',
        DEVELOPER = 'developer',
    }
    export enum auth_type {
        WEB3 = 'web3',
        GOOGLE = 'google',
        GITHUB = 'github',
    }
}

