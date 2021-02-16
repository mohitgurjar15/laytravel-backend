import {  createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt_decode from "jwt-decode";
import * as config from "config";
const jwtConfig = config.get("jwt");

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);


export const LogInUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        let authorization = request.headers.authorization || "";
        if (authorization) {

            authorization = jwt_decode(authorization);
            //console.log(authorization);
            
            const { user_id, iat } = authorization;

            // const user = await this.userRepository.findOne({ userId: user_id })
            // if (!user)
            //     throw new UnauthorizedException();

            // if (user.status != 1) {
            //     throw new UnauthorizedException(
            //         `Your account has been disabled. Please contact administrator person.`
            //     );
            // }
            // if (user.isDeleted == true) {
            //     throw new UnauthorizedException(
            //         `Your account has been deleted. Please contact administrator person.`
            //     );
            // }

            // if (!user.isVerified) {
            //     throw new NotAcceptableException(
            //         `Please verify your email id&&&email&&&Please verify your email id`
            //     );
            // }

            const unixTimestamp = Math.round(new Date().getTime() / 1000);
            const time = unixTimestamp - iat;
            if (time >= jwtConfig.ExpireIn) {
                throw new UnauthorizedException();
            }
        }
        return authorization;
    },
);