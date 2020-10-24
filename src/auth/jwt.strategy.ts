import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt'
import { UserRepository } from "./user.repository";
import { UnauthorizedException } from "@nestjs/common";
import { User } from "../entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtPayload } from "./jwt-payload.interface";
import * as config from 'config'
import { getConnection, getManager } from "typeorm";
import { UserDeviceDetail } from "src/entity/user-device-detail.entity";


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
        const user = await this.userRepository.findOne({ userId: user_id, status: 1 })
        if (!user)
            throw new UnauthorizedException();
        if (accessToken) {
            const userDevice = await getConnection()
                .createQueryBuilder(UserDeviceDetail, "device")
                .where(`user_id=:user_id AND  access_token=:accessToken`, { user_id, accessToken })
                .getOne();

            if (!userDevice) throw new UnauthorizedException();
        }
        return user;
    }
}