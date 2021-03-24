import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserIpAddress = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return `${request.connection.remoteAddress}`;
    }
);
