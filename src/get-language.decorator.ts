import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const getLanguage = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        var lang = request.headers['language']

        if(!lang)
        {
            lang = "en"
        }
        return lang;
    },
);