import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetReferralId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        //console.log(JSON.stringify(request.connection));
        console.log(request.headers.referral_id);
        return request.headers.referral_id || '';
    }
);
