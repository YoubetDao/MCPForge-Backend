/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Web3AuthDto = {
    address: string;
    signature: string;
    nonce: string;
    username?: string;
    email?: string;
    role?: Web3AuthDto.role;
    reward_address?: string;
};
export namespace Web3AuthDto {
    export enum role {
        USER = 'user',
        DEVELOPER = 'developer',
    }
}

