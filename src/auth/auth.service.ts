/*
 * Created on Tue May 12 2020
 *
 * @Auther:- Parth Virani
 * Copyright (c) 2020 Oneclick
 * my variables are ${myvar1} and ${myvar2}
 */

import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException, Req } from '@nestjs/common';
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
import { v4 as uuidv4 } from "uuid";
import { NewPasswordDto } from './dto/new-password.dto';
import { errorMessage } from 'src/config/common.config';
import { MobileAuthCredentialDto } from './dto/mobile-auth-credentials.dto';
import { UserDeviceDetail } from 'src/entity/user-device-detail.entity';
import { SocialLoginDto } from './dto/social-login.dto'
import * as md5 from "md5";
import { In, getConnection } from 'typeorm';
import { LoginLog } from 'src/entity/login-log.entity';

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

    async signUp(createUser: CreateUserDto,request) {

        const { 
            first_name,last_name,
            email,password,
            gender,
            signup_via, device_type, device_token, os_version, 
            app_version,device_model
        } = createUser;

        let loginvia='';
        const userExist =await this.userRepository.findOne({
            email : email
        })

        if(userExist)
            throw new ConflictException(`This email address is already registered with us. Please enter different email address .`);
        
        const user = new User();
        const salt = await bcrypt.genSalt();
        user.userId = uuidv4();
        user.accountType=1;
        user.email = email;
        user.firstName = first_name;
        user.lastName = last_name;
        user.gender = "";
        user.salt = salt;
        user.createdDate = new Date();
        user.updatedDate = new Date();
        user.socialAccountId="";
        user.roleId=2;
        user.phoneNo="";
        user.profilePic="";
        user.timezone="";
        user.status=1;
        user.middleName="";
        user.zipCode="";
        user.password = await this.hashPassword(password, salt);
        user.gender = gender;
        
        if(signup_via=='web')
            user.registerVia='web';
        else{

            if(device_type==1)
                user.registerVia='android';
            else
                user.registerVia='ios';
        }
        /*user.country = country;
        user.state = state;
        user.city = city;
        user.address = address */

        try {
            await user.save();
        } catch (error) {
            
            throw new InternalServerErrorException(error.sqlMessage);
        }

        delete user.password;
        delete user.salt;

        let accessToken;
        if(signup_via=='mobile'){
            loginvia=device_type==1?'android':'ios';
            let dateObj = new Date();
            let newToken = md5(dateObj);

            let device = new UserDeviceDetail();
            device.deviceType = device_type;
            device.deviceToken = device_token || "";
            device.deviceModel=device_model;
            device.accessToken = newToken;
            device.appVersion = app_version;
            device.osVersion = os_version;
            device.createdDate = new Date();
            device.user = user;
            // Remove old entries of this user
            await UserDeviceDetail.delete({
                user: user,
            });

            try {
                // Save Latest entry
                await device.save();

                const payload: JwtPayload = {
                    user_id: user.userId,
                    firstName: user.firstName,
                    middleName:"",
                    profilePic:"",
                    lastName: user.lastName,
                    email,
                    salt: user.salt,
                    accessToken: newToken,
                };

                accessToken = this.jwtService.sign(payload);

            } catch (error) {
                throw new InternalServerErrorException(`Oops. Something went wrong. Please try again.`);
            }
        }
        else{
            loginvia='web';
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
            };
            accessToken = this.jwtService.sign(payload);
        }

        let userDetails= Object.create(null);
        userDetails.id = user.userId;
        userDetails.email = user.email;
        userDetails.first_name = user.firstName;
        userDetails.middle_name = user.middleName;
        userDetails.last_name = user.lastName;
        userDetails.phone_no = user.phoneNo;
        userDetails.profile_pic = user.profilePic;
        userDetails.gender = user.gender;
        userDetails.access_token = accessToken;
        
        this.addLoginLog(user.userId,request,loginvia);
        return { user_details : userDetails};
    }

    hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt)
    }

    async validateUserPassword(authCredentialDto: AuthCredentialDto,siteUrl,roles,request) {

        const { email, password } = authCredentialDto;
        const user = await this.userRepository.findOne(
             { email, isDeleted:false, roleId: In(roles) }
        );
        
        if (user && await user.validatePassword(password)) {

            if(user.status!=1)
                throw new UnauthorizedException(`Your account has been disabled. Please contact administrator person.`)

            const payload: JwtPayload = {
                user_id: user.userId,
                email,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                salt: user.salt,
                profilePic: user.profilePic? `${siteUrl}/profile/${user.profilePic}`:"",
            };
            const accessToken = this.jwtService.sign(payload);
            const token = { token: accessToken };
            this.addLoginLog(user.userId,request,'web');
            return token
        }
        else {
            throw new UnauthorizedException(`Invalid login credentials! Please enter correct email id and password.`)
        }

    }

    async forgetPassword(forgetPasswordDto: ForgetPasswordDto,siteUrl) {
        const { email } = forgetPasswordDto;
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            throw new NotFoundException(`Email is not registered with us. Please check the email.`);
        }


        var unixTimestamp = Math.round(new Date().getTime() / 1000);

        const tokenhash = crypto.createHmac('sha256', unixTimestamp.toString()).digest('hex');

        const payload: forgetPass = {
            email,
            tokenhash
        };
        const forgetPassToken = this.jwtService.sign(payload);
        const resetLink = `${siteUrl}/v1/auth/forget-password?token=${forgetPassToken}`;
        this.mailerService.sendMail({
            to: email,
            from: "no-reply@laytrip.com",
            subject: "Forgot Password",
            template: "forgotEmail.html",
            context: {
                // Data to be sent to template files.
                username: user.firstName + " " + user.lastName,
                link: resetLink,
            },
        }).then((res) => {
            console.log("res", res);
        })
        .catch((err) => {
            console.log("err", err);
        });


        const row = new forget_password();
        row.email = email;
        row.token = tokenhash;
        row.createTime = new Date();
        row.updateTime = new Date();


        try {
            await row.save();
        } catch (error) {
            throw new InternalServerErrorException(`Oops. Something went wrong. Please try again.`);
        }
        const token = { message: `Link sent to your email address successfully.`};
        console.log(token)
		return token;
    }

    async updatePassword(updatePasswordDto: UpdatePasswordDto, newPasswordDto: NewPasswordDto) {
		const { token } = updatePasswordDto;
		const { new_password } = newPasswordDto;
		var decoded = jwt_decode(token);
		const { email, tokenhash, iat } = decoded;
		const unixTimestamp = Math.round(new Date().getTime() / 1000);
		const time = unixTimestamp - iat;
		if (time >= 900) {
			throw new BadRequestException(`Token Is Expired. Please Try Again.&&&token&&& ${errorMessage}`);
		}
		const user = await this.userRepository.findOne({
			where: { email: email, isDeleted: 0, status: 1 },
		});
		if (!user) {
			throw new NotFoundException(`Email is not registered with us. Please check the email.&&&email`);
		}

		const validToken = await this.forgetPasswordRepository.findOne({
			where: { email: email, is_used: 0, token: tokenhash },
		});
		if (validToken && validToken.validateToken(tokenhash)) {
			const salt = await bcrypt.genSalt();
			user.salt = salt;
			user.password = await this.hashPassword(new_password, salt);
			validToken.is_used = 1;
			validToken.updateTime = new Date();
			try {
				await user.save();
				await validToken.save();
				const res = { message: `Your Password has been succesfully updated`};
				return res;
			} catch (error) {
				throw new InternalServerErrorException(`${error.sqlMessage}&&& &&&` + errorMessage);
			}
		} else {
			throw new BadRequestException(`Token Can not be validate.&&&token&&&${errorMessage}`);
		}
    }
    
    async validateUserPasswordMobile(mobileAuthCredentialDto: MobileAuthCredentialDto,siteUrl,request,roles) {
		const { email, password, device_type, device_token, app_version, os_version, device_model } = mobileAuthCredentialDto;
		const user = await this.userRepository.findOne(
            { email, isDeleted:false, roleId: In(roles) }
        );

		if (user && (await user.validatePassword(password))) {

            if(user.status!=1)
                throw new UnauthorizedException(`Your account has been disabled. Please contact administrator person.`)

			let dateObj = new Date();
			let newToken = md5(dateObj);

			let device = new UserDeviceDetail();
			device.deviceType = device_type;
            device.deviceToken = device_token || "";
            device.deviceModel=device_model;
			device.accessToken = newToken;
			device.appVersion = app_version;
			device.osVersion = os_version;
			device.createdDate = new Date();
			device.user = user;
			// Remove old entries of this user
			await UserDeviceDetail.delete({
				user: user,
			});

			try {
				// Save Latest entry
				await device.save();

				const payload: JwtPayload = {
					user_id: user.userId,
                    firstName: user.firstName,
                    middleName:"",
                    profilePic: user.profilePic? `${siteUrl}/profile/${user.profilePic}`:"",
					lastName: user.lastName,
					email,
					salt: user.salt,
					accessToken: newToken,
				};

				const accessToken = this.jwtService.sign(payload);

				const token = {
					user_details: {
						access_token: accessToken,
						id: user.userId,
                        first_name: user.firstName,
                        middle_name : user.middleName || "",
						last_name: user.lastName,
						email: user.email,
                        profile_pic: user.profilePic? `${siteUrl}/profile/${user.profilePic}`:"",
                        gender : user.gender || ""
					},
                };
                let loginvia=device_type==1?'android':'ios';
                this.addLoginLog(user.userId,request,loginvia);
				return JSON.parse(JSON.stringify(token).replace(/null/g, '""'));
			} catch (error) {
				throw new InternalServerErrorException(`Oops. Something went wrong. Please try again.`);
			}
		} else {
			throw new NotFoundException(`Invalid login credentials! Please enter correct email address and password.`);
		}
    }
    
    async logout(id: string): Promise<any> {
		try {
			const user = await this.userRepository.findOne({ userId:id});
			if (!user) {
				throw new NotFoundException(`Invalid user id! Please enter correct user id&&&user_id&&&${errorMessage}`);
			}
			await UserDeviceDetail.delete({ user: user });
			const userData = { message: `Logged out successfully.`};
			return userData;
		} catch (error) {
			throw new NotFoundException(`Invalid user id! Please enter correct user id.&&&user_id&&&${errorMessage}`);
		}
	}

    async socialLogin(socialLoginDto:SocialLoginDto,request){

        const { 
                account_type, 
                social_account_id, 
                email,
                name,
                device_type,
                device_token,
                app_version,
                os_version,
                device_model

            } = socialLoginDto;
        
        let conditions=[];
        conditions.push({socialAccountId:social_account_id})
        if(email){
            conditions.push({email:email})
        }
        
        const userExist =await this.userRepository.findOne({
            where : conditions
        })

        const user = new User();
        user.email = email || "";
        user.firstName = name || "";
        
        if(!userExist){
            user.userId = uuidv4();
            user.accountType=account_type;
            user.lastName = "";
            user.salt = "";
            user.createdDate = new Date();
            user.updatedDate = new Date();
            user.socialAccountId=social_account_id;
            user.roleId=2;
            user.phoneNo="";
            user.profilePic="";
            user.timezone="";
            user.gender = "";
            user.status=1;
            user.middleName="";
            user.zipCode="";
            user.password = "";
            
            try {
                await user.save();
            } catch (error) {
                
                throw new InternalServerErrorException(error.sqlMessage);
            }
        }
        else{

            try{
                const user1 = { email : email || "", firstName: name || ""}
                await this.userRepository.update({socialAccountId:social_account_id},user1);
            }
            catch(error){
                throw new InternalServerErrorException(error.sqlMessage);
            }
        }

        const userDetail =await this.userRepository.findOne({
            where : conditions
        })

        let dateObj = new Date();
        let newToken = md5(dateObj);

        let device = new UserDeviceDetail();
        device.deviceType = device_type;
        device.deviceToken = device_token || "";
        device.deviceModel=device_model;
        device.accessToken = newToken;
        device.appVersion = app_version;
        device.osVersion = os_version;
        device.createdDate = new Date();
        device.user = userDetail;
        // Remove old entries of this user
        await UserDeviceDetail.delete({
            user: userDetail,
        });

        try {
            // Save Latest entry
            await device.save();

            const payload: JwtPayload = {
                user_id: userDetail.userId,
                firstName: userDetail.firstName,
                middleName:"",
                profilePic:"",
                lastName: userDetail.lastName || "",
                email:email || "",
                salt: "",
                accessToken: newToken,
            };

            const accessToken = this.jwtService.sign(payload);

            const token = {
                user_details: {
                    access_token: accessToken,
                    id: userDetail.userId,
                    first_name: userDetail.firstName,
                    last_name: userDetail.lastName || "",
                    middle_name : userDetail.middleName || "",
                    email: userDetail.email || "",
                    profile_pic: "",
                    gender : userDetail.gender || ""
                },
            };
            let loginvia=device_type==1?'android':'ios';
            this.addLoginLog(user.userId,request,loginvia);
            return JSON.parse(JSON.stringify(token).replace(/null/g, '""'));
        } catch (error) {
            throw new InternalServerErrorException(errorMessage);
        }
    }

    async getProfile(user,siteUrl){
        const userId = user.userId;
        try{
            const userDetail = await this.userRepository.findOne({
                select : [
                            "userId","title","firstName","lastName",
                            "email","phoneNo","profilePic",
                            "countryCode","phoneNo","countryId","stateId","cityName",
                            "address"
                        ],
                where : {userId}
            })
            
            userDetail.profilePic = userDetail.profilePic?`${siteUrl}/profile/${userDetail.profilePic}`:"";
            return userDetail;
        }
        catch(error){
            throw new InternalServerErrorException(errorMessage)
        }   
    }

    async updateProfile(updateProfileDto,loginUser,files){

        const userId = loginUser.userId;
        const { 
            title,
            first_name,
            last_name,
            zip_code,
            country_code,
            phone_no,
            country_id,
            state_id,
            city_name,
            profile_pic
        }=updateProfileDto;
        console.log(files)

        const user = new User();
        user.title = title;
        user.firstName=first_name;
        user.lastName=last_name;
        user.zipCode=zip_code;
        user.countryCode=country_code;
        user.phoneNo=phone_no;
        user.countryId=country_id;
        user.stateId=state_id;
        user.cityName=city_name;
        if(typeof files.profile_pic!='undefined')
            user.profilePic=files.profile_pic[0].filename;
        
        await this.userRepository.update(userId,user)
        return {"message":`Your profile has been updated successfully.`};
    }

     addLoginLog(userId,request,loginVia){

        const loginLog = new LoginLog();
        loginLog.userId = userId;
        loginLog.ipAddress = request.ip || "";
        loginLog.loginAgent = typeof request.headers['user-agent']!='undefined'?request.headers['user-agent']:request.headers;
        loginLog.loginDate = new Date();
        loginLog.loginVia=loginVia;
        getConnection()
            .createQueryBuilder()
            .insert()
            .into(LoginLog)
            .values(loginLog)
            .execute();
    }
}