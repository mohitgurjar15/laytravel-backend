/*
 * Created on Tue May 12 2020
 *
 * @Auther:- Parth Virani
 * Copyright (c) 2020 Oneclick
 * my variables are ${myvar1} and ${myvar2}
 */

import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException, NotFoundException, RequestTimeoutException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entity/user.entity';
import { CreateUserDto } from './dto/crete-user.dto';
import { AuthCredentialDto } from './dto/auth-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { ForgetPasswordDto } from './dto/forget-paasword.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as jwt_decode from 'jwt-decode';
import * as crypto from "crypto"
import { forgetPass } from './forget-Pass.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { forget_password } from 'src/entity/forget-password.entity';
import { ForgetPassWordRepository } from './forget-password.repository';
import { Exception, escapeExpression } from 'handlebars';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService,
        private readonly mailerService: MailerService,
        @InjectRepository(ForgetPassWordRepository)
        private forgetPasswordRepository: ForgetPassWordRepository
    ) { }

    async signUp(createUser: CreateUserDto): Promise<User> {

        const { firstName,
            middleName,
            lastName,
            email,
            password,
            profilePic,
            gender,
            country,
            state,
            city,
            address,
            zipCode } = createUser;

        const salt = await bcrypt.genSalt();
        const user = new User();
        user.email = email;
        user.firstName = firstName;
        user.middleName = middleName || '';
        user.lastName = lastName;
        user.salt = salt;
        user.createdDate = new Date();
        user.updatedDate = new Date();
        user.password = await this.hashPassword(password, salt);
        user.profilePic = profilePic;
        /* user.gender = gender;
        user.country = country;
        user.state = state;
        user.city = city;
        user.address = address */
        user.zipCode = zipCode

        try {
            await user.save();
        } catch (error) {
            if (error.code == 'ER_DUP_ENTRY') {
                throw new ConflictException('Email Id Used');
            }
            else {
                throw new InternalServerErrorException(error.sqlMessage);
            }
        }
        delete user.password;
        delete user.salt;
        return user;
    }

    hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt)
    }

    async validateUserPassword(authCredentialDto: AuthCredentialDto) {

        const { email, password } = authCredentialDto;
        const user = await this.userRepository.findOne(
            { email }
        );
        console.log(user);
        if (user && await user.validatePassword(password)) {

            const payload: JwtPayload = {
                user_id: user.userId,
                email,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                salt: user.salt,
                profilePic: user.profilePic,
                /* gender: user.gender,
                country: user.country,
                state: user.state,
                city: user.city,
                address: user.address, */
                zipCode: user.zipCode,
            };
            const accessToken = this.jwtService.sign(payload);
            const token = { token: accessToken };
            return token
        }
        else {
            throw new UnauthorizedException("Invalid Credentials")
        }

    }

    async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
        const { email } = forgetPasswordDto;
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            throw new NotFoundException('Given Email Not Ragister');
        }


        var unixTimestamp = Math.round(new Date().getTime() / 1000);
        console.log('time:' + unixTimestamp);

        const tokenhash = crypto.createHmac('sha256', unixTimestamp.toString()).digest('hex');
        console.log('token===>' + tokenhash);

        const payload: forgetPass = {
            email,
            tokenhash
        };
        const forgetPassToken = this.jwtService.sign(payload);
        console.log(forgetPassToken);
        const resetLink = 'http://localhost:3000/v1/auth/forget-password?token=' + forgetPassToken + '&newPassword=1Boss67-';
        this.mailerService.sendMail({
            to: 'viraniparth00001@gmail.com',
            from: 'rajnee@itoneclick.com',
            subject: 'Forgot password',
            template: 'forgotEmail.html',
            context: {  // Data to be sent to template files.
                username: email,
                link: resetLink,
            }
        }).then(() => { })
            .catch(() => { });


        const row = new forget_password();
        row.email = email;
        row.token = tokenhash;
        row.createTime = new Date();
        row.updateTime = new Date();


        try {
            await row.save();
        } catch (error) {
            throw new InternalServerErrorException(error.sqlMessage);
        }
        return user;
    }

    async updatePassword(updatePasswordDto: UpdatePasswordDto) {
        const { token, newPassword } = updatePasswordDto;

        var decoded = jwt_decode(token);
        console.log(decoded)
        const { email, tokenhash, iat } = decoded
        const unixTimestamp = Math.round(new Date().getTime() / 1000);
        const time = unixTimestamp - iat;
        if (time >= 900) {
            throw new RequestTimeoutException('Token Is Expire Please Try Again')
        }
        const user = await this.userRepository.findOne({
            where: { email: email, isDeleted: 0 }
        });
        if (!user) {
            throw new NotFoundException('email not Found')
        }

        const validToken = await this.forgetPasswordRepository.findOne({
            where: { email: email, is_used: 0 }
        });
        if (validToken && validToken.validateToken(tokenhash)) {
            const salt = await bcrypt.genSalt();
            user.salt = salt;
            user.password = await this.hashPassword(newPassword, salt);
            validToken.is_used = 1;
            validToken.updateTime = new Date();
            try {
                await user.save();
                await validToken.save()
            }
            catch (error) {
                throw new InternalServerErrorException(error.sqlMessage);
            }
        }
        else {
            throw new BadRequestException('error while update Password:- Token Can Not Validate')
        }
    }

}
