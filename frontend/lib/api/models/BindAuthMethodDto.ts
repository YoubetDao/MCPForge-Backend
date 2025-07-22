/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BindAuthMethodDto = {
    auth_type: BindAuthMethodDto.auth_type;
    auth_identifier: string;
};
export namespace BindAuthMethodDto {
    export enum auth_type {
        WEB3 = 'web3',
        GOOGLE = 'google',
        GITHUB = 'github',
    }
}

