import {
	Injectable,
	ConflictException,
	UnprocessableEntityException,
	InternalServerErrorException,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from "@nestjs/common";
import { UserRepository } from "../auth/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ListUserDto } from "./dto/list-user.dto";
import { User } from "src/entity/user.entity";
import { SaveUserDto } from "./dto/save-user.dto";
import { errorMessage } from "src/config/common.config";
import { MailerService } from "@nestjs-modules/mailer";
import { v4 as uuidv4 } from "uuid";
import * as config from "config";
import { Role } from "src/enum/role.enum";
import { ProfilePicDto } from "src/auth/dto/profile-pic.dto";
import { In, AdvancedConsoleLogger, getManager } from "typeorm";
import { ActiveDeactiveDto } from "./dto/active-deactive-user.dto";
import { Countries } from "src/entity/countries.entity";
import { States } from "src/entity/states.entity";
const mailConfig = config.get("email");

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,

		private readonly mailerService: MailerService
	) {}

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
			gender,
		} = saveUserDto;

		let countryDetails = await getManager()
			.createQueryBuilder(Countries,"country")
			.where(`id=:country_id`,{country_id})
			.getOne();
		if(!countryDetails)
				throw new BadRequestException(`Country id not exist with database.&&&country_id`)
			
		let stateDetails = await getManager()
			.createQueryBuilder(States,"states")
			.where(`id=:state_id and country_id=:country_id`,{state_id,country_id})
			.getOne();
		if(!stateDetails)
			throw new BadRequestException(`State id not exist with country id.&&&country_id`)

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
		user.countryId = country_id;
		user.preferredLanguage = prefer_language
		user.address = address;
		user.stateId = state_id;
		user.cityName = city_name;
		user.gender = gender;
		user.createdBy = adminId;
		user.createdDate = new Date();
		user.updatedDate = new Date();
		user.password = await this.userRepository.hashPassword(password, salt);
		const userdata = await this.userRepository.createUser(user);
		delete userdata.password;
		delete userdata.salt;
		if (userdata) {
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

	async updateUser(
		updateUserDto: UpdateUserDto,
		UserId: string,
		files: ProfilePicDto,
		adminId: string
	) {
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
		} = updateUserDto;
		const userId = UserId;

		let countryDetails = await getManager()
			.createQueryBuilder(Countries,"country")
			.where(`id=:country_id`,{country_id})
			.getOne();
		if(!countryDetails)
				throw new BadRequestException(`Country id not exist with database.&&&country_id`)
			
		let stateDetails = await getManager()
			.createQueryBuilder(States,"states")
			.where(`id=:state_id and country_id=:country_id`,{state_id,country_id})
			.getOne();
		if(!stateDetails)
			throw new BadRequestException(`State id not exist with country id.&&&country_id`)
			
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
		userData.countryId = country_id;
		userData.address = address;
		userData.stateId = state_id;
		userData.cityName = city_name;
		userData.gender = gender;
		userData.updatedBy = adminId;
		userData.updatedDate = new Date();
		try {
			await userData.save();
			delete userData.password;
			delete userData.salt;
			return userData;
		} catch (error) {
			throw new InternalServerErrorException(
				`${error.message}&&&no_key&&&${errorMessage}`
			);
		}
	}

	async getUserData(userId: string, siteUrl: string): Promise<User> {

		try {
			const roles=[Role.FREE_USER, Role.GUEST_USER, Role.PAID_USER];
			return this.userRepository.getUserDetails(userId,siteUrl,roles);
		} catch (error) {
			throw new InternalServerErrorException(errorMessage);
		}
	}

	async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
		return await this.userRepository.changePassword(changePasswordDto, userId);
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

			user.status = status;
			user.updatedBy = adminId;
			user.isDeleted = true;
			user.updatedDate = new Date();
			await user.save();
			var statusWord = status == 1 ? "Active" : "Deactive";
			return { message: `User ${statusWord} successfully` };
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
	async weeklyRagisterUser(): Promise<{ count: number }> {
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

			var mondayDate = fromDate.toLocaleDateString();
			mondayDate = mondayDate
				.split("/")
				.reverse()
				.join("-");
			var toDate = new Date();

			var todayDate = toDate.toLocaleDateString();
			todayDate = todayDate
				.split("/")
				.reverse()
				.join("-");
			const result = await this.userRepository
				.createQueryBuilder()
				.where(
					`role_id In (${Role.FREE_USER},${Role.PAID_USER},${Role.GUEST_USER}) and created_date BETWEEN '${mondayDate}' AND '${todayDate}'`
				)
				.getCount();
			return { count: result };
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
				`SELECT status as StatusCode,CASE WHEN status = 0 THEN 'Deactive' ELSE 'Active' END AS status, count(*) AS count FROM "user" where role_id In (${Role.FREE_USER},${Role.GUEST_USER},${Role.PAID_USER}) GROUP BY status`
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
				throw new NotFoundException(`No user Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async deleteUser(userId: string) {
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
				await user.save();
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

	//Export user
	async exportUser(): Promise<{ data: User[] }> {
		return await this.userRepository.exportUser([
			Role.PAID_USER,
			Role.GUEST_USER,
			Role.FREE_USER,
		]);
	}
}
