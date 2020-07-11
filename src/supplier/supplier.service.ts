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
import { SaveSupplierDto } from "./dto/save-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { ListSupplierDto } from "./dto/list-supplier.dto";

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

	async createSupplier(saveUserDto: SaveSupplierDto): Promise<User> {
		const { email, password, first_name, last_name } = saveUserDto;
		const user = await this.userRepository.createUser(saveUserDto, 4);
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
	 * update supplier
	 * @param updateUserDto
	 * @param UserId
	 */

	async updateSupplier(updateUserDto: UpdateSupplierDto, UserId: string) {
		try {
			const userId = UserId;
			const userData = await this.userRepository.findOne({
				where: { userId, isDeleted: 0,roleId:4 },
            });
            
            
			if (userData.roleId <= 1) {
				throw new ForbiddenException(
					`You are not allowed to access this resource.`
				);
			}
			return await this.userRepository.updateUser(updateUserDto, UserId , 4);
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
		paginationOption: ListSupplierDto
	): Promise<{ data: User[]; TotalReseult: number }> {
		try {
			return await this.userRepository.listUser(paginationOption, [4]);
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
	 * delete supplier
	 * @param userId
	 */
	async deleteSupplier(userId: string) {
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
}
