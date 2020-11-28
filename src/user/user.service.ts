import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
	ConflictException,
	NotAcceptableException,
	UnauthorizedException,
} from "@nestjs/common";
import { UserRepository } from "../auth/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ListUserDto } from "./dto/list-user.dto";
import { User } from "src/entity/user.entity";
import { SaveUserDto } from "./dto/save-user.dto";
import { errorMessage } from "src/config/common.config";
import { MailerService } from "@nestjs-modules/mailer";
import { v4 as uuidv4 } from "uuid";
import * as config from "config";
import { Role } from "src/enum/role.enum";
import { ProfilePicDto } from "src/auth/dto/profile-pic.dto";
import { In, getManager } from "typeorm";
import { ActiveDeactiveDto } from "./dto/active-deactive-user.dto";
import { isEmail } from "class-validator";

import { Countries } from "src/entity/countries.entity";
import { States } from "src/entity/states.entity";
import { Activity } from "src/utility/activity.utility";

const mailConfig = config.get("email");
const csv = require("csv-parser");
const fs = require("fs");

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserRepository)
		public userRepository: UserRepository,

		public readonly mailerService: MailerService
	) { }

	async create(
		saveUserDto: SaveUserDto,
		files: ProfilePicDto,
		adminId: string
	): Promise<User> {
		const {
			title,
			email,
			password,
			first_name,
			last_name,
			country_code,
			user_type,
			phone_no,
			address,
			zip_code,
			country_id,
			prefer_language,
			state_id,
			city_name,
			gender, dob
		} = saveUserDto;

		let countryDetails = await getManager()
			.createQueryBuilder(Countries, "country")
			.where(`id=:country_id`, { country_id })
			.getOne();
		if (!countryDetails)
			throw new BadRequestException(
				`Country id not exist with database.&&&country_id`
			);

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

		const salt = await bcrypt.genSalt();
		const user = new User();
		user.userId = uuidv4();
		user.accountType = 1;
		user.socialAccountId = "";
		if (typeof files.profile_pic != "undefined")
			user.profilePic = files.profile_pic[0].filename;
		user.timezone = "";
		user.status = 1;
		user.roleId = user_type;
		user.email = email;
		user.firstName = first_name;
		user.middleName = "";
		user.zipCode = zip_code;
		user.lastName = last_name;
		user.salt = salt;
		user.title = title;
		user.countryCode = country_code;
		user.phoneNo = phone_no;
		user.dob = dob
		user.countryId = country_id;
		user.preferredLanguage = prefer_language;
		user.address = address;
		user.stateId = state_id;
		user.cityName = city_name;
		user.gender = gender;
		user.isVerified = true;
		user.createdBy = adminId;
		user.createdDate = new Date();
		user.updatedDate = new Date();
		user.password = await this.userRepository.hashPassword(password, salt);
		const userdata = await this.userRepository.createUser(user);
		delete userdata.password;
		delete userdata.salt;
		if (userdata) {
			Activity.logActivity(adminId, "user", `new user ${user.email} created by admin `);
			this.mailerService
				.sendMail({
					to: userdata.email,
					from: mailConfig.from,
					subject: `Welcome on board`,
					cc: mailConfig.BCC,
					template: "welcome.html",
					context: {
						// Data to be sent to template files.
						username: userdata.firstName + " " + userdata.lastName,
						email: userdata.email,
						password: password,
					},
				})
				.then((res) => {
					console.log("res", res);
				})
				.catch((err) => {
					console.log("err", err);
				});
		}
		return userdata;
	}

	async updateUser(
		updateUserDto: UpdateUserDto,
		UserId: string,
		files: ProfilePicDto,
		adminId: string
	) {
		try {
			const {
				title,
				email,
				first_name,
				last_name,
				country_code,
				phone_no,
				address,
				zip_code,
				country_id,
				state_id,
				city_name,
				gender,
				dob,
				prefer_language
			} = updateUserDto;
			const userId = UserId;

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
				if (!country_id) {
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


			const userData = await this.userRepository.findOne({
				where: {
					userId,
					isDeleted: 0,
					roleId: In([Role.PAID_USER, Role.GUEST_USER, Role.FREE_USER]),
				},
			});

			if (typeof files.profile_pic != "undefined")
				userData.profilePic = files.profile_pic[0].filename;
			userData.timezone = "";
			userData.email = email;
			userData.firstName = first_name;
			userData.middleName = "";
			userData.zipCode = zip_code;
			userData.lastName = last_name;
			userData.title = title;
			userData.countryCode = country_code;
			userData.phoneNo = phone_no;
			userData.preferredLanguage = prefer_language;
			userData.countryId = country_id;
			userData.address = address;
			userData.stateId = state_id;
			userData.cityName = city_name;
			userData.gender = gender;
			userData.updatedBy = adminId;
			userData.dob = dob
			userData.updatedDate = new Date();

			await userData.save();
			Activity.logActivity(adminId, "user", `${userData.email} is updated by admin`);
			return userData;
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
						throw new InternalServerErrorException(error.response.message);
					case 406:
						throw new NotAcceptableException(error.response.message);
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

	async getUserData(userId: string, siteUrl: string): Promise<User> {
		try {
			const roles = [Role.FREE_USER, Role.GUEST_USER, Role.PAID_USER];
			return await this.userRepository.getUserDetails(userId, siteUrl, roles);
		} catch (error) {
			throw new InternalServerErrorException(errorMessage);
		}
	}

	async activeDeactiveUser(
		userId: string,
		activeDeactiveDto: ActiveDeactiveDto,
		adminId: string
	) {
		try {
			const { status } = activeDeactiveDto;
			const user = await this.userRepository.findOne({
				userId,
				roleId: In([Role.FREE_USER, Role.PAID_USER, Role.GUEST_USER]),
			});

			if (!user) throw new NotFoundException(`No user found`);
			var statusWord = status == true ? 1 : 0;
			user.status = statusWord;
			user.updatedBy = adminId;
			user.updatedDate = new Date();
			await user.save();

			Activity.logActivity(adminId, "user", `user ${user.email}  status changed by admin`);
			return { message: `user status changed` };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No user Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}


	async weeklyRagisterUser(): Promise<any> {
		try {
			var date = new Date();
			var fdate = date.toLocaleString("en-US", {
				weekday: "long",
			});
			var weekday = new Array(7);
			weekday[0] = "Monday";
			weekday[1] = "Tuesday";
			weekday[2] = "Wednesday";
			weekday[3] = "Thursday";
			weekday[4] = "Friday";
			weekday[5] = "Saturday";
			weekday[6] = "Sunday";
			var day = weekday.indexOf(fdate);
			var fromDate = new Date();
			fromDate.setDate(fromDate.getDate() - day);
			var mondayDate = fromDate.toISOString();
			mondayDate = mondayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			var toDate = new Date();

			var todayDate = toDate.toISOString();
			todayDate = todayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			console.log(mondayDate);
			console.log(mondayDate);

			const result = await this.userRepository.query(
				`SELECT DATE("created_date"),COUNT(DISTINCT("User"."user_id")) as "count" FROM "user" "User" WHERE role_id In (${Role.FREE_USER},${Role.GUEST_USER},${Role.PAID_USER}) and DATE(created_date) >= '${mondayDate}' AND DATE(created_date) <= '${todayDate}' GROUP BY DATE("created_date")`
			);
			return { result };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No user Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async getCounts(): Promise<{ result: any }> {
		try {
			const activeUser = await this.userRepository.query(
				`SELECT status as StatusCode,CASE WHEN status = 0 THEN 'Deactive' ELSE 'Active' END AS status, count(*) AS count FROM "user" where "is_deleted" = false AND role_id In (${Role.FREE_USER},${Role.GUEST_USER},${Role.PAID_USER}) GROUP BY status`
			);
			return { result: activeUser };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No user Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async listUser(
		paginationOption: ListUserDto,
		siteUrl: string
	): Promise<{ data: User[]; TotalReseult: number }> {
		try {
			return await this.userRepository.listUser(
				paginationOption,
				[Role.PAID_USER, Role.GUEST_USER, Role.FREE_USER],
				siteUrl
			);
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No Data Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async deleteUser(userId: string, adminId: string) {
		try {
			const user = await this.userRepository.findOne({
				userId,
				isDeleted: false,
			});

			if (!user) throw new NotFoundException(`No user found`);
			if (user.roleId <= 2) {
				throw new ForbiddenException(
					`You are not allowed to access this resource.`
				);
			} else {
				user.isDeleted = true;
				user.updatedBy = adminId;
				user.updatedDate = new Date();
				await user.save();
				Activity.logActivity(adminId, "user", `${user.email} user is deleted by admin`);
				return { messge: `User deleted successfully` };
			}
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No user Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async importUser(importUserDto, files, userId, siteUrl) {
		var count = 0;
		const unsuccessRecord = new Array();
		const csvData = [];
		const csv = require("csvtojson");
		const array = await csv().fromFile("./" + files[0].path);

		for (let index = 0; index < array.length; index++) {
			console.log(index);
			var row = array[index];
			console.log(row.first_name);
			if (row) {
				if (
					row.first_name != "" &&
					row.email_id != "" &&
					isEmail(row.email_id) &&
					row.password != "" &&
					row.type != "" &&
					parseInt(row.type) >= 5 &&
					parseInt(row.type) <= 7
				) {
					var data = {
						firstName: row.first_name,
						middleName: row.middle_name,
						lastName: row.last_name,
						email: row.email_id,
						contryCode: row.contry_code,
						phoneNumber: row.phone_number,
						password: row.password,
						roleId: row.type,
						adminId: userId,
					};
					var userData = await this.userRepository.insertNewUser(data);

					if (userData) {
						count++;
						this.mailerService
							.sendMail({
								to: data.email,
								from: mailConfig.from,
								cc: mailConfig.BCC,
								subject: `Welcome on board`,
								template: "welcome.html",
								context: {
									// Data to be sent to template files.
									username: data.firstName + " " + data.lastName,
									email: data.email,
									password: data.password,
								},
							})
							.then((res) => {
								console.log("res", res);
							})
							.catch((err) => {
								console.log("err", err);
							});
					} else {
						row.error_message = "Email id alredy available";
						unsuccessRecord.push(row);
					}
				} else {
					var error_message = '';
					if (row.first_name == "")
						error_message += "First name required";

					if (row.email_id == "")
						error_message += "Email id required";

					if (!isEmail(row.email_id))
						error_message += "Please enter valid email id";

					if (row.password == "")
						error_message += "Password is required";

					if (row.type == "")
						error_message += "user type required";

					if (parseInt(row.type) >= 5 &&
						parseInt(row.type) <= 7)
						error_message += "Add valid user type";

					row.error_message = error_message;
					unsuccessRecord.push(row);
				}
			}
		}
		Activity.logActivity(userId, "user", `admin import the  ${count}  users`);
		return { importCount: count, unsuccessRecord: unsuccessRecord };
	}
	//Export user
	async exportUser(adminId: string): Promise<{ data: User[] }> {
		Activity.logActivity(adminId, "user", `all user list export by admin`);
		return await this.userRepository.exportUser([
			Role.PAID_USER,
			Role.GUEST_USER,
			Role.FREE_USER,
		]);
	}
}
