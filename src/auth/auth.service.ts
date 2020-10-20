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
import { UpdatePasswordDto } from "./dto/update-password.dto";
import * as jwt_decode from "jwt-decode";
import * as crypto from "crypto";
import { forgetPass } from "./forget-Pass.interface";
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
import { VerifyEmailIdTemplete } from "src/config/email_template/email-id-verify.html";
import { OtpDto } from "./dto/otp.dto";

import { RagisterMail } from "src/config/email_template/register-mail.html";
import { ReSendVerifyoOtpDto } from "./dto/resend-verify-otp.dto";
import { UpdateEmailId } from "./dto/update-email.dto";
import { Currency } from "src/entity/currency.entity";
import { Language } from "src/entity/language.entity";
import { CheckEmailConflictDto } from "./dto/check-email-conflict.dto";
import { forgotPasswordMail } from "src/config/email_template/forgot-password-mail.html";
import { SubscribeForNewslatterDto } from "../news-letters/dto/subscribe-for-newslatter.dto";
import { NewsLetters } from "src/entity/news-letter.entity";
import { subscribeForNewsUpdates } from "src/config/email_template/subscribe-newsletter.html";

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

	async signUp(createUser: CreateUserDto, request) {
		const {
			first_name,
			last_name,
			email,
			password,
			gender,
			signup_via,
			device_type,
			device_token,
			os_version,
			app_version,
			device_model,
		} = createUser;

		let loginvia = "";
		const userExist = await this.userRepository.findOne({
			email: email,
		});

		if (userExist)
		{
			if (userExist.status != 1)
			{
				throw new UnauthorizedException(
					`Your account has been disabled. Please contact administrator person.`
				);
			}else if(userExist.isDeleted == true){
				throw new UnauthorizedException(
					`Your account has been deleted. Please contact administrator person.`
				);
			}else{
				throw new ConflictException(
					`This email address is already registered with us. Please enter different email address.`
				);
			}
				

		}
			

		const user = new User();
		const salt = await bcrypt.genSalt();
		user.userId = uuidv4();
		user.accountType = 1;
		user.email = email;
		user.firstName = first_name;
		user.lastName = last_name;
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
		user.password = await this.hashPassword(password, salt);
		user.gender = gender;
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
			this.mailerService
				.sendMail({
					to: email,
					from: "no-reply@laytrip.com",
					subject: "Verify your account",
					html: VerifyEmailIdTemplete({
						username: first_name + " " + last_name,
						otp: user.otp,
					}),
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

	hashPassword(password: string, salt: string): Promise<string> {
		return bcrypt.hash(password, salt);
	}

	async resendOtp(reSendVerifyoOtpDto: ReSendVerifyoOtpDto) {
		const { email } = reSendVerifyoOtpDto;
		const user = await this.userRepository.findOne({
			where: { email, isDeleted: false },
		});

		if (!user)
			throw new NotFoundException(
				`Email is not registered with us. Please check the email.&&&email`
			);

		if (user.status != 1)
			throw new UnauthorizedException(
				`Your account has been disabled. Please contact administrator person.`
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
					from: "no-reply@laytrip.com",
					subject: "Verify your account",
					html: VerifyEmailIdTemplete({
						username: user.firstName + " " + user.lastName,
						otp: user.otp,
					}),
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
		Activity.logActivity(user.userId, `auth`, ` ${email} user is signup`);
		return { message: `Otp send on your email id` };
	}

	async UpdateEmailId(updateEmailId: UpdateEmailId, userData: User) {
		if (userData.email) {
			throw new ConflictException(`You have alredy added email id`);
		}
		const { newEmail } = updateEmailId;
		const email = userData.email;
		const user = await this.userRepository.findOne({
			where: { userId: userData.userId, isDeleted: false },
		});

		if (!user)
			throw new NotFoundException(
				`Email is not registered with us. Please check the email.&&&email`
			);

		if (user.status != 1)
			throw new UnauthorizedException(
				`Your account has been disabled. Please contact administrator person.`
			);
		const userExist = await this.userRepository.findOne({
			email: newEmail,
		});

		if (userExist)
			throw new ConflictException(
				`This email address is already registered with us. Please enter different email address.`
			);
		user.email = newEmail;
		//user.isVerified = false;
		//user.otp = Math.round(new Date().getTime() / 1000);
		try {
			await user.save();
			this.mailerService
				.sendMail({
					to: newEmail,
					from: "no-reply@laytrip.com",
					subject: "Verify your account",
					html: VerifyEmailIdTemplete({
						username: user.firstName + " " + user.lastName,
						otp: user.otp,
					}),
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
		Activity.logActivity(
			user.userId,
			`auth`,
			` user is update the Email id ${email} to ${newEmail} `
		);
		return { message: `Otp send on your email id` };
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

		if (user && (await user.validatePassword(password))) {
			if (user.status != 1)
				throw new UnauthorizedException(
					`Your account has been disabled. Please contact administrator person.`
				);
			if (!user.isVerified) {
				throw new NotAcceptableException(
					`Please verify your email id&&&email&&&Please verify your email id`
				);
			}
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
			};
			const accessToken = this.jwtService.sign(payload);
			const token = { token: accessToken };
			this.addLoginLog(user.userId, request, "web");
			return token;
		} else {
			throw new UnauthorizedException(
				`Invalid login credentials! Please enter correct email id and password.`
			);
		}
	}

	async forgetPassword(forgetPasswordDto: ForgetPasswordDto, siteUrl) {
		const { email } = forgetPasswordDto;
		var roles = [
			Role.ADMIN,
			Role.SUPER_ADMIN,
			Role.SUPPLIER,
			Role.FREE_USER,
			Role.PAID_USER,
		];
		const user = await this.userRepository.findOne({
			email,
			roleId: In(roles),
		});
		if (!user) {
			throw new NotFoundException(
				`Email is not registered with us. Please check the email.`
			);
		}
		if (user.isDeleted == true || user.status == 0) {
			throw new NotFoundException(`Given Email id is Deleted`);
		}
		if (!user.isVerified) {
			throw new NotAcceptableException(
				`Please verify your email id&&&email&&&Please verify your email id`
			);
		}
		// var unixTimestamp = Math.round(new Date().getTime() / 1000);

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
		Activity.logActivity(
			user.userId,
			`auth`,
			` ${email} user is request to forget password using ${otp} otp`
		);
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
				from: "no-reply@laytrip.com",
				subject: "Forgot Password",
				html: forgotPasswordMail({
					username: user.firstName + " " + user.lastName,
					otp: otp,
				}),
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

	async updatePassword(newPasswordDto: NewPasswordDto) {
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
			where: { email: email, isDeleted: 0, status: 1, roleId: In(roles) },
		});

		if (!user) {
			throw new NotFoundException(
				`Email is not registered with us. Please check the email.&&&email`
			);
		}
		if (!user.isVerified) {
			throw new NotAcceptableException(
				`Please verify your email id&&&email&&&Please verify your email id`
			);
		}
		Activity.logActivity(
			user.userId,
			`auth`,
			`${user.email} is forget password using ${otp} otp`
		);

		const validate = await this.forgetPasswordRepository.findOne({
			where: { email: email, is_used: 0, otp: otp },
		});
		if (validate) {
			const salt = await bcrypt.genSalt();
			user.salt = salt;
			user.password = await this.hashPassword(new_password, salt);
			validate.is_used = 1;
			validate.updateTime = new Date();
			try {
				await user.save();
				await validate.save();
				const res = { message: `Your password has been succesfully updated` };
				return res;
			} catch (error) {
				throw new InternalServerErrorException(
					`${error.sqlMessage}&&& &&&` + errorMessage
				);
			}
		} else {
			throw new BadRequestException(
				`Otp Can not be validate.&&&token&&&${errorMessage}`
			);
		}
	}

	async VerifyOtp(OtpDto: OtpDto, req, siteUrl: string) {
		const { otp, email } = OtpDto;

		const user = await this.userRepository.findOne({
			where: { email: email, isDeleted: 0, status: 1 },
		});

		if (!user) {
			throw new NotFoundException(
				`Email is not registered with us. Please check the email.&&&email`
			);
		}
		let accessToken;
		let loginvia;
		console.log(user.validateOtp(otp));
		if (user.otp == otp) {
			try {
				user.isVerified = true;
				await user.save();
				if (user.registerVia == "android" || user.registerVia == "ios") {
					loginvia = "mobile";
					try {
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
						};

						accessToken = this.jwtService.sign(payload);
					} catch (error) {
						throw new InternalServerErrorException(
							`Oops. Something went wrong. Please try again.`
						);
					}
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
						from: "no-reply@laytrip.com",
						subject: "Welcome on board",
						html: RagisterMail({
							username: user.firstName + " " + user.lastName,
						}),
					})
					.then((res) => {
						console.log("res", res);
					})
					.catch((err) => {
						console.log("err", err);
					});
				Activity.logActivity(
					user.userId,
					`auth`,
					`${email} user is verify own account`
				);
				return { userDetails };
			} catch (error) {
				throw new InternalServerErrorException(
					`${error.sqlMessage}&&& &&&` + errorMessage
				);
			}
		} else {
			throw new BadRequestException(
				`Given otp is wrong.&&&token&&&Given otp is wrong.`
			);
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
		const user = await this.userRepository.findOne({
			email,
			isDeleted: false,
			roleId: In(roles),
		});

		if (user && (await user.validatePassword(password))) {
			if (user.status != 1)
				throw new UnauthorizedException(
					`Your account has been disabled. Please contact administrator person.`
				);
			if (!user.isVerified) {
				throw new NotAcceptableException(
					`Please verify your email id&&&email&&&Please verify your email id`
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
				`Invalid login credentials! Please enter correct email address and password.`
			);
		}
	}

	async logout(id: string): Promise<any> {
		try {
			const user = await this.userRepository.findOne({ userId: id });
			if (!user) {
				throw new NotFoundException(
					`Invalid user id! Please enter correct user id&&&user_id&&&${errorMessage}`
				);
			}
			await UserDeviceDetail.delete({ user: user });
			const userData = { message: `Logged out successfully.` };
			return userData;
		} catch (error) {
			throw new NotFoundException(
				`Invalid user id! Please enter correct user id.&&&user_id&&&${errorMessage}`
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
		} = socialLoginDto;

		let conditions = [];
		conditions.push({ socialAccountId: social_account_id });
		if (email) {
			conditions.push({ email: email });
		}

		const userExist = await this.userRepository.findOne({
			where: conditions,
		});
		if (userExist)
		{
			if (userExist.status != 1)
			{
				throw new UnauthorizedException(
					`Your account has been disabled. Please contact administrator person.`
				);
			}else if(userExist.isDeleted == true){
				throw new UnauthorizedException(
					`Your account has been deleted. Please contact administrator person.`
				);
			}
		}
		const user = new User();
		user.email = email || "";
		user.firstName = name || "";

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
			user.zipCode = "";
			user.password = "";
			user.isVerified = true;

			try {
				await user.save();
			} catch (error) {
				throw new InternalServerErrorException(error.sqlMessage);
			}
		} else {
			try {
				const user1 = { email: email || "", firstName: name || "" };
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
				createdDate: user.createdDate,
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

			return JSON.parse(JSON.stringify(token).replace(/null/g, '""'));
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
				Role.SUPPLIER,
				Role.FREE_USER,
				Role.GUEST_USER,
				Role.PAID_USER,
			];
			return await this.userRepository.getUserDetails(userId, siteUrl, roleId);
		} catch (error) {
			throw new InternalServerErrorException(errorMessage);
		}
	}
	async checkEmailConflict(
		checkEmailConflictDto: CheckEmailConflictDto
	): Promise<{ is_available: boolean }> {
		const { email } = checkEmailConflictDto;
		const userExist = await this.userRepository.findOne({
			email,
		});
		if (userExist && userExist.roleId != Role.GUEST_USER) {
			return { is_available: true };
		} else {
			return { is_available: false };
		}
	}
	async updateProfile(
		updateProfileDto,
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
			} = updateProfileDto;

			if (country_id) {
				let countryDetails = await getManager()
					.createQueryBuilder(Countries, "country")
					.where(`id=:country_id`, { country_id })
					.getOne();

				if (!countryDetails)
					throw new BadRequestException(
						`Country id not exist with database.&&&country_id`
					);
			}

			if (state_id) {
				if(!country_id)
				{
					throw new BadRequestException(`Please enter country code&&&country&&&Please enter country code`)
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
						`State id not exist with country id.&&&country_id`
					);
			}

			if (currency_id) {
				let currencyDetails = await getManager()
					.createQueryBuilder(Currency, "Currency")
					.where(`id=:currency_id`, { currency_id })
					.getOne();

				if (!currencyDetails)
					throw new BadRequestException(
						`Currency id not exist with database.&&&currency_id`
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
			const user = new User();
			user.title = title;
			user.firstName = first_name;
			user.lastName = last_name;
			user.zipCode = zip_code;
			if (country_code) user.countryCode = country_code;

			if (address) user.address = address;

			user.phoneNo = phone_no;
			user.dob = dob;

			user.gender = gender;
			user.preferredCurrency = currency_id ? currency_id : null;
			user.preferredLanguage = language_id ? language_id : null;
			if (passport_expiry) user.passportExpiry = passport_expiry;

			if (passport_number) user.passportNumber = passport_number;

			if (country_id) user.countryId = country_id;

			if (state_id) user.stateId = state_id;

			if (city_name) user.cityName = city_name;

			var oldProfile = user.profilePic;

			if (typeof files.profile_pic != "undefined")
				user.profilePic = files.profile_pic[0].filename;

			await this.userRepository.update(userId, user);

			if (oldProfile) {
				await fs.unlink(
					`/var/www/html/api-staging/assets/profile/${oldProfile}`,
					function(err) {
						if (err) {
							console.log(err);
						}
						else
						{
							console.log(`${oldProfile} image  deleted!`);
						}
						// if no error, file has been deleted successfully
					}
				);
			}

			Activity.logActivity(
				user.userId,
				`auth`,
				`user ${user.email} is update profile`
			);
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

				profilePic: data.profilePic
					? `${siteUrl}/profile/${user.profilePic}`
					: "",
				roleId: data.roleId,
			};
			const accessToken = this.jwtService.sign(payload);
			const token = accessToken;

			return { data: data, token: token };
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
		return await this.userRepository.changePassword(changePasswordDto, userId);
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
				`Please verify your email id&&&email&&&Please verify your email id`
			);
		}

		user.preferredLanguage = langugeId;
		user.updatedDate = new Date();
		try {
			await user.save();
			Activity.logActivity(
				userId,
				`auth`,
				`prefered Languge Updated By user ${user.email} `
			);
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
				`Please Verify Your Email Id&&&email&&&Please Verify Your Email Id`
			);
		}
		user.preferredCurrency = currencyId;
		user.updatedDate = new Date();
		try {
			await user.save();
			Activity.logActivity(
				userId,
				`auth`,
				`preffered Currency Updated By user ${user.email}`
			);
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

	async signInToOtherUser(signInOtherUserDto, siteUrl, parentUser) {
		const { user_id } = signInOtherUserDto;
		try {
			// inactive user also can login
			let user = await this.userRepository.findOne({
				userId: user_id,
				isDeleted: false,
			});

			if (!user) {
				throw new UnauthorizedException(
					`Invalid user id! Please enter valid user id.`
				);
			} else {
				if (!user.isVerified) {
					throw new NotAcceptableException(
						`Please verify your email id&&&email&&&Please verify your email id`
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
				};
				const accessToken = this.jwtService.sign(payload);
				const token = { token: accessToken };
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

	addLoginLog(userId, request, loginVia) {
		const loginLog = new LoginLog();
		loginLog.userId = userId;
		loginLog.ipAddress = request.ip || "";
		loginLog.loginAgent =
			typeof request.headers["user-agent"] != "undefined"
				? request.headers["user-agent"]
				: request.headers;
		loginLog.loginDate = new Date();
		loginLog.loginVia = loginVia;
		getConnection()
			.createQueryBuilder()
			.insert()
			.into(LoginLog)
			.values(loginLog)
			.execute();
	}
}
