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
import { User } from "@sentry/node";
import { SaveUserDto } from "src/user/dto/save-user.dto";
import * as config from "config";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
const mailConfig = config.get("email");
import { errorMessage } from "src/config/common.config";
import { ListUserDto } from "src/user/dto/list-user.dto";
import { SaveAdminDto } from "./dto/save-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { ListAdminDto } from "./dto/list-admin.dto";

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

	async createAdmin(saveUserDto: SaveAdminDto): Promise<User> {
		const { email, password, first_name, last_name } = saveUserDto;
		const user = await this.userRepository.createUser(saveUserDto, 2);
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
	 * update sub admin  only access to a super admin
	 * @param updateUserDto
	 * @param UserId
	 */

	async updateAdmin(updateUserDto: UpdateAdminDto, UserId: string) {
		try {
			const userId = UserId;
			const userData = await this.userRepository.findOne({
				where: { userId, isDeleted: 0 },
			});
			if (userData.roleId <= 1) {
				throw new ForbiddenException(
					`You are not allowed to access this resource.`
				);
			}
			return await this.userRepository.updateUser(updateUserDto, UserId, 2);
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
		paginationOption: ListAdminDto
	): Promise<{ data: User[]; TotalReseult: number }> {
		try {
			return await this.userRepository.listUser(paginationOption, [2]);
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

	/**
	 * delete Admin
	 * @param userId
	 */
	async deleteAdmin(userId: string) {
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
}
