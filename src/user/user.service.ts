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
import { In, getManager, getConnection } from "typeorm";
import { ActiveDeactiveDto } from "./dto/active-deactive-user.dto";
import { isEmail } from "class-validator";

import { Countries } from "src/entity/countries.entity";
import { States } from "src/entity/states.entity";
import { Activity } from "src/utility/activity.utility";
import { ListDeleteRequestDto } from "./dto/list-delete-request.dto";
import { DeleteUserAccountRequest } from "src/entity/delete-user-account-request.entity";
import { Booking } from "src/entity/booking.entity";
import { UserCard } from "src/entity/user-card.entity";
import { LayCreditEarn } from "src/entity/lay-credit-earn.entity";
import { LayCreditRedeem } from "src/entity/lay-credit-redeem.entity";
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { OtherPayments } from "src/entity/other-payment.entity";
import { PlanSubscription } from "src/entity/plan-subscription.entity";
import { UserDeviceDetail } from "src/entity/user-device-detail.entity";
import { DeleteAccountRequestStatus } from "src/enum/delete-account-status.enum";
import { BookingFeedback } from "src/entity/booking-feedback.entity";
import { TravelerInfo } from "src/entity/traveler-info.entity";
import { PredictiveBookingData } from "src/entity/predictive-booking-data.entity";
import * as uuidValidator from "uuid-validate"
import { RagisterMail } from "src/config/email_template/register-mail.html";

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
		const roles = [Role.ADMIN, Role.SUPER_ADMIN, Role.FREE_USER]

		const userdata = await this.userRepository.createUser(user, roles);
		delete userdata.password;
		delete userdata.salt;
		if (userdata) {
			Activity.logActivity(adminId, "user", `new user ${user.email} created by admin `, null, user);
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
			if(!uuidValidator(userId))
			{
				throw new NotFoundException('Given id not avilable')
			}
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

			const previousData = userData

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
			const currentData = userData
			Activity.logActivity(adminId, "user", `${userData.email} is updated by admin`, previousData, userData);
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
			if(!uuidValidator(userId))
			{
				throw new NotFoundException('Given id not avilable')
			}
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
			if(!uuidValidator(userId))
			{
				throw new NotFoundException('Given id not avilable')
			}
			const user = await this.userRepository.findOne({
				userId,
				roleId: In([Role.FREE_USER, Role.PAID_USER, Role.GUEST_USER]),
			});

			if (!user) throw new NotFoundException(`No user found`);
			const previousData = user
			var statusWord = status == true ? 1 : 0;
			user.status = statusWord;
			user.updatedBy = adminId;
			user.updatedDate = new Date();
			await user.save();
			const currentData = user

			Activity.logActivity(adminId, "user", `User ${user.email}  status changed by admin`, previousData, currentData);
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
			if(!uuidValidator(userId))
			{
				throw new NotFoundException('Given id not avilable')
			}
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
				const previousData = user
				user.isDeleted = true;
				user.updatedBy = adminId;
				user.updatedDate = new Date();
				await user.save();
				const currentData = user
				Activity.logActivity(adminId, "user", `${user.email} user is deleted by admin`, previousData, currentData);
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
			var row = array[index];
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
					var userData = await this.userRepository.insertNewUser(data,[Role.FREE_USER,Role.PAID_USER]);

					if (userData) {
						count++;
						this.mailerService
							.sendMail({
								to: data.email,
								from: mailConfig.from,
								cc: mailConfig.BCC,
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

					if (parseInt(row.type) >= 5 &&
						parseInt(row.type) <= 7)
						error_message += "Add valid user type. ||";

					row.error_message = error_message;
					unsuccessRecord.push(row);
				}
			}
		}
		Activity.logActivity(userId, "user", `Admin import the  ${count}  users`);
		return { importCount: count, unsuccessRecord: unsuccessRecord };
	}
	//Export user
	async exportUser(adminId: string): Promise<{ data: User[] }> {
		Activity.logActivity(adminId, "user", `All user list export by admin`);
		return await this.userRepository.exportUser([
			Role.PAID_USER,
			Role.GUEST_USER,
			Role.FREE_USER,
		]);
	}

	async listDeleteRequest(dto: ListDeleteRequestDto) {
		const { page_no, search, limit ,status } = dto;

		
		const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;
		const keyword = search || "";

		let where;
		where = `1=1 `
		if (status) {
			where += `AND "req"."status" = ${status}`;
		}
		
		if (keyword) {
			where += `AND ( "req"."email" ILIKE '%${keyword}%' OR "req"."user_name" ILIKE '%${keyword}%')`;
		}

		



		const [result, count] = await getConnection()
			.createQueryBuilder(DeleteUserAccountRequest, "req")
			.where(where)
			.skip(skip)
			.take(take)
			.orderBy("req.id", "DESC")
			.getManyAndCount();

		if (!result.length) {
			throw new NotFoundException(`No request found.`);
		}

		return {
			data: result, count: count
		}
	}


	async deleteRequestAccept(id, user: User) {

		const where = `"req"."status" = ${DeleteAccountRequestStatus.PENDING} AND "req"."id" = ${id}`
		const req = await getConnection()
			.createQueryBuilder(DeleteUserAccountRequest, "req")
			.where(where)
			.getOne();
		if (!req) {
			throw new NotFoundException(`Given request id not available`)
		}
		const userId = req.userId
		var data = {};
		var sqlData = '';
		const userData = await this.userData(userId)

		if (userData.data) {
			data['userData'] = userData.data
			sqlData += userData.sql
			this.createCsv(userId, [userData.data], 'user-detail')
		}

		const bookingData = await this.bookingData(userId)
		if (bookingData.data) {
			data['bookingData'] = bookingData.data
			sqlData += bookingData.sql
			this.createCsv(userId, bookingData.data, 'bookingData')
		}
		if (bookingData.bookingIds.length) {
			const bookingTravelerData = await this.bookingTravelerData(bookingData.bookingIds)

			if (bookingTravelerData.data) {
				data['bookingTravelerData'] = bookingData.data
				sqlData += bookingData.sql
				this.createCsv(userId, bookingTravelerData.data, 'booking-traveler-data')
			}
		}



		const travelerData = await this.travelerData(userId)
		if (travelerData.data) {
			data['travelerData'] = travelerData.data
			sqlData += travelerData.sql
			this.createCsv(userId, travelerData.data, 'traveler-detail')
		}

		const cardDetail = await this.cardData(userId)
		if (cardDetail.data) {
			data['cardDetail'] = cardDetail.data
			sqlData += cardDetail.sql
			this.createCsv(userId, cardDetail.data, 'card-detail')
		}


		const creditEarn = await this.layCreditEarn(userId)
		if (creditEarn.data) {
			data['creditEarn'] = creditEarn.data
			sqlData += creditEarn.sql
			this.createCsv(userId, creditEarn.data, 'credit-earn')
		}

		const creditRedeem = await this.layCreditRedeem(userId)
		if (creditRedeem.data) {
			data['creditRedeem'] = creditRedeem.data
			sqlData += creditRedeem.sql
			this.createCsv(userId, creditRedeem.data, 'credit-reedem')
		}


		const bookingInstallment = await this.bookingInstallment(userId)
		if (bookingInstallment.data) {
			data['bookingInstallment'] = bookingInstallment.data
			sqlData += bookingInstallment.sql
			this.createCsv(userId, bookingInstallment.data, 'booking-installment')
		}


		const payments = await this.otherPayment(userId)
		if (payments.data) {
			data['payments'] = payments.data
			sqlData += payments.sql
			this.createCsv(userId, payments.data, 'payments')
		}


		const subscription = await this.subscriptionData(userId)
		if (subscription.data) {
			data['subscription'] = subscription.data
			sqlData += subscription.sql
			this.createCsv(userId, subscription.data, 'subscription')
		}

		const deviceDetail = await this.deviceDetail(userId)
		if (deviceDetail.data) {
			data['deviceDetail'] = deviceDetail.data
			sqlData += deviceDetail.sql
			this.createCsv(userId, deviceDetail.data, 'deviceDetail')
		}


		if (req.requestForData) {
			await this.sendDataToUser(userId, req.email)
		}

		await this.createSql(userId, sqlData, 'user-detail')

		await this.deleteuserData(userId, bookingData.bookingIds)

		req.status = DeleteAccountRequestStatus.CONFIRM
		req.updateBy = user
		req.updatedDate = new Date()

		req.save()

		return {
			message: `User ${req.email} deleted succesfully`
		}
	}

	async sendDataToUser(userId, email) {
		var AdmZip = require('adm-zip');

		const path = '/var/www/html/logs/deleteUser/' + userId + '/'
		var willSendthis;
		const fileName = path + userId + '.zip'
		if (!fs.existsSync('/var/www/html/logs/deleteUser/')) {
			fs.mkdirSync('/var/www/html/logs/deleteUser/');
		}

		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}

		var zip = new AdmZip();

		await new Promise(async (resolve) => {
			fs.readdir(path, async function (err, files) {
				//handling error
				if (err) {
					return console.log('Unable to scan directory: ' + err);
				}
				//listing all files using forEach
				for await (const file of files) {
					zip.addLocalFile(path + file);
				}
				willSendthis = zip.toBuffer();
				zip.writeZip(/*target file name*/fileName);
				resolve(willSendthis);
			})
		});

		const attachment = fs.readFileSync(fileName).toString('base64');
		console.log(attachment);
		this.mailerService
			.sendMail({
				to: email,
				from: mailConfig.from,
				subject: `Your account deleted`,
				cc: mailConfig.BCC,
				html: "delete account templete",
				attachments: [{
					content: attachment,
					filename: 'Backup.zip',
					contentType: 'application/7zip',
				},],
			})
			.then((res) => {
				console.log("res", res);
			})
			.catch((err) => {
				console.log("err", err);
			});
	}

	async deleteRequestReject(id, user: User) {
		const where = `"req"."status" = ${DeleteAccountRequestStatus.PENDING} AND "req"."id" = ${id}`
		const req = await getConnection()
			.createQueryBuilder(DeleteUserAccountRequest, "req")
			.where(where)
			.getOne();
		if (!req) {
			throw new NotFoundException(`Given request id not available`)
		}
		req.status = DeleteAccountRequestStatus.CANCELLED
		req.updateBy = user
		req.updatedDate = new Date()

		req.save()

		return {
			message: `Request rejected successfully`
		}
	}

	async createCsv(userId, data, fileName) {
		const ObjectsToCsv = require('objects-to-csv')

		const path = '/var/www/html/logs/deleteUser/' + userId + '/'

		const file = path + fileName + '.csv'
		if (!fs.existsSync('/var/www/html/logs/deleteUser/')) {
			fs.mkdirSync('/var/www/html/logs/deleteUser/');
		}

		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}

		const savedData = await new Promise(async (resolve) => {
			const csv = new ObjectsToCsv(data);

			// Save to file:
			await csv.toDisk(file);

			// Return the CSV file as string:
			const rawData = await csv;
			resolve(rawData);
		});
	}

	async createSql(userId, sqlData, fileName) {

		const path = '/var/www/html/logs/deleteUser/' + userId + '/'

		const file = path + userId + '_' + fileName + '.sql'
		if (!fs.existsSync('/var/www/html/logs/deleteUser/')) {
			fs.mkdirSync('/var/www/html/logs/deleteUser/');
		}

		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}

		fs.promises.writeFile(file, sqlData)
	}

	async userData(userId) {
		const data = await getConnection()
			.createQueryBuilder(User, "user")
			.where(
				`"user"."user_id" = '${userId}'`
			)
			.getOne()
		const sql = await getConnection()
			.createQueryBuilder()
			.insert()
			.into(User)
			.values(data)
			.getQuery();

		return {
			data, sql
		}
	}

	async bookingData(userId) {
		const data = await getConnection()
			.createQueryBuilder(Booking, "booking")
			.where(
				`"booking"."user_id" = '${userId}'`
			)
			.getMany()
		var sql = ''
		var bookingIds = [];
		if (data.length) {
			for await (const raw of data) {
				bookingIds.push(raw.id)
				sql += await getConnection()
					.createQueryBuilder()
					.insert()
					.into(Booking)
					.values(raw)
					.getQuery();
			}
		}
		return {
			data, sql, bookingIds
		}
	}

	async bookingTravelerData(bookingIds) {
		const data = await getConnection()
			.createQueryBuilder(TravelerInfo, "traveler")
			.where(`"booking_id" in (:...bookingIds) `, {
				bookingIds
			})
			.getMany()
		var sql = ''
		if (data.length) {
			for await (const raw of data) {
				sql += await getConnection()
					.createQueryBuilder()
					.insert()
					.into(TravelerInfo)
					.values(raw)
					.getQuery();
			}
		}
		return {
			data, sql
		}
	}
	async travelerData(userId) {
		const data = await getConnection()
			.createQueryBuilder(User, "user")
			.where(
				`"user"."created_by" = '${userId}'`
			)
			.getMany()
		var sql = ''
		if (data.length) {
			for await (const raw of data) {
				sql += await getConnection()
					.createQueryBuilder()
					.insert()
					.into(User)
					.values(raw)
					.getQuery();
			}
		}
		return {
			data, sql
		}
	}

	async cardData(userId) {
		const data = await getConnection()
			.createQueryBuilder(UserCard, "card")
			.where(
				`"card"."user_id" = '${userId}'`
			)
			.getMany()
		var sql = ''
		if (data.length) {
			for await (const raw of data) {
				sql += await getConnection()
					.createQueryBuilder()
					.insert()
					.into(UserCard)
					.values(raw)
					.getQuery();
			}
		}
		return {
			data, sql
		}
	}

	async layCreditEarn(userId) {
		const data = await await getConnection()
			.createQueryBuilder(LayCreditEarn, "earn")
			.where(
				`"earn"."user_id" = '${userId}'`
			)
			.getMany()
		var sql = ''
		if (data.length) {
			for await (const raw of data) {
				sql += await getConnection()
					.createQueryBuilder()
					.insert()
					.into(LayCreditEarn)
					.values(raw)
					.getQuery();
			}
		}
		return {
			data, sql
		}
	}

	async layCreditRedeem(userId) {
		const data = await getConnection()
			.createQueryBuilder(LayCreditRedeem, "redeem")
			.where(
				`"redeem"."user_id" = '${userId}'`
			)
			.getMany()
		var sql = ''
		if (data.length) {
			for await (const raw of data) {
				sql += await getConnection()
					.createQueryBuilder()
					.insert()
					.into(LayCreditRedeem)
					.values(raw)
					.getQuery();
			}
		}
		return {
			data, sql
		}
	}

	async bookingInstallment(userId) {
		const data = await getConnection()
			.createQueryBuilder(BookingInstalments, "instalment")
			.where(
				`"instalment"."user_id" = '${userId}'`
			)
			.getMany()
		var sql = ''
		if (data.length) {
			for await (const raw of data) {
				sql += await getConnection()
					.createQueryBuilder()
					.insert()
					.into(BookingInstalments)
					.values(raw)
					.getQuery();
			}
		}
		return {
			data, sql
		}
	}

	async otherPayment(userId) {
		const data = await getConnection()
			.createQueryBuilder(OtherPayments, "payments")
			.where(
				`"payments"."user_id" = '${userId}'`
			)
			.getMany()
		var sql = ''
		if (data.length) {
			for await (const raw of data) {
				sql += await getConnection()
					.createQueryBuilder()
					.insert()
					.into(OtherPayments)
					.values(raw)
					.getQuery();
			}
		}
		return {
			data, sql
		}
	}

	async subscriptionData(userId) {
		const data = await getConnection()
			.createQueryBuilder(PlanSubscription, "subscription")
			.where(
				`"subscription"."user_id" = '${userId}'`
			)
			.getMany()
		var sql = ''
		if (data.length) {
			for await (const raw of data) {
				sql += await getConnection()
					.createQueryBuilder()
					.insert()
					.into(PlanSubscription)
					.values(raw)
					.getQuery();
			}
		}
		return {
			data, sql
		}
	}


	async deviceDetail(userId) {
		const data = await getConnection()
			.createQueryBuilder(UserDeviceDetail, "device")
			.where(
				`"device"."user_id" = '${userId}'`
			)
			.getMany()
		var sql = ''
		if (data.length) {
			for await (const raw of data) {
				sql += await getConnection()
					.createQueryBuilder()
					.insert()
					.into(UserDeviceDetail)
					.values(raw)
					.getQuery();
			}
		}
		return {
			data, sql
		}
	}

	async deleteuserData(userId, bookingIds) {


		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(UserCard)
			.where(
				`"user_id" = '${userId}'`
			)
			.execute()

		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(LayCreditEarn)
			.where(
				`"user_id" = '${userId}'`
			)
			.execute()

		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(LayCreditRedeem)
			.where(
				`"user_id" = '${userId}'`
			)
			.execute()

		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(BookingInstalments)
			.where(
				`"user_id" = '${userId}'`
			)
			.execute()

		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(OtherPayments)
			.where(
				`"user_id" = '${userId}'`
			)
			.execute()

		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(PlanSubscription)
			.where(
				`"user_id" = '${userId}'`
			)
			.execute()

		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(UserDeviceDetail)
			.where(
				`"user_id" = '${userId}'`
			)
			.execute()
		await getConnection().createQueryBuilder()
			.delete()
			.from(UserDeviceDetail)
			.where(
				`"user_id" = '${userId}'`
			).execute();
		console.log(bookingIds)
		if (bookingIds.length && bookingIds[0]) {
			// await getConnection()
			// 	.createQueryBuilder()
			// 	.delete()
			// 	.from(BookingFeedback)
			// 	.where(`"booking_id" in (:...bookingIds) `, {
			// 		bookingIds,
			// 	})
			// 	.execute()

			await getConnection()
				.createQueryBuilder()
				.delete()
				.from(TravelerInfo)
				.where(`"booking_id" in (:...bookingIds) `, {
					bookingIds,
				})
				.execute()

			await getConnection()
				.createQueryBuilder()
				.delete()
				.from(PredictiveBookingData)
				.where(`"booking_id" in (:...bookingIds) `, {
					bookingIds,
				})
				.execute()
		}



		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(User)
			.where(
				`"created_by" = '${userId}'`
			)
			.execute()
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(Booking)
			.where(
				`"user_id" = '${userId}'`
			)
			.execute()

	}


	async getUserFirstName(){
		const roles = [Role.FREE_USER,Role.PAID_USER,Role.GUEST_USER]
		return await this.userRepository.getFirstname(roles)		
	}

	async getUserLastName(){
		const roles = [Role.FREE_USER,Role.PAID_USER,Role.GUEST_USER]
		return await this.userRepository.getLastname(roles)		
	}

	async getUserEmail(){
		const roles = [Role.FREE_USER,Role.PAID_USER,Role.GUEST_USER]
		return await this.userRepository.getemails(roles)		
	}
}
