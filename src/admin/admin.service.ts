/*
 * Created on Mon Jul 06 2020
 *
 * @Auther:- Parth Virani
 * Copyright (c) 2020 Oneclick
 * my variables are ${myvar1} and ${myvar2}
 */

import {
	Injectable,
	ForbiddenException,
	NotFoundException,
	InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "src/auth/user.repository";
import { MailerService } from "@nestjs-modules/mailer";
import { SaveUserDto } from "src/user/dto/save-user.dto";
import * as config from "config";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
const mailConfig = config.get("email");
import { errorMessage } from "src/config/common.config";
import { ListUserDto } from "src/user/dto/list-user.dto";
import { SaveAdminDto } from "./dto/save-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { ListAdminDto } from "./dto/list-admin.dto";
import { ProfilePicDto } from "src/auth/dto/profile-pic.dto";
import { In } from "typeorm";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User } from "src/entity/user.entity";
import { Role } from "src/enum/role.enum";
import { ActiveDeactiveDto } from "src/user/dto/active-deactive-user.dto";
import { isEmail } from "class-validator";
import { Activity } from "src/utility/activity.utility";

@Injectable()
export class AdminService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,

		private readonly mailerService: MailerService
	) {}

	/**
	 *
	 * Create new Sub Admin
	 * @param saveUserDto
	 */

	async createAdmin(
		saveUserDto: SaveAdminDto,
		files: ProfilePicDto,
		adminId: string
	): Promise<User> {
		const { email, password, first_name, last_name } = saveUserDto;
		const salt = await bcrypt.genSalt();
		const user = new User();
		user.userId = uuidv4();
		user.accountType = 1;
		user.socialAccountId = "";
		user.phoneNo = "";
		if (typeof files.profile_pic != "undefined")
			user.profilePic = files.profile_pic[0].filename;
		user.timezone = "";
		user.status = 1;
		user.roleId = 2;
		user.email = email;
		user.firstName = first_name;
		user.middleName = "";
		user.zipCode = "";
		user.lastName = last_name;
		user.salt = salt;
		user.createdBy = adminId;
		user.createdDate = new Date();
		user.updatedDate = new Date();
		user.password = await this.userRepository.hashPassword(password, salt);
		const userdata = await this.userRepository.createUser(user);
		delete userdata.password;
		delete userdata.salt;
		if (userdata) {
			Activity.logActivity(adminId, "Admin", `create new admin${user.userId}`);
			this.mailerService
				.sendMail({
					to: userdata.email,
					from: mailConfig.from,
					subject: `Welcome on board`,
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

	/**
	 * update sub admin  only access to a super admin
	 * @param updateUserDto
	 * @param UserId
	 */

	async updateAdmin(
		updateAdminDto: UpdateAdminDto,
		UserId: string,
		files: ProfilePicDto,
		adminId: string
	) {
		try {
			const { firstName, middleName, lastName, profile_pic } = updateAdminDto;
			const userId = UserId;
			const userData = await this.userRepository.findOne({
				where: { userId, isDeleted: 0, roleId: In([2]) },
			});

			userData.firstName = firstName;
			userData.middleName = middleName || "";
			userData.lastName = lastName;
			userData.updatedBy = adminId;
			if (typeof files.profile_pic != "undefined")
				userData.profilePic = files.profile_pic[0].filename;
			userData.updatedDate = new Date();
			/* userData.gender = gender;
			userData.country = country;
			userData.state = state;
			userData.city = city;
			userData.address = address
			userData.zipCode = zipCode */

			delete userData.password;
			delete userData.salt;

			await userData.save();
			Activity.logActivity(adminId, "admin", `update admin ${userId}`);
			return userData;
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

	/**
	 * - list Admin by Super admin
	 * @param paginationOption
	 */
	async listAdmin(
		paginationOption: ListAdminDto,
		siteUrl: string
	): Promise<{ data: User[]; TotalReseult: number }> {
		try {
			return await this.userRepository.listUser(paginationOption, [2], siteUrl);
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No supplier Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	//Export user
	async exportAdmin(adminId: string): Promise<{ data: User[] }> {
		Activity.logActivity(adminId, "admin", `export admin`);
		return await this.userRepository.exportUser([2]);
	}

	/**
	 * delete Admin
	 * @param userId
	 */
	async deleteAdmin(userId: string, adminId: string) {
		try {
			const user = await this.userRepository.findOne({
				userId,
				isDeleted: false,
			});

			if (!user) throw new NotFoundException(`No user found`);

			if (user.roleId == 1) {
				throw new ForbiddenException(
					`You are not allowed to access this resource.`
				);
			} else {
				user.isDeleted = true;
				user.updatedBy = adminId;
				user.updatedDate = new Date();
				await user.save();
				Activity.logActivity(adminId, "admin", `delete admin ${userId}`);
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

	async getAdminData(userId: string, siteUrl: string): Promise<User> {
		try {
			const user = await this.userRepository.findOne({
				where: { userId, isDeleted: false, roleId: In[Role.ADMIN] },
			});

			if (!user) {
				throw new NotFoundException(`No Admin found`);
			}
			delete user.salt;
			delete user.password;
			user.profilePic = user.profilePic
				? `${siteUrl}/profile/${user.profilePic}`
				: "";
			return user;
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No Admin found`);
			}
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}
	async activeDeactiveAdmin(
		userId: string,
		activeDeactiveDto: ActiveDeactiveDto,
		adminId: string
	) {
		try {
			const { status } = activeDeactiveDto;
			const user = await this.userRepository.findOne({
				userId,
				roleId: In([Role.ADMIN]),
			});

			if (!user) throw new NotFoundException(`No user found`);

			console.log(status);

			user.status = status;
			user.updatedBy = adminId;
			user.isDeleted = true;
			user.updatedDate = new Date();
			await user.save();
			var statusWord = status == 1 ? "Active" : "Deactive";
			Activity.logActivity(adminId, `Admin`, `${statusWord} admin ${userId}`);
			return { messge: `User ${statusWord} successfully` };
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
				`SELECT status as StatusCode,CASE WHEN status = 0 THEN 'Deactive' ELSE 'Active' END AS status, count(*) AS count FROM "user" where role_id In (${Role.ADMIN}) GROUP BY status`
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

	async weeklyRegisterAdmin(): Promise<any> {
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
			const result = await this.userRepository.query(
				`SELECT DATE("created_date"),COUNT(DISTINCT("User"."user_id")) as "count" FROM "user" "User" WHERE role_id In (${Role.ADMIN}) and created_date BETWEEN '${mondayDate}' AND '${todayDate}' GROUP BY DATE("created_date")`
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

	async importAdmin(importUserDto, files, userId, siteUrl) {
		var count = 0;
		const unsuccessRecord = new Array();
		const csv = require("csvtojson");
		const array = await csv().fromFile("./" + files[0].path);
		for (let index = 0; index < array.length; index++) {
			var row = array[index];
			if (row) {
				if (
					row.first_name != "" &&
					row.email_id != "" &&
					isEmail(row.email_id) &&
					row.password != "" &&
					row.type != "" &&
					parseInt(row.type) == 2
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
						unsuccessRecord.push(row);
					}
				} else {
					unsuccessRecord.push(row);
				}
			}
		}
		Activity.logActivity(userId, "admin", `import ${count}  admin`);
		return { importCount: count, unsuccessRecord: unsuccessRecord };
	}
}
