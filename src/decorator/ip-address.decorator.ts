import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserIpAddress = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        //console.log(JSON.stringify(request.connection));
        console.log(request.connection.remoteAddress);
        return `${request.connection.remoteAddress}`;
    }
);
