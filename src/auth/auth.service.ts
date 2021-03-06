/**
 * @author Parth Virani
 * @email parthvirani@itoneclick.com
 * @create date 2021-01-05 00:06:52
 * @modify date 2021-01-05 00:06:52
 * @desc [description]
 */
/*
 * Created on Tue May 12 2020
 *
 * @Auther:- Parth Virani
 * Copyright (c) 2020 Oneclick
 * my variables are ${myvar1} and ${myvar2}
 */
var fs = require(`fs`);
import {
    Injectable,
    ConflictException,
    InternalServerErrorException,
    UnauthorizedException,
    NotFoundException,
    BadRequestException,
    NotAcceptableException,
    ForbiddenException,
    ParseBoolPipe,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "./user.repository";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/entity/user.entity";
import { CreateUserDto } from "./dto/crete-user.dto";
import { AuthCredentialDto } from "./dto/auth-credentials.dto";
import { JwtPayload } from "./jwt-payload.interface";
import { ForgetPasswordDto } from "./dto/forget-paasword.dto";
import * as jwt_decode from "jwt-decode";
import { MailerService } from "@nestjs-modules/mailer";
import { forget_password } from "src/entity/forget-password.entity";
import { ForgetPassWordRepository } from "./forget-password.repository";
import { v4 as uuidv4 } from "uuid";
import { NewPasswordDto } from "./dto/new-password.dto";
import { errorMessage } from "src/config/common.config";
import { MobileAuthCredentialDto } from "./dto/mobile-auth-credentials.dto";
import { UserDeviceDetail } from "src/entity/user-device-detail.entity";
import { SocialLoginDto } from "./dto/social-login.dto";
import * as md5 from "md5";
import { In, getConnection, getManager, Like } from "typeorm";
import { LoginLog } from "src/entity/login-log.entity";
import { Role } from "src/enum/role.enum";
import { Countries } from "src/entity/countries.entity";
import { States } from "src/entity/states.entity";
import { Activity } from "src/utility/activity.utility";
import { ChangePasswordDto } from "src/user/dto/change-password.dto";
import { PrefferedLanguageDto } from "./dto/preffered-languge.dto";
import { PrefferedCurrencyDto } from "./dto/preffered-currency.dto";
import { LaytripVerifyEmailIdTemplete } from "src/config/new_email_templete/laytrip_email-id-verify-mail.html";
import { OtpDto } from "./dto/otp.dto";
import { ReSendVerifyoOtpDto } from "./dto/resend-verify-otp.dto";
import { UpdateEmailId } from "./dto/update-email.dto";
import { Currency } from "src/entity/currency.entity";
import { Language } from "src/entity/language.entity";
import { CheckEmailConflictDto } from "./dto/check-email-conflict.dto";
import { LaytripForgotPasswordMail } from "src/config/new_email_templete/laytrip_forgot-password-mail.html";
import * as config from "config";
const mailConfig = config.get("email");
const jwtConfig = config.get("jwt");
import * as uuidValidator from "uuid-validate";
import { MarketingUserData } from "src/entity/marketing-user.entity";
import { LayCreditEarn } from "src/entity/lay-credit-earn.entity";
import { RewordMode } from "src/enum/reword-mode.enum";
import { RewordStatus } from "src/enum/reword-status.enum";
import { AddWebNotificationDto } from "./dto/add-web-notification-token.dto";
import { WebPushNotifications } from "src/entity/web-push-notification.entity";
import * as moment from "moment";
import { DeleteAccountReqDto } from "./dto/delete-account-request.dto";
import { DeleteAccountRequestStatus } from "src/enum/delete-account-status.enum";
import { DeleteUserAccountRequest } from "src/entity/delete-user-account-request.entity";
import { updateUserPreference } from "./dto/update-user-preference.dto";
import { UserPreference } from "src/enum/user-preference.enum";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { airports } from "src/flight/airports";
import { UpdateProfilePicDto } from "./dto/update-profile-pic.dto";
import { LaytripWelcomeBoardMail } from "src/config/new_email_templete/laytrip_welcome-board-mail.html";
import { LaytripResetPasswordMail } from "src/config/new_email_templete/laytrip_reset-password-mail.html";
import { GuestUserDto } from "./dto/guest-user.dto";
import { UserService } from "src/user/user.service";
import { UpdateAppleUserDto } from "./dto/update-apple-user.dto";
import { LandingPages } from "src/entity/landing-page.entity";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService,
        private readonly mailerService: MailerService,
        @InjectRepository(ForgetPassWordRepository)
        private forgetPasswordRepository: ForgetPassWordRepository
    ) {}

    async signUp(createUser: CreateUserDto, request,referralId) {
        const {
            first_name,
            last_name,
            email,
            password,
            signup_via,
            device_type,
            device_token,
            os_version,
            app_version,
            device_model,
            referral_id,
        } = createUser;

        let loginvia = "";
        const roles = [Role.FREE_USER, Role.PAID_USER];
        const userExist = await this.userRepository.findOne({
            email: email,
            roleId: In(roles),
        });

        if (userExist) {
            if (userExist.status != 1) {
                throw new UnauthorizedException(
                    `Your account has been disabled. Please contact customerservice@laytrip.com.`
                );
            } else if (userExist.isDeleted == true) {
                throw new UnauthorizedException(
                    `Your account has been deleted. Please contact customerservice@laytrip.com.`
                );
            } else {
                throw new ConflictException(
                    `You have already added your email.`
                );
            }
        }

        const user = new User();
        const salt = await bcrypt.genSalt();
        user.userId = uuidv4();
        user.accountType = 1;
        user.email = email;
        user.firstName = first_name ? first_name : "";
        user.lastName = last_name ? last_name : "";
        user.gender = "";
        user.salt = salt;
        user.createdDate = new Date();
        user.updatedDate = new Date();
        user.socialAccountId = "";
        user.roleId = Role.FREE_USER;
        user.phoneNo = "";
        user.profilePic = "";
        user.timezone = "";
        user.status = 1;
        user.middleName = "";
        user.zipCode = "";
        if (referral_id) {
            let ref = await this.getReferralId(referral_id);
            user.referralId = ref?.id || null;
        }

        user.password = await this.hashPassword(password, salt);
        user.isVerified = false;
        user.otp = Math.round(new Date().getTime() % 1000000);
        if (user.otp < 100000) {
            user.otp = user.otp + 800000;
        }
        if (signup_via == "web") user.registerVia = "web";
        else {
            if (device_type == 1) user.registerVia = "android";
            else user.registerVia = "ios";
        }
        /*user.country = country;
		user.state = state;
		user.city = city;
		user.address = address */
        try {
            await user.save();
            let marketingUserData = await getConnection()
                //.createQueryBuilder(MarketingUserActivity, "activity")
                .createQueryBuilder(MarketingUserData, "marketingUserData")
                .leftJoinAndSelect(
                    "marketingUserData.marketingUserActivity",
                    "activity"
                )
                .where(`"marketingUserData"."email" = '${user.email}'`)
                .getOne();

            if (marketingUserData) {
                if (!marketingUserData.userId) {
                    marketingUserData.userId = user.userId;
                    marketingUserData.save();
                }
                if (marketingUserData.marketingUserActivity.length) {
                    for await (const activity of marketingUserData.marketingUserActivity) {
                        if (activity.addToWallet == false) {
                            const laytripPoint = new LayCreditEarn();
                            laytripPoint.userId = user.userId;
                            laytripPoint.points = activity.reword;
                            laytripPoint.earnDate = new Date();
                            laytripPoint.creditMode =
                                activity.gameId == 1
                                    ? RewordMode.WHEELGAME
                                    : RewordMode.QUIZGAME;
                            laytripPoint.status = RewordStatus.AVAILABLE;
                            laytripPoint.creditBy = user.userId;
                            laytripPoint.description = `User played a game`;
                            await laytripPoint.save();
                            activity.addToWallet = true;
                            activity.save();
                        }
                    }
                }
            }

            this.mailerService
                .sendMail({
                    to: email,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: "Verify your Account",
                    html: LaytripVerifyEmailIdTemplete(
                        {
                            username: first_name || "",
                            otp: user.otp,
                        },
                        referralId
                    ),
                })
                .then((res) => {
                    console.log("res", res);
                })
                .catch((err) => {
                    console.log("err", err);
                });
        } catch (error) {
            throw new InternalServerErrorException(error.sqlMessage);
        }

        if (signup_via == "mobile") {
            loginvia = device_type == 1 ? "android" : "ios";
            let dateObj = new Date();
            let newToken = md5(dateObj);

            let device = new UserDeviceDetail();
            device.deviceType = device_type;
            device.deviceToken = device_token || "";
            device.deviceModel = device_model;
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
            } catch (error) {
                throw new InternalServerErrorException(
                    `Oops. Something went wrong. Please try again.`
                );
            }
        }
        return { message: `Otp send on your email id` };
    }

    async guestUser(createUser: GuestUserDto) {
        const { guest_id } = createUser;
        if (!uuidValidator(guest_id)) {
            throw new BadRequestException("Please send valid uuid");
        }
        let loginvia = "";
        const roles = [Role.FREE_USER, Role.PAID_USER];
        const userExist = await this.userRepository.findOne({
            userId: guest_id,
            roleId: In(roles),
        });

        if (userExist) {
            if (userExist.status != 1) {
                throw new UnauthorizedException(
                    `Your account has been disabled. Please contact customerservice@laytrip.com.`
                );
            } else if (userExist.isDeleted == true) {
                throw new UnauthorizedException(
                    `Your account has been deleted. Please contact customerservice@laytrip.com.`
                );
            } else {
                throw new ConflictException(
                    `This user id is already registered with us.`
                );
            }
        }

        const guestUser = await this.userRepository.findOne({
            userId: guest_id,
            roleId: Role.GUEST_USER,
        });

        if (!guestUser) {
            const user = new User();
            user.userId = guest_id;
            user.accountType = 1;
            user.createdDate = new Date();
            user.updatedDate = new Date();
            user.socialAccountId = "";
            user.roleId = Role.GUEST_USER;
            user.phoneNo = "";
            user.profilePic = "";
            user.timezone = "";
            user.status = 1;
            user.middleName = "";
            user.zipCode = "";
            user.isVerified = true;
            try {
                await user.save();
            } catch (error) {
                throw new InternalServerErrorException(error.sqlMessage);
            }
        }

        const userData = await this.userRepository.findOne({
            where: { userId: guest_id },
        });

        loginvia = "web";
        const payload: JwtPayload = {
            user_id: userData.userId,
            email: userData.email,
            username: "",
            phone: userData.phoneNo,
            firstName: userData.firstName,
            middleName: userData.middleName,
            lastName: userData.lastName,
            salt: userData.salt,
            profilePic: "",
            roleId: userData.roleId,
            createdDate: userData.createdDate,
            socialAccountId: userData.socialAccountId,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
    }

    hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    }

    async resendOtp(reSendVerifyoOtpDto: ReSendVerifyoOtpDto,referralId) {
        const { email } = reSendVerifyoOtpDto;
        const roles = [Role.FREE_USER, Role.PAID_USER];

        const user = await this.userRepository.findOne({
            where: { email, isDeleted: false, roleId: In(roles) },
        });

        if (!user) throw new NotFoundException(`Not a registered email.`);

        if (user.status != 1)
            throw new UnauthorizedException(
                `Your account has been disabled. Please contact customerservice@laytrip.com.`
            );

        if (user.isVerified)
            throw new UnauthorizedException(`Your email id already verified`);
        user.isVerified = false;
        user.otp = Math.round(new Date().getTime() % 1000000);
        if (user.otp < 100000) {
            user.otp = user.otp + 800000;
        }
        try {
            await user.save();
            this.mailerService
                .sendMail({
                    to: email,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: "Verify your Account",
                    html: LaytripVerifyEmailIdTemplete({
                        username: user.firstName + " " + user.lastName,
                        otp: user.otp,
                    },referralId),
                })
                .then((res) => {
                    console.log("res", res);
                })
                .catch((err) => {
                    console.log("err", err);
                });
        } catch (error) {
            throw new InternalServerErrorException(error.sqlMessage);
        }
        //Activity.logActivity(user.userId, `auth`, ` ${email} user is signup`);
        return { message: `Otp send on your email id` };
    }

    async UpdateEmailId(updateEmailId: UpdateEmailId, userData: User,referralId) {
        if (userData.email) {
            throw new ConflictException(`You have alredy added email id`);
        }
        const { newEmail } = updateEmailId;
        const email = userData.email;
        const user = await this.userRepository.findOne({
            where: { userId: userData.userId, isDeleted: false },
        });

        if (!user) throw new NotFoundException(`Not a registered email.`);

        if (user.status != 1)
            throw new UnauthorizedException(
                `Your account has been disabled. Please contact customerservice@laytrip.com.`
            );
        const roles = [Role.FREE_USER, Role.PAID_USER];
        const userExist = await this.userRepository.findOne({
            email: newEmail,
            roleId: In(roles),
        });

        if (userExist)
            throw new ConflictException(`You have already added your email.`);
        user.email = newEmail;
        //user.isVerified = false;
        //user.otp = Math.round(new Date().getTime() / 1000);
        try {
            await user.save();
            this.mailerService
                .sendMail({
                    to: newEmail,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: "Verify your Account",
                    html: LaytripVerifyEmailIdTemplete({
                        username: user.firstName + " " + user.lastName,
                        otp: user.otp,
                    },referralId),
                })
                .then((res) => {
                    console.log("res", res);
                })
                .catch((err) => {
                    console.log("err", err);
                });
        } catch (error) {
            throw new InternalServerErrorException(error.sqlMessage);
        }
        //Activity.logActivity(
        // 	user.userId,
        // 	`auth`,
        // 	` user is update the Email id ${email} to ${newEmail} `
        // );
        return { message: `Otp send on your email id` };
    }

    async updateAppleUser(
        updateAppleUserDto: UpdateAppleUserDto,
        userData: User,
        siteUrl
    ) {
        const { email, first_name, last_name } = updateAppleUserDto;

        const user = await this.userRepository.findOne({
            where: { userId: userData.userId, isDeleted: false },
        });

        if (!user) throw new NotFoundException(`Not a registered email.`);

        if (user.status != 1)
            throw new UnauthorizedException(
                `Your account has been disabled. Please contact customerservice@laytrip.com.`
            );
        const roles = [Role.FREE_USER, Role.PAID_USER];
        const userExist = await this.userRepository.findOne({
            email: email,
            roleId: In(roles),
        });

        if (userExist)
            throw new ConflictException(`You have already added your email.`);
        user.email = email;
        user.isRequireToUpdate = false;
        user.firstName = first_name;
        user.lastName = last_name;

        try {
            await user.save();
            const payload: JwtPayload = {
                user_id: user.userId,
                email,
                username: user.firstName + " " + user.lastName,
                firstName: user.firstName,
                phone: user.phoneNo,
                middleName: user.middleName,
                lastName: user.lastName,
                salt: user.salt,
                profilePic: user.profilePic
                    ? `${siteUrl}/profile/${user.profilePic}`
                    : "",
                roleId: user.roleId,
                createdDate: user.createdDate,
                socialAccountId: user.socialAccountId,
            };
            let accessToken = this.jwtService.sign(payload);
            return { message: `Updated successfully`, token: accessToken };
        } catch (error) {
            throw new InternalServerErrorException(error.sqlMessage);
        }
    }

    async validateUserPassword(
        authCredentialDto: AuthCredentialDto,
        siteUrl,
        roles,
        request
    ) {
        const { email, password } = authCredentialDto;
        const user = await this.userRepository.findOne({
            where: { email, isDeleted: false, roleId: In(roles) },
        });
        if (user?.status != 1)
            throw new UnauthorizedException(
                `Your account has been disabled. Please contact customerservice@laytrip.com.`
            );
        if (!user?.isVerified) {
            throw new NotAcceptableException(
                `Your email has been verified.&&&email&&&Your email has been verified.`
            );
        }
        if (user?.socialAccountId) {
            throw new UnauthorizedException(
                `Invalid login credentials. Please enter correct email and password.`
            );
        }

        if (user && (await user.validatePassword(password))) {
            

            const payload: JwtPayload = {
                user_id: user.userId,
                email,
                username: user.firstName + " " + user.lastName,
                firstName: user.firstName,
                phone: user.phoneNo,
                middleName: user.middleName,
                lastName: user.lastName,
                salt: user.salt,
                profilePic: user.profilePic
                    ? `${siteUrl}/profile/${user.profilePic}`
                    : "",
                roleId: user.roleId,
                createdDate: user.createdDate,
                socialAccountId: user.socialAccountId,
            };
            const accessToken = this.jwtService.sign(payload);
            const token = { token: accessToken };
            this.addLoginLog(user.userId, request, "web");
            return token;
        } else {
            throw new UnauthorizedException(
                `Invalid login credentials. Please enter correct email and password.`
            );
        }
    }

    async forgetPassword(
        forgetPasswordDto: ForgetPasswordDto,
        siteUrl,
        roles: Role[],
        referralId
    ) {
        const { email } = forgetPasswordDto;

        const user = await this.userRepository.findOne({
            email: email,
            roleId: In(roles),
        });

        // const user = await getConnection()
        // 	.createQueryBuilder(User, "user")
        // 	.where(`email=:email and role_id  IN (:...role_id)`, { email, role_id: roles })
        // 	.getOne();

        if (!user) {
            throw new NotFoundException(`Not a registered email.`);
        }
        if (user.isDeleted == true || user.status == 0) {
            throw new NotFoundException(
                `Your account has been disabled. Please contact customerservice@laytrip.com.`
            );
        }
        if (user.socialAccountId) {
            throw new UnauthorizedException(
                `Invalid login credentials. Please enter correct email`
            );
        }

        var unixTimestamp = Math.round(new Date().getTime() / 1000);

        // const tokenhash = crypto
        // 	.createHmac("sha256", unixTimestamp.toString())
        // 	.digest("hex");

        // const payload: forgetPass = {
        // 	email,
        // 	tokenhash,
        // };

        // const forgetPassToken = this.jwtService.sign(payload);
        var otp = Math.round(new Date().getTime() % 1000000);
        if (otp < 100000) {
            otp = otp + 800000;
        }
        //Activity.logActivity(
        // 	user.userId,
        // 	`auth`,
        // 	` ${email} user is request to forget password using ${otp} otp`
        // );
        // var resetLink = `https://staging.laytrip.com`;
        // if (
        // 	user.roleId == Role.ADMIN ||
        // 	user.roleId == Role.SUPER_ADMIN ||
        // 	user.roleId == Role.SUPPLIER
        // ) {
        // 	resetLink = `https://app.staging.laytrip.com`;
        // }

        this.mailerService
            .sendMail({
                to: email,
                from: mailConfig.from,
                bcc: mailConfig.BCC,
                sender: "laytrip",
                subject: "Password Reset One Time Pin",
                html: LaytripForgotPasswordMail({
                    username: user.firstName,
                    otp: otp,
                },referralId),
            })
            .then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

        const row = new forget_password();
        row.email = email;
        row.otp = otp;
        row.createTime = new Date();
        row.updateTime = new Date();

        try {
            await row.save();
        } catch (error) {
            throw new InternalServerErrorException(
                `Oops. Something went wrong. Please try again.`
            );
        }
        const msg = { message: `otp sent to your email address successfully.` };
        return msg;
    }

    async updatePassword(newPasswordDto: NewPasswordDto,referralId) {
        try {
            //const { token } = updatePasswordDto;
            const { email, otp, new_password } = newPasswordDto;
            // var decoded = jwt_decode(token);
            // const { email, tokenhash, iat } = decoded;
            // const unixTimestamp = Math.round(new Date().getTime() / 1000);
            // const time = unixTimestamp - iat;
            // if (time >= 900) {
            // 	throw new BadRequestException(
            // 		`Token Is Expired. Please Try Again.&&&token&&& ${errorMessage}`
            // 	);
            // }
            var roles = [
                Role.ADMIN,
                Role.SUPER_ADMIN,
                Role.SUPPLIER,
                Role.FREE_USER,
                Role.PAID_USER,
            ];
            // const user = await this.userRepository.findOne({ email , roleId: In(roles) });

            const user = await this.userRepository.findOne({
                where: {
                    email: email,
                    isDeleted: 0,
                    status: 1,
                    roleId: In(roles),
                },
            });

            if (!user) {
                throw new NotFoundException(`Not a registered email.`);
            }
            if (!user.isVerified) {
                throw new NotAcceptableException(
                    `Your email has been verified.&&&email&&&Your email has been verified.`
                );
            }
            // Activity.logActivity(
            // 	user.userId,
            // 	`auth`,
            // 	`${user.email} is forget password using ${otp} otp`
            // );

            const validate = await this.forgetPasswordRepository.findOne({
                where: { email: email, is_used: 0, otp: otp },
            });
            if (validate) {
                console.log(validate);
                var a = moment(new Date()); //now
                var b = moment(validate.createTime);
                const diff = a.diff(b, "minutes");

                console.log(diff);

                if (diff > 3) {
                    throw new BadRequestException(
                        `OTP expired. Please try again!&&&otp&&&OTP expired. Please try again!`
                    );
                }
                const salt = await bcrypt.genSalt();
                user.salt = salt;
                user.password = await this.hashPassword(new_password, salt);
                validate.is_used = 1;
                validate.updateTime = new Date();
                try {
                    await user.save();
                    await validate.save();
                    this.mailerService
                        .sendMail({
                            to: email,
                            from: mailConfig.from,
                            bcc: mailConfig.BCC,
                            sender: "laytrip",
                            subject: "Password Reset",
                            html: LaytripResetPasswordMail({
                                username: user.firstName,
                            },referralId),
                        })
                        .then((res) => {
                            console.log("res", res);
                        })
                        .catch((err) => {
                            console.log("err", err);
                        });
                    const res = {
                        message: `Your password has been updated successfully.`,
                    };
                    return res;
                } catch (error) {
                    throw new InternalServerErrorException(
                        `${error.sqlMessage}&&& &&&` + errorMessage
                    );
                }
            } else {
                throw new BadRequestException(`Wrong OTP. Please try again.`);
            }
        } catch (error) {
            console.log(error);

            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        if (
                            error.response.message ==
                            "This user does not exist&&&email&&&This user does not exist"
                        ) {
                            error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
                        }
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 400:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async getUserFromEmail(forgetPasswordDto: ForgetPasswordDto) {
        const { email } = forgetPasswordDto;

        const user = await this.userRepository.findOne({
            email: email,
        });
        return user;
    }
    async VerifyOtp(OtpDto: OtpDto, req, siteUrl: string,referralId) {
        const { otp, email } = OtpDto;

        const roles = [Role.FREE_USER, Role.PAID_USER];
        const user = await this.userRepository.findOne({
            where: { email: email, isDeleted: 0, status: 1, roleId: In(roles) },
        });

        if (!user) {
            throw new NotFoundException(`Not a registered email.`);
        }
        let accessToken;
        let loginvia;
        console.log(user.validateOtp(otp));
        if (user.otp == otp) {
            try {
                user.isVerified = true;
                await user.save();
                if (
                    user.registerVia == "android" ||
                    user.registerVia == "ios"
                ) {
                    loginvia = "mobile";

                    const payload: JwtPayload = {
                        user_id: user.userId,
                        firstName: user.firstName,
                        username: user.firstName + " " + user.lastName,
                        phone: user.phoneNo,
                        middleName: "",
                        profilePic: "",
                        lastName: user.lastName,
                        email,
                        salt: user.salt,
                        //accessToken: newToken,
                        roleId: user.roleId,
                        createdDate: user.createdDate,
                        socialAccountId: user.socialAccountId,
                    };

                    accessToken = this.jwtService.sign(payload);
                } else {
                    loginvia = "web";
                    const payload: JwtPayload = {
                        user_id: user.userId,
                        email,
                        username: user.firstName + " " + user.lastName,
                        phone: user.phoneNo,
                        firstName: user.firstName,
                        middleName: user.middleName,
                        lastName: user.lastName,
                        salt: user.salt,
                        profilePic: user.profilePic
                            ? `${siteUrl}/profile/${user.profilePic}`
                            : "",
                        roleId: user.roleId,
                        createdDate: user.createdDate,
                        socialAccountId: user.socialAccountId,
                    };
                    accessToken = this.jwtService.sign(payload);
                }

                let userDetails = Object.create(null);
                userDetails.id = user.userId;
                userDetails.email = user.email;
                userDetails.first_name = user.firstName;
                userDetails.middle_name = user.middleName;
                userDetails.last_name = user.lastName;
                userDetails.phone_no = user.phoneNo;
                userDetails.profile_pic = user.profilePic;
                userDetails.gender = user.gender;
                userDetails.access_token = accessToken;

                this.addLoginLog(user.userId, req, loginvia);
                this.mailerService
                    .sendMail({
                        to: email,
                        from: mailConfig.from,
                        bcc: mailConfig.BCC,
                        subject: "Welcome to Laytrip!",
                        html: LaytripWelcomeBoardMail(referralId),
                    })
                    .then((res) => {
                        console.log("res", res);
                    })
                    .catch((err) => {
                        console.log("err", err);
                    });
                // Activity.logActivity(
                // 	user.userId,
                // 	`auth`,
                // 	`${email} user is verify own account`
                // );
                return { userDetails };
            } catch (error) {
                if (typeof error.response !== "undefined") {
                    switch (error.response.statusCode) {
                        case 404:
                            if (
                                error.response.message ==
                                "This user does not exist&&&email&&&This user does not exist"
                            ) {
                                error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
                            }
                            throw new NotFoundException(error.response.message);
                        case 409:
                            throw new ConflictException(error.response.message);
                        case 422:
                            throw new BadRequestException(
                                error.response.message
                            );
                        case 403:
                            throw new ForbiddenException(
                                error.response.message
                            );
                        case 500:
                            throw new InternalServerErrorException(
                                error.response.message
                            );
                        case 406:
                            throw new NotAcceptableException(
                                error.response.message
                            );
                        case 404:
                            throw new NotFoundException(error.response.message);
                        case 401:
                            throw new UnauthorizedException(
                                error.response.message
                            );
                        default:
                            throw new InternalServerErrorException(
                                `${error.message}&&&id&&&${error.Message}`
                            );
                    }
                }
                throw new InternalServerErrorException(
                    `${error.message}&&&id&&&${errorMessage}`
                );
            }
        } else {
            throw new BadRequestException(`Wrong OTP. Please try again.`);
        }
    }

    async validateUserPasswordMobile(
        mobileAuthCredentialDto: MobileAuthCredentialDto,
        siteUrl,
        request,
        roles
    ) {
        const {
            email,
            password,
            device_type,
            device_token,
            app_version,
            os_version,
            device_model,
        } = mobileAuthCredentialDto;

        // const user = await this.userRepository.findOne({
        // 	email,
        // 	isDeleted: false,
        // 	roleId: In(roles),
        // });

        const user = await getManager()
            .createQueryBuilder(User, "user")
            .where(
                `email=:email and role_id  IN (:...role_id) and is_deleted =:is_deleted`,
                { email, role_id: roles, is_deleted: false }
            )
            .getOne();

        if (user && (await user.validatePassword(password))) {
            if (user.status != 1)
                throw new UnauthorizedException(
                    `Your account has been disabled. Please contact customerservice@laytrip.com.`
                );
            if (!user.isVerified) {
                throw new NotAcceptableException(
                    `Your email has been verified.&&&email&&&Your email has been verified.`
                );
            }

            let dateObj = new Date();
            let newToken = md5(dateObj);

            let device = new UserDeviceDetail();
            device.deviceType = device_type;
            device.deviceToken = device_token || "";
            device.deviceModel = device_model;
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
                    username: user.firstName + " " + user.lastName,
                    firstName: user.firstName,
                    phone: user.phoneNo,
                    middleName: "",
                    profilePic: user.profilePic
                        ? `${siteUrl}/profile/${user.profilePic}`
                        : "",
                    lastName: user.lastName,
                    email,
                    salt: user.salt,
                    accessToken: newToken,
                    roleId: user.roleId,
                    createdDate: user.createdDate,
                    socialAccountId: user.socialAccountId,
                };

                const accessToken = this.jwtService.sign(payload);

                const token = {
                    user_details: {
                        access_token: accessToken,
                        id: user.userId,
                        first_name: user.firstName,
                        middle_name: user.middleName || "",
                        last_name: user.lastName,
                        email: user.email,
                        profile_pic: user.profilePic
                            ? `${siteUrl}/profile/${user.profilePic}`
                            : "",
                        gender: user.gender || "",
                    },
                };
                let loginvia = device_type == 1 ? "android" : "ios";
                this.addLoginLog(user.userId, request, loginvia);
                return JSON.parse(JSON.stringify(token).replace(/null/g, '""'));
            } catch (error) {
                throw new InternalServerErrorException(
                    `Oops. Something went wrong. Please try again.`
                );
            }
        } else {
            throw new NotFoundException(
                `Invalid login credentials. Please enter correct email and password.`
            );
        }
    }

    async logout(id: string): Promise<any> {
        try {
            const user = await this.userRepository.findOne({ userId: id });
            if (!user) {
                throw new NotFoundException(
                    `Wrong User ID. Please enter User ID again.&&&user_id&&&${errorMessage}`
                );
            }
            await UserDeviceDetail.delete({ user: user });
            const userData = { message: `Logged out successfully.` };
            return userData;
        } catch (error) {
            throw new NotFoundException(
                `Wrong User ID. Please enter User ID again..&&&user_id&&&${errorMessage}`
            );
        }
    }

    async socialLogin(socialLoginDto: SocialLoginDto, request) {
        const {
            account_type,
            social_account_id,
            email,
            name,
            device_type,
            device_token,
            app_version,
            os_version,
            device_model,
            referral_id,
        } = socialLoginDto;

        let conditions = [];
        conditions.push({ socialAccountId: social_account_id });
        if (email && email != "") {
            conditions.push({ email: email });
        }

        const userExist = await this.userRepository.findOne({
            where: conditions,
        });
        if (userExist) {
            if (userExist.status != 1) {
                throw new UnauthorizedException(
                    `Your account has been disabled. Please contact customerservice@laytrip.com.`
                );
            } else if (userExist.isDeleted == true) {
                throw new UnauthorizedException(
                    `Your account has been deleted. Please contact customerservice@laytrip.com.`
                );
            }
        }
        const user = new User();
        if (email) {
            user.email = email;
        }
        const splitName = name.split(" ");
        if (splitName.length == 1) {
            user.firstName = name || "";
        } else if (splitName.length == 2) {
            user.firstName = splitName[0] || "";
            user.lastName = splitName[1] || "";
        } else {
            user.firstName = splitName[0] || "";
            user.middleName = splitName[1] || "";
            user.lastName = splitName[2] || "";
        }

        if (!userExist) {
            user.userId = uuidv4();
            user.accountType = account_type;
            user.lastName = "";
            user.salt = "";
            user.createdDate = new Date();
            user.updatedDate = new Date();
            user.socialAccountId = social_account_id;
            user.roleId = Role.FREE_USER;
            user.phoneNo = "";
            user.profilePic = "";
            user.timezone = "";
            user.gender = "";
            user.status = 1;
            user.middleName = "";
            if (referral_id) {
                let ref = await this.getReferralId(referral_id);
                user.referralId = ref?.id || null;
            }
            user.zipCode = "";
            user.password = "";
            user.isVerified = true;
            user.isRequireToUpdate = account_type == 3 ? true : false;
            try {
                await user.save();
            } catch (error) {
                throw new InternalServerErrorException(error.sqlMessage);
            }
        } else {
            try {
                var user1 = { firstName: name || "" };
                if (email && email != "") {
                    user1["email"] = email;
                }
                await this.userRepository.update(
                    { socialAccountId: social_account_id },
                    user1
                );
            } catch (error) {
                throw new InternalServerErrorException(error.sqlMessage);
            }
        }

        const userDetail = await this.userRepository.findOne({
            where: conditions,
        });

        let dateObj = new Date();
        let newToken = md5(dateObj);

        let device = new UserDeviceDetail();
        device.deviceType = device_type;
        device.deviceToken = device_token || "";
        device.deviceModel = device_model;
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
                username: userDetail.firstName + " " + userDetail.lastName,
                phone: userDetail.phoneNo,
                firstName: userDetail.firstName,
                middleName: "",
                profilePic: "",
                lastName: userDetail.lastName || "",
                email: email || "",
                salt: "",
                accessToken: newToken,
                roleId: userDetail.roleId,
                createdDate: userDetail.createdDate,
                socialAccountId: userDetail.socialAccountId,
                requireToupdate: userDetail.isRequireToUpdate,
            };

            const accessToken = this.jwtService.sign(payload);

            const token = {
                user_details: {
                    access_token: accessToken,
                    id: userDetail.userId,
                    first_name: userDetail.firstName,
                    last_name: userDetail.lastName || "",
                    middle_name: userDetail.middleName || "",
                    email: userDetail.email || "",
                    profile_pic: "",
                    gender: userDetail.gender || "",
                    createdDate: userDetail.createdDate,
                },
            };
            let loginvia = device_type == 1 ? "android" : "ios";
            this.addLoginLog(user.userId, request, loginvia);

            return token;
        } catch (error) {
            throw new InternalServerErrorException(errorMessage);
        }
    }

    async getProfile(user, siteUrl) {
        const userId = user.userId;
        try {
            const roleId = [
                Role.SUPER_ADMIN,
                Role.ADMIN,
                Role.SUPPORT,
                Role.SUPPLIER,
                Role.FREE_USER,
                Role.GUEST_USER,
                Role.PAID_USER,
            ];
            return await this.userRepository.getUserDetails(
                userId,
                siteUrl,
                roleId
            );
        } catch (error) {
            throw new InternalServerErrorException(errorMessage);
        }
    }
    async checkEmailConflict(
        checkEmailConflictDto: CheckEmailConflictDto
    ): Promise<{ is_available: boolean }> {
        const { email } = checkEmailConflictDto;
        const roles = [Role.FREE_USER, Role.PAID_USER];
        const userExist = await this.userRepository.findOne({
            email,
            roleId: In(roles),
            isDeleted: false,
        });
        if (userExist && userExist.roleId != Role.GUEST_USER) {
            return { is_available: true };
        } else {
            return { is_available: false };
        }
    }
    async updateProfile(
        updateProfileDto: UpdateProfileDto,
        loginUser,
        files,
        siteUrl
    ): Promise<any> {
        try {
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
                passport_number,
                passport_expiry,
                dob,
                address,
                gender,
                language_id,
                currency_id,
                home_airport,
            } = updateProfileDto;

            if (country_id) {
                let countryDetails = await getManager()
                    .createQueryBuilder(Countries, "country")
                    .where(`id=:country_id`, { country_id })
                    .getOne();

                if (!countryDetails)
                    throw new BadRequestException(`No existing Country.`);
            }

            if (state_id) {
                if (!country_id) {
                    throw new BadRequestException(`Enter country code.`);
                }
                let stateDetails = await getManager()
                    .createQueryBuilder(States, "states")
                    .where(`id=:state_id and country_id=:country_id`, {
                        state_id,
                        country_id,
                    })
                    .getOne();
                if (!stateDetails)
                    throw new BadRequestException(
                        `No existing State in this Country.&&&country_id`
                    );
            }

            if (currency_id) {
                let currencyDetails = await getManager()
                    .createQueryBuilder(Currency, "Currency")
                    .where(`id=:currency_id`, { currency_id })
                    .getOne();

                if (!currencyDetails)
                    throw new BadRequestException(
                        `Currency not available.&&&currency_id`
                    );
            }

            if (language_id) {
                let languageDetails = await getManager()
                    .createQueryBuilder(Language, "Language")
                    .where(`id=:language_id`, { language_id })
                    .getOne();

                if (!languageDetails)
                    throw new BadRequestException(
                        `Language id not exist with database.&&&language_id`
                    );
            }
            var age = moment(new Date()).diff(moment(dob), "years");
            if (age < 16) {
                throw new BadRequestException(
                    `Age below 16 years are not allowed to signup on Portal.`
                );
            }
            const user = new User();
            if (home_airport) {
                if (!airports[home_airport]) {
                    throw new BadRequestException(
                        `Please enter valid airport location`
                    );
                }
                user.homeAirport = home_airport;
            }
            if (title) {
                user.title = title;
            }

            user.firstName = first_name;
            user.lastName = last_name;
            user.zipCode = zip_code;
            user.countryCode = country_code ? country_code : null;

            user.address = address ? address : null;

            user.phoneNo = phone_no;
            user.dob = dob;

            user.gender = gender;
            user.preferredCurrency = currency_id ? currency_id : null;
            user.preferredLanguage = language_id ? language_id : null;

            user.passportExpiry = passport_expiry ? passport_expiry : null;

            user.passportNumber = passport_number ? passport_number : null;

            user.countryId = country_id ? country_id : null;

            user.stateId = state_id ? state_id : null;

            user.cityName = city_name ? city_name : null;

            var oldProfile = user.profilePic;

            if (typeof files.profile_pic != "undefined") {
                user.profilePic = files.profile_pic[0].filename;
            } else {
                user.profilePic = null;
            }

            await this.userRepository.update(userId, user);

            if (oldProfile) {
                await fs.unlink(
                    `/var/www/html/api-staging/assets/profile/${oldProfile}`,
                    function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(`${oldProfile} image  deleted!`);
                        }
                        // if no error, file has been deleted successfully
                    }
                );
            }

            // Activity.logActivity(
            // 	userId,
            // 	`auth`,
            // 	`user ${user.email} is update profile`
            // );
            const roleId = [
                Role.ADMIN,
                Role.SUPER_ADMIN,
                Role.PAID_USER,
                Role.FREE_USER,
                Role.GUEST_USER,
                Role.SUPPLIER,
                Role.SUPPORT,
            ];

            const data = await this.userRepository.getUserDetails(
                userId,
                siteUrl,
                roleId
            );
            const payload: JwtPayload = {
                user_id: data.userId,
                email: data.email,
                username: data.firstName + " " + data.lastName,
                firstName: data.firstName,
                phone: data.phoneNo,
                middleName: data.middleName,
                lastName: data.lastName,
                salt: data.salt,
                createdDate: data.createdDate,

                profilePic: data.profilePic ? data.profilePic : "",
                roleId: data.roleId,
                socialAccountId: data.socialAccountId,
            };
            console.log(data);

            const accessToken = this.jwtService.sign(payload);
            const token = accessToken;

            return {
                data: data,
                token: token,
                message: `Your profile has been updated successfully`,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`No user Found.&&&id`);
            }

            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }

            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }
    async updateProfilePic(
        updateProfilePicDto: UpdateProfilePicDto,
        loginUser,
        files,
        siteUrl
    ): Promise<any> {
        try {
            const userId = loginUser.userId;
            const { profile_pic, remove_dp } = updateProfilePicDto;
            const user = new User();
            var oldProfile = user.profilePic;
            const removeDp: any = remove_dp;
            // console.log(remove_dp);
            // console.log(remove_dp == true);
            // console.log(typeof remove_dp);
            //console.log(new ParseBoolPipe(remove_dp));
            if (removeDp == "true") {
                user.profilePic = null;
                console.log("abcc");
            } else if (typeof files.profile_pic != "undefined") {
                user.profilePic = files.profile_pic[0].filename;
                if (oldProfile) {
                    await fs.unlink(
                        `/var/www/html/api-staging/assets/profile/${oldProfile}`,
                        function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(`${oldProfile} image  deleted!`);
                            }
                            // if no error, file has been deleted successfully
                        }
                    );
                }
            } else {
                throw new BadRequestException(`please select your image`);
            }
            await this.userRepository.update(userId, user);

            const roleId = [
                Role.ADMIN,
                Role.SUPER_ADMIN,
                Role.PAID_USER,
                Role.FREE_USER,
                Role.GUEST_USER,
                Role.SUPPLIER,
                Role.SUPPORT,
            ];

            const data = await this.userRepository.getUserDetails(
                userId,
                siteUrl,
                roleId
            );
            const payload: JwtPayload = {
                user_id: data.userId,
                email: data.email,
                username: data.firstName + " " + data.lastName,
                firstName: data.firstName,
                phone: data.phoneNo,
                middleName: data.middleName,
                lastName: data.lastName,
                salt: data.salt,
                createdDate: data.createdDate,

                profilePic: data.profilePic ? data.profilePic : "",
                roleId: data.roleId,
                socialAccountId: data.socialAccountId,
            };
            const accessToken = this.jwtService.sign(payload);
            const token = accessToken;

            return {
                token: token,
                message: `Your profile pic has been updated successfully`,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`No user Found.&&&id`);
            }

            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }

            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
        return await this.userRepository.changePassword(
            changePasswordDto,
            userId
        );
    }

    async prefferedLanguage(
        prefferedLanguageDto: PrefferedLanguageDto,
        userId: string
    ) {
        const { langugeId } = prefferedLanguageDto;

        const user = await this.userRepository.findOne({
            userId: userId,
            isDeleted: false,
        });
        if (!user.isVerified) {
            throw new NotAcceptableException(
                `Your email has been verified.&&&email&&&Your email has been verified.`
            );
        }

        user.preferredLanguage = langugeId;
        user.updatedDate = new Date();
        try {
            await user.save();
            // Activity.logActivity(
            // 	userId,
            // 	`auth`,
            // 	`prefered Languge Updated By user ${user.email} `
            // );
            return { message: "Prefered languge updated successfully" };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`No user Found.&&&id`);
            }

            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }

            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async prefferedCurrency(
        preferedCurrencyDto: PrefferedCurrencyDto,
        userId: string
    ) {
        const { currencyId } = preferedCurrencyDto;

        const user = await this.userRepository.findOne({
            userId: userId,
            isDeleted: false,
        });
        if (!user.isVerified) {
            throw new NotAcceptableException(
                `Your email has been verified.&&&email&&&Your email has been verified.`
            );
        }
        user.preferredCurrency = currencyId;
        user.updatedDate = new Date();
        try {
            await user.save();
            // Activity.logActivity(
            // 	userId,
            // 	`auth`,
            // 	`preffered Currency Updated By user ${user.email}`
            // );
            return { message: "Prefered currency updated successfully" };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`No user Found.&&&id`);
            }

            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message);
            }

            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async signInToOtherUser(signInOtherUserDto, siteUrl, parentUser, req) {
        const { user_id } = signInOtherUserDto;
        try {
            // inactive user also can login
            let user = await this.userRepository.findOne({
                userId: user_id,
            });

            if (!user) {
                throw new UnauthorizedException(
                    `Wrong User ID. Please enter User ID again.`
                );
            } else {
                if (user.status != 1) {
                    throw new UnauthorizedException(
                        `Given account has been disabled. Please contact administrator person.`
                    );
                } else if (user.isDeleted == true) {
                    throw new UnauthorizedException(
                        `Given account has been deleted. Please contact administrator person.`
                    );
                }
                const payload: JwtPayload = {
                    user_id: user.userId,
                    email: user.email,
                    username: user.firstName + " " + user.lastName,
                    firstName: user.firstName,
                    phone: user.phoneNo,
                    middleName: user.middleName,
                    lastName: user.lastName,
                    salt: user.salt,
                    profilePic: user.profilePic
                        ? `${siteUrl}/profile/${user.profilePic}`
                        : "",
                    roleId: user.roleId,
                    refrenceId: parentUser.userId,
                    createdDate: user.createdDate,
                    socialAccountId: user.socialAccountId,
                };
                const accessToken = this.jwtService.sign(payload);
                const token = { token: accessToken };
                this.addLoginLog(
                    user.userId,
                    req,
                    "Admin_panel",
                    parentUser.userId
                );
                return token;
            }
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw new UnauthorizedException(error.message);
            }

            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    addLoginLog(userId, request, loginVia, loginBy = null) {
        const loginLog = new LoginLog();
        loginLog.userId = userId;
        loginLog.ipAddress = request.ip || "";
        loginLog.loginAgent = request?.headers["user-agent"]
            ? request.headers["user-agent"]
            : request.headers;
        if (loginBy) {
            loginLog.loginBy2 = loginBy;
        } else {
            loginLog.loginBy2 = userId;
        }
        loginLog.loginDate = new Date();
        loginLog.loginVia = loginVia;
        getConnection()
            .createQueryBuilder()
            .insert()
            .into(LoginLog)
            .values(loginLog)
            .execute();
    }

    async validateUser(token: string) {
        var decoded = jwt_decode(token);
        const { user_id, iat } = decoded;

        if (!user_id || !uuidValidator(user_id)) {
            throw new BadRequestException("given token is not valid");
        }

        const user = await this.userRepository.findOne({ userId: user_id });
        if (!user) throw new UnauthorizedException();

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

        const unixTimestamp = Math.round(new Date().getTime() / 1000);
        const time = unixTimestamp - iat;
        if (time >= jwtConfig.ExpireIn) {
            throw new BadRequestException(
                `Token Is Expired. Please Try Again.&&&token&&& ${errorMessage}`
            );
        }
        return {
            message: `user validate successfully`,
        };
    }

    async addWebPushNotificationToken(
        user: User,
        addWebNotificationDto: AddWebNotificationDto
    ) {
        try {
            const { end_point, auth_keys, p256dh_keys } = addWebNotificationDto;

            let query = getManager()
                .createQueryBuilder(WebPushNotifications, "notification")
                .where(
                    `"notification"."end_point"= '${end_point}' AND "notification"."user_id"= '${user.userId}'`
                );
            const result = await query.getOne();

            if (result) {
                result.endPoint = end_point;
                result.authKeys = auth_keys;
                result.P256dhKeys = p256dh_keys;
                result.isSubscribed = true;
                result.updatedDate = new Date();
                await result.save();
            } else {
                const token = new WebPushNotifications();

                token.endPoint = end_point;
                token.authKeys = auth_keys;
                token.P256dhKeys = p256dh_keys;
                token.isSubscribed = true;
                token.userId = user.userId;
                token.createdDate = new Date();
                await token.save();
            }

            return {
                message: `Notification service started successfully`,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async getPreference(user: User) {
        return await this.userRepository.getPreference(user);
    }

    async changeUserPreference(
        user: User,
        preferenceDto: updateUserPreference
    ) {
        const { userId } = user;
        const { type, value } = preferenceDto;
        let oppsotiteValue;

        const userDetail = await this.userRepository.findOne({ userId });

        if (type == UserPreference.Email) {
            if (value == userDetail.isEmail) {
                return { message: "Email preference value already up to date" };
            }
        } else if (type == UserPreference.SMS) {
            if (value == userDetail.isSMS) {
                return { message: "SMS preference value already up to date" };
            }
        }

        oppsotiteValue =
            UserPreference.Email == type
                ? userDetail.isSMS
                : userDetail.isEmail;

        if (oppsotiteValue == true) {
            if (type == UserPreference.Email) {
                userDetail.isEmail = value;
            } else if (type == UserPreference.SMS) {
                userDetail.isSMS = value;
            }
        } else {
            throw new ConflictException(
                `It is mandatory to be one preference value is selected at a time.`
            );
        }

        try {
            userDetail.save();
            return {
                message: `${type.charAt(0).toUpperCase() +
                    type.slice(1)} preference value updated successfully`,
            };
        } catch (e) {
            throw new BadRequestException(`something went wrong ${e.message}`);
        }
    }

    async getReferralId(name: string) {
        let where = `"landingPages"."is_deleted" = false AND "landingPages"."name" like '${name}'`;

        const query = getConnection()
            .createQueryBuilder(LandingPages, "landingPages")
            .where(where);

        const result = await query.getOne();
        return result;
    }
}
