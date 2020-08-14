import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt} from 'passport-jwt'
import { UserRepository } from "./user.repository";
import { UnauthorizedException } from "@nestjs/common";
import { User } from "../entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtPayload } from "./jwt-payload.interface";
import * as config from 'config'


const jwtConfig = config.get('jwt');

export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(
        @InjectRepository(UserRepository)
        private userRepository:UserRepository
    ){
        super({
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey:jwtConfig.SecretKey
        });
    }

    async validate(payload:JwtPayload):Promise<User>{

        const { user_id} = payload;
        const user = await this.userRepository.findOne({userId:user_id, status:1})
        if(!user)
            throw new UnauthorizedException();
        
        return user;
    }
}