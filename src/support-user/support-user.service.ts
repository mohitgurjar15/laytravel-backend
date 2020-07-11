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
import { User } from "@sentry/node";
import * as config from "config";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { errorMessage } from "src/config/common.config";
import { ListUserDto } from "src/user/dto/list-user.dto";
import { SaveSupporterDto } from "./dto/save-supporter.dto";
import { UpdateSupporterDto } from "./dto/update-supporter.dto";
import { ListSupporterDto } from "./dto/list-suppoerter.dto";
import { ProfilePicDto } from "src/auth/dto/profile-pic.dto";
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

	async createSupportUser(saveSupporterDto: SaveSupporterDto): Promise<User> {
		const { email, password, first_name, last_name } = saveSupporterDto;
		const user = await this.userRepository.createUser(saveSupporterDto, 3);
		delete user.password;
		delete user.salt;
		if(user)
		{
            this.mailerService
			.sendMail({
				to: user.email,
				from: mailConfig.from,
				subject: `Welcome on board`,
				template: "welcome.html",
				context: {
					// Data to be sent to template files.
					username: user.firstName + " " + user.lastName,
					email: user.email,
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
		return user;
	}

	/**
	 * - update support user
	 * @param updateUserDto
	 * @param UserId
	 */
	async updateSupportUser(updateSupporterDto: UpdateSupporterDto, UserId: string,files:ProfilePicDto) {
		try {
			const userId = UserId;
			const userData = await this.userRepository.findOne({
				where: { userId, isDeleted: 0 },
			});
			if (userData.roleId <= 2) {
				throw new ForbiddenException(
					`You are not allowed to access this resource.`
				);
			}
			return await this.userRepository.updateUser(updateSupporterDto,files, UserId,[3]);
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
		paginationOption: ListSupporterDto
	): Promise<{ data: User[]; TotalReseult: number }> {
		try {
			return await this.userRepository.listUser(paginationOption, [3]);
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
}
