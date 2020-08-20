import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as jwt_decode from "jwt-decode";

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);


export const LogInUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        let authorization =  request.headers.authorization || "";
        if(authorization){

            authorization = jwt_decode(authorization);
        }
        
        return authorization;
    },
);