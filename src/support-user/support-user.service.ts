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
import { errorMessage } from "src/config/common.config";
import { SaveSupporterDto } from "./dto/save-supporter.dto";
import { UpdateSupporterDto } from "./dto/update-supporter.dto";
import { ListSupporterDto } from "./dto/list-suppoerter.dto";
import { ProfilePicDto } from "src/auth/dto/profile-pic.dto";
import { User } from "src/entity/user.entity";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { In } from "typeorm";
import { Role } from "src/enum/role.enum";
import { ActiveDeactiveDto } from "src/user/dto/active-deactive-user.dto";
import { Activity } from "src/utility/activity.utility";
import { ExportUserDto } from "src/user/dto/export-user.dto";
const mailConfig = config.get("email");

@Injectable()
export class SupportUserService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,

		private readonly mailerService: MailerService
	) {}

	/**
	 *
	 * Create new Supporter
	 * @param saveUserDto
	 */

	async createSupportUser(
		saveSupporterDto: SaveSupporterDto,
		files: ProfilePicDto,
		adminId: string
	): Promise<User> {
		const { email, password, first_name, last_name,gender } = saveSupporterDto;
		const salt = await bcrypt.genSalt();
		const user = new User();
		user.userId = uuidv4();
		user.gender = gender;
		user.accountType = 1;
		user.socialAccountId = "";
		user.phoneNo = "";
		if (typeof files.profile_pic != "undefined")
			user.profilePic = files.profile_pic[0].filename;
		user.timezone = "";
		user.status = 1;
		user.roleId = 3;
		user.email = email;
		user.firstName = first_name;
		user.middleName = "";
		user.zipCode = "";
		user.lastName = last_name;
		user.salt = salt;
		user.createdDate = new Date();
		user.updatedDate = new Date();
		user.createdBy = adminId
		user.isVerified = true;
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
		Activity.logActivity(adminId, "support-user", ` New support-user ${userdata.email} created By admin ${adminId}`, null, JSON.stringify(userdata));
		return userdata;
	}

	/**
	 * - update support user
	 * @param updateUserDto
	 * @param UserId
	 */
	async updateSupportUser(
		updateSupporterDto: UpdateSupporterDto,
		UserId: string,
		files: ProfilePicDto,
		adminId: string
	) {
		try {
			const {
				firstName,
				middleName,
				lastName,
				profile_pic,
				gender
			} = updateSupporterDto;
			const userId = UserId;
			const userData = await this.userRepository.findOne({
				where: { userId, isDeleted: 0, roleId: In([3]) },
			});
			const previousDate:any = JSON.stringify(userData)
			userData.gender = gender
			userData.firstName = firstName;
			userData.middleName = middleName || "";
			userData.lastName = lastName;
			userData.updatedBy = adminId;
			if (typeof files.profile_pic != "undefined")
				userData.profilePic = files.profile_pic[0].filename;
			userData.updatedDate = new Date();

			const currentValue = await userData.save();

			Activity.logActivity(adminId, "support-user", `Support-user ${userData.email} updated By admin ${adminId}`, previousDate, JSON.stringify(currentValue));
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
	async listSupportUser(
		paginationOption: ListSupporterDto,
		siteUrl:string
	): Promise<{ data: User[]; TotalReseult: number }> {
		try {
			return await this.userRepository.listUser(paginationOption, [3],siteUrl);
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
	 * delete suppoerter
	 * @param userId
	 */
	async deleteSupportUser(userId: string) {
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
				await user.save();
				return { messge: `support-user deleted successfully` };
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
	async exportSupporter(paginationOption: ExportUserDto): Promise<{ data: User[] }> {
		return await this.userRepository.exportUser(paginationOption,[3]);
	}

	async getSupportUserData(userId: string, siteUrl: string): Promise<User> {
		try {
			return await this.userRepository.getUserDetails(userId,siteUrl,[Role.SUPPORT])
			
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No supporter found`);
			}
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async activeDeactiveSupporter(
		userId: string,
		activeDeactiveDto: ActiveDeactiveDto,
		adminId: string
	) {
		try {
			const { status } = activeDeactiveDto;
			const user = await this.userRepository.findOne({
				userId,
				roleId: In([Role.SUPPORT]),
			});

			if (!user) throw new NotFoundException(`No support user found`);
			const previousData = user;
			var statusWord = status === true ? 1 : 0;
			user.status = statusWord;
			user.updatedBy = adminId;
			user.updatedDate = new Date();
			await user.save();
			const currentData = user;
			Activity.logActivity(adminId, `support-user`, `Support user status changed ${statusWord}`, previousData, currentData);
			return { messge: `status changed successfully` };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No support user  Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}
}
