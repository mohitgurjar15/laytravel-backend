import {
	Injectable,
	ForbiddenException,
	NotFoundException,
	InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "src/auth/user.repository";
import { MailerService } from "@nestjs-modules/mailer";
import * as config from "config";
const mailConfig = config.get("email");
import { Role } from "src/enum/role.enum";
import { errorMessage } from "src/config/common.config";
import { SaveSupplierDto } from "./dto/save-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { ListSupplierDto } from "./dto/list-supplier.dto";
import { ProfilePicDto } from "src/auth/dto/profile-pic.dto";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User } from "src/entity/user.entity";
import { In } from "typeorm";
import { isEmail } from "class-validator";
import { Activity } from "src/utility/activity.utility";
import { ActiveDeactiveDto } from "src/user/dto/active-deactive-user.dto";
import { RagisterMail } from "src/config/email_template/register-mail.html";
import { ExportUserDto } from "src/user/dto/export-user.dto";

@Injectable()
export class SupplierService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,

		private readonly mailerService: MailerService
	) {}

	/**
	 *
	 * Create new supplier
	 * @param saveUserDto
	 */

	async createSupplier(
		saveUserDto: SaveSupplierDto,
		files: ProfilePicDto,
		adminId: string,
		siteUrl
	): Promise<User> {
		const { email, password, first_name, last_name, gender , title  } = saveUserDto;
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
		user.title = title;
		user.roleId = Role.SUPPLIER;
		user.email = email;
		user.gender = gender;
		user.firstName = first_name;
		user.middleName = "";
		user.zipCode = "";
		user.lastName = last_name;
		user.salt = salt;
		user.isVerified = true;
		user.createdBy = adminId;
		user.createdDate = new Date();
		user.updatedDate = new Date();
		user.password = await this.userRepository.hashPassword(password, salt);
		const roles = [Role.ADMIN,Role.SUPER_ADMIN,Role.SUPPLIER,Role.SUPPORT]
		
		const userdata = await this.userRepository.createUser(user,roles);
		delete userdata.password;
		delete userdata.salt;
		if (userdata) {
			this.mailerService
				.sendMail({
					to: userdata.email,
					from: mailConfig.from,
					subject: `Welcome on board`,
					cc:mailConfig.BCC,
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
		Activity.logActivity(
			adminId,
			"supplier-user",
			`Supplier-user ${user.email} is added by admin`,
			null,
			userdata
		);
		return this.userRepository.getUserDetails(userdata.userId, siteUrl, [
			Role.SUPPLIER,
		]);
	}

	/**
	 * update supplier
	 * @param updateUserDto
	 * @param UserId
	 */

	async updateSupplier(
		updateSupplierDto: UpdateSupplierDto,
		UserId: string,
		files: ProfilePicDto,
		adminId: string,
		siteUrl: string
	) {
		try {
			const {
				firstName,
				middleName,
				lastName,
				gender,
				title,
				profile_pic,
			} = updateSupplierDto;
			const userId = UserId;
			const userData = await this.userRepository.findOne({
				where: { userId, isDeleted: 0, roleId: In([Role.SUPPLIER]) },
			});
			const previousData = userData
			userData.firstName = firstName;
			userData.middleName = middleName || "";
			userData.lastName = lastName;
			userData.title = title;
			userData.gender = gender;
			userData.updatedBy = adminId;
			if (typeof files.profile_pic != "undefined")
				userData.profilePic = files.profile_pic[0].filename;
			userData.updatedDate = new Date();

			await userData.save();
			const currentData = userData
			Activity.logActivity(
				adminId,
				"supplier-user",
				` ${userData.email} is updated by the admin`,
				previousData,
				currentData
			);
			return this.userRepository.getUserDetails(userData.userId, siteUrl, [
				Role.SUPPLIER,
			]);
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
	 * - list supplier
	 * @param paginationOption
	 */
	async listSupplier(
		paginationOption: ListSupplierDto,
		siteUrl: string
	): Promise<{ data: User[]; TotalReseult: number }> {
		try {
			return await this.userRepository.listUser(
				paginationOption,
				[Role.SUPPLIER],
				siteUrl
			);
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No data Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	/**
	 * delete supplier
	 * @param userId
	 */
	async deleteSupplier(userId: string, adminId: string) {
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
				const previousData = user
				user.isDeleted = true;
				user.updatedBy = adminId;
				user.updatedDate = new Date();
				await user.save();
				const currentData = user
				Activity.logActivity(
					adminId,
					"supplier-user",
					` ${user.email} is deleted by admin`,
					previousData,
					currentData
				);
				return { messge: `supplier deleted successfully` };
			}
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
	async exportSupplier(adminId: string,paginationOption: ExportUserDto): Promise<{ data: User[] }> {
		Activity.logActivity(
			adminId,
			"supplier-user",
			`All supplier user list export by admin `
		);
		return await this.userRepository.exportUser(paginationOption,[Role.SUPPLIER]);
	}

	async importSupplier(importUserDto, files, userId, siteUrl) {
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
					parseInt(row.type) == 4
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
					var userData = await this.userRepository.insertNewUser(data,[Role.SUPPLIER]);

					if (userData) {
						count++;
						this.mailerService
							.sendMail({
								to: data.email,
								from: mailConfig.from,
								cc:mailConfig.BCC,
								subject: `Welcome on board`,
								html: RagisterMail({
									username: data.firstName + " " + data.lastName
								},data.password)
							})
							.then((res) => {
								console.log("res", res);
							})
							.catch((err) => {
								console.log("err", err);
							});
						} else {
							row.error_message = "Email id alredy available. ||";
							unsuccessRecord.push(row);
						}
					} else {
						var error_message = '';
					if (row.first_name == "")
						error_message += "First name required. ||";

					if (row.email_id == "")
						error_message += "Email id required. ||";

					if (!isEmail(row.email_id))
						error_message += "Please enter valid email id. ||";

					if (row.password == "")
						error_message += "Password is required. ||";

					if (row.type == "")
						error_message += "user type required. ||";

					if (parseInt(row.type) != 4)
						error_message += "Add valid supplier user type. ||";

					row.error_message = error_message;
					unsuccessRecord.push(row);
					}
			}
		}
		Activity.logActivity(
			userId,
			"supplier-user",
			`Admin impport  ${count} supplier user`
		);
		return { importCount: count, unsuccessRecord: unsuccessRecord };
	}

	async weeklyRagisterUser(): Promise<any> {
		try {
			var date = new Date();
			var fdate = date.toLocaleString("en-US", {
				weekday: "long",
			});
			var weekday = new Array(7);
			weekday[1] = "Monday";
			weekday[2] = "Tuesday";
			weekday[3] = "Wednesday";
			weekday[4] = "Thursday";
			weekday[5] = "Friday";
			weekday[6] = "Saturday";
			weekday[7] = "Sunday";
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
				`SELECT DATE("created_date"),COUNT(DISTINCT("User"."user_id")) as "count" FROM "user" "User" WHERE role_id In (${Role.SUPPLIER}) and DATE(created_date) >= '${mondayDate}' AND DATE(created_date) <= '${todayDate}' GROUP BY DATE("created_date")`
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

	async getSupplierData(userId: string, siteUrl: string): Promise<User> {
		try {
			return await this.userRepository.getUserDetails(userId, siteUrl, [
				Role.SUPPLIER,
			]);
			// const user = await this.userRepository.findOne({
			// 	where: { userId, isDeleted: false, roleId: In[Role.ADMIN] },
			// });

			// if (!user) {
			// 	throw new NotFoundException(`No Admin found`);
			// }
			// delete user.salt;
			// delete user.password;
			// user.profilePic = user.profilePic
			// 	? `${siteUrl}/profile/${user.profilePic}`
			// 	: "";
			// return user;
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

	async getCounts(): Promise<{ result: any }> {
		try {
			const activeUser = await this.userRepository.query(
				`SELECT status as StatusCode,CASE WHEN status = 0 THEN 'Deactive' ELSE 'Active' END AS status, count(*) AS count FROM "user" where "is_deleted" = false AND "role_id" In (${Role.SUPPLIER}) GROUP BY status`
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

	async activeDeactivesupplier(
		userId: string,
		activeDeactiveDto: ActiveDeactiveDto,
		adminId: string
	) {
		try {
			const { status } = activeDeactiveDto;
			const user = await this.userRepository.findOne({
				userId,
				roleId: In([Role.SUPPLIER]),
			});


			if (!user) throw new NotFoundException(`No supplier user found`);
			const previousData = user
			var statusWord = status == true ? 1 : 0;
			user.status = statusWord;
			user.updatedBy = adminId;
			user.updatedDate = new Date();
			await user.save();
			const currentData = user
			Activity.logActivity(
				adminId,
				"supplier-user",
				`${user.email} supplier user status changed by admin`,
				previousData,
				currentData
			);
			return { message: `supplier user status changed` };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No supplier user Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}
}
