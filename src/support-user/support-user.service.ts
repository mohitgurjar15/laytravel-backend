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
		const { email, password, first_name, last_name } = saveSupporterDto;
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
			} = updateSupporterDto;
			const userId = UserId;
			const userData = await this.userRepository.findOne({
				where: { userId, isDeleted: 0, roleId: In([3]) },
			});

			userData.firstName = firstName;
			userData.middleName = middleName || "";
			userData.lastName = lastName;
			userData.updatedBy = adminId;
			if (typeof files.profile_pic != "undefined")
				userData.profilePic = files.profile_pic[0].filename;
			userData.updatedDate = new Date();
			await userData.save();
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
	async exportSupporter(): Promise<{ data: User[] }> {
		return await this.userRepository.exportUser([3]);
	}
}
