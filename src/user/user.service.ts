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
import { In } from "typeorm";
const mailConfig = config.get("email");

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,

		private readonly mailerService: MailerService
	) {}

	async create(saveUserDto: SaveUserDto, files: ProfilePicDto,adminId:string): Promise<User> {
		const {
			title,
			email,
			password,
			first_name,
			last_name,
			country_code,
			phone_no,
			address,
			zip_code,
			country_id,
			state_id,
			city_name,
			gender
		} = saveUserDto;

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
		user.roleId = 6;
		user.email = email;
		user.firstName = first_name;
		user.middleName = "";
		user.zipCode = zip_code;
		user.lastName = last_name;
		user.salt = salt;
		user.title = title;
		//user.countryCode = country_code;
		user.phoneNo = phone_no;
		//user.countryId = country_id;
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
		adminId:string
	) {
		const { title,
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
			gender
            } = updateUserDto;
		const userId = UserId;
		const userData = await this.userRepository.findOne({
			where: { userId, isDeleted: 0 ,roleId: In([5,6,7]) },
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
            return userData;
        }
        catch (error) {
            throw new InternalServerErrorException(`${error.message}&&&no_key&&&${errorMessage}`)
        }
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
		paginationOption: ListUserDto,
		siteUrl:string
	): Promise<{ data: User[]; TotalReseult: number }> {
		try {
			return await this.userRepository.listUser(paginationOption, [5, 6, 7],siteUrl);
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
		return await this.userRepository.exportUser([5, 6, 7]);
	}
}
