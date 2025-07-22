/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateUserDto = {
    username?: string;
    email?: string;
    role?: UpdateUserDto.role;
    reward_address?: string;
};
export namespace UpdateUserDto {
    export enum role {
        USER = 'user',
        DEVELOPER = 'developer',
    }
}

