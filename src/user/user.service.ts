import {
	Injectable,
	ConflictException,
	UnprocessableEntityException,
	InternalServerErrorException,
	NotFoundException,
	ForbiddenException,
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
import { ProfilePicDto } from "src/auth/dto/profile-pic.dto";
const mailConfig = config.get("email");

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,

		private readonly mailerService: MailerService
	) {}

	async create(saveUserDto: SaveUserDto, files: ProfilePicDto): Promise<User> {
		const { email, password, first_name, last_name } = saveUserDto;

		const user = await this.userRepository.createUser(saveUserDto, 6, files);
		delete user.password;
		delete user.salt;
		if (user) {
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

	async updateUser(
		updateUserDto: UpdateUserDto,
		UserId: string,
		files: ProfilePicDto
	) {
		const userId = UserId;
		const userData = await this.userRepository.findOne({
			where: { userId, isDeleted: 0 },
		});
		if (userData.roleId <= 2) {
			throw new ForbiddenException(
				`You are not allowed to access this resource.`
			);
		}

		return await this.userRepository.updateUser(updateUserDto, files, UserId, [
			5,
			6,
			7,
		]);
	}

	async getUserData(userId: string): Promise<User> {
		try {
			const user = await this.userRepository.findOne({
				where: { userId, isDeleted: false },
			});

			if (!user) {
				throw new NotFoundException(`No user found`);
			}
			delete user.salt;
			delete user.password;
			return user;
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No user found`);
			}
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
		return await this.userRepository.changePassword(changePasswordDto, userId);
	}

	async listUser(
		paginationOption: ListUserDto
	): Promise<{ data: User[]; TotalReseult: number }> {
		try {
			return await this.userRepository.listUser(paginationOption, [5, 6, 7]);
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
		return await this.userRepository.exportUser([5,6,7]);
	}
}
