import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt'
import { UserRepository } from "./user.repository";
import { NotAcceptableException, UnauthorizedException } from "@nestjs/common";
import { User } from "../entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtPayload } from "./jwt-payload.interface";
import * as config from 'config'


const jwtConfig = config.get('jwt');

export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConfig.SecretKey
        });
    }

    async validate(payload: JwtPayload): Promise<User> {

        const { user_id, accessToken } = payload;
        const user = await this.userRepository.findOne({ userId: user_id })
        if (!user)
            throw new UnauthorizedException();

        if (user.status != 1) {
            throw new UnauthorizedException(
                `Your account has been disabled. Please contact customerservice@laytrip.com.`
            );
        }
        if (user.isDeleted == true) {
            throw new UnauthorizedException(
                `Your account has been deleted. Please contact customerservice@laytrip.com.`
            );
        }

        if (!user.isVerified) {
            throw new NotAcceptableException(
                `Your email has been verified.&&&email&&&Your email has been verified.`
            );
        }

        // if (accessToken) {
        //     const userDevice = await getConnection()
        //         .createQueryBuilder(UserDeviceDetail, "device")
        //         .where(`user_id=:user_id AND  access_token=:accessToken`, { user_id, accessToken })
        //         .getOne();

        //     if (!userDevice) throw new UnauthorizedException();
        // }
        return user;
    }
}