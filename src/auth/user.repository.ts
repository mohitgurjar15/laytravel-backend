import { Repository, EntityRepository, In, getManager } from "typeorm";
import { User } from "../entity/user.entity";
import {
	BadRequestException,
	NotFoundException,
	InternalServerErrorException,
	ConflictException,
	UnauthorizedException,
} from "@nestjs/common";
import { ChangePasswordDto } from "src/user/dto/change-password.dto";
import { ListUserDto } from "src/user/dto/list-user.dto";
import * as bcrypt from "bcrypt";
import { errorMessage } from "src/config/common.config";
import { v4 as uuidv4 } from "uuid";
import { Role } from "src/enum/role.enum";
import * as moment from 'moment';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
	hashPassword(password: string, salt: string): Promise<string> {
		return bcrypt.hash(password, salt);
	}

	async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
		const { old_password, password } = changePasswordDto;

		const user = await this.findOne({
			where: { userId: userId, isDeleted: false },
		});
		if (await user.validatePassword(old_password)) {
			const salt = await bcrypt.genSalt();
			user.salt = salt;
			user.password = await this.hashPassword(password, salt);
			user.updatedDate = new Date();
			user.updatedBy = user.userId;
		} else {
			throw new BadRequestException(
				`Your old password doesn't match.&&&old_pasword`
			);
		}

		try {
			await user.save();
			return { message: `Your password is updated successfully.` };
		} catch (error) {
			throw new InternalServerErrorException(error.sqlMessage);
		}
	}

	/**
	 * list user using own role id and the pagination option
	 * @param paginationOption
	 * @param role
	 */
	async listUser(
		paginationOption: ListUserDto,
		role: number[],
		siteUrl: string
	): Promise<{ data: User[]; TotalReseult: number }> {
		const { page_no, search, limit } = paginationOption;

		const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;
		const keyword = search || "";

		let where;
		if (keyword) {
			where = `("user"."is_deleted" = false) AND ("user"."role_id" IN (${role})) AND (("user"."first_name" ILIKE '%${keyword}%') or ("user"."middle_name" ILIKE '%${keyword}%') or ("user"."last_name" ILIKE '%${keyword}%') or ("user"."email" ILIKE '%${keyword}%'))`;
		} else {
			where = `("user"."is_deleted" = false) AND("user"."role_id" IN (${role}) ) and 1=1`;
		}
		const [result, count] = await getManager()
			.createQueryBuilder(User, "user")
			.leftJoinAndSelect("user.state", "state")
			.leftJoinAndSelect("user.country", "countries")
			.leftJoinAndSelect("user.preferredCurrency2", "currency")
			.leftJoinAndSelect("user.preferredLanguage2", "language")
			.select([
				"user.userId",
				"user.title",
				"user.dob",
				"user.firstName",
				"user.lastName",
				"user.email",
				"user.profilePic",
				"user.dob",
				"user.gender",
				"user.roleId",
				"user.countryCode",
				"user.phoneNo",
				"user.cityName",
				"user.address",
				"user.zipCode",
				"user.preferredCurrency2",
				"user.preferredLanguage2",
				"user.passportNumber",
				"user.passportExpiry",
				"language.id",
				"language.name",
				"language.iso_1Code",
				"language.iso_2Code",
				"currency.id",
				"currency.code",
				"currency.country",
				"countries.name",
				"countries.iso2",
				"countries.iso3",
				"countries.id",
				"state.id",
				"state.name",
				"state.iso2",
				"state.country_id",
			])
			// .addSelect(`CASE
			// 	WHEN date_part('year',age(current_date,"user"."dob")) <= 2 THEN 'infant'
			// 	WHEN date_part('year',age(current_date,"user"."dob")) <= 12 THEN 'child'
			// 	ELSE 'adult'
			// END AS "user_type"`,)
			.where(where)
			.offset(skip)
			.limit(take)
			.getManyAndCount();

		if (!result.length || count <= skip) {
			throw new NotFoundException(`No user found.`);
		}
		result.forEach(function(data) {
			delete data.updatedDate;
			delete data.salt;
			delete data.password;
		});
		return { data: result, TotalReseult: count };
	}

	async createUser(user: User): Promise<User> {
		const email = user.email;
		const userExist = await this.findOne({
			email,
		});
		console.log(userExist);

		if (userExist && userExist.roleId != Role.GUEST_USER) {
			throw new ConflictException(
				`This email address is already registered with us. Please enter different email address.`
			);
		} else if (
			userExist &&
			userExist.roleId == Role.GUEST_USER &&
			user.roleId == Role.GUEST_USER
		) {
			return this.getUserDetails(userExist.userId, "");
		} else {
			await user.save();
			return this.getUserDetails(user.userId, "");
		}
	}

	async createtraveler(user: User): Promise<User> {
		const email = user.email;
		if (email != "") {
			const userExist = await this.findOne({
				email,
				isDeleted: false,
				roleId: Role.TRAVELER_USER,
				createdBy: user.createdBy,
			});
			if (userExist) {
				throw new ConflictException(`This traveler email alredy exist.`);
			}
		}

		await user.save();

		let userDetail = await getManager()
			.createQueryBuilder(User, "user")
			.leftJoinAndSelect("user.createdBy2", "parentUser")
			//.leftJoinAndSelect("user.state", "state")
			.leftJoinAndSelect("user.country", "countries")
			.select([
				"user.userId",
				"user.title",
				"user.dob",
				"user.firstName",
				"user.lastName",
				"user.email",
				"user.profilePic",
				"user.dob",
				"user.gender",
				"user.roleId",
				"user.countryCode",
				"user.phoneNo",
				// "user.cityName",
				// "user.address",
				// "user.zipCode",
				"user.preferredCurrency2",
				"user.preferredLanguage2",
				"user.passportNumber",
				"user.passportExpiry",
				"countries.name",
				"countries.iso2",
				"countries.iso3",
				"countries.id",
				// "state.id",
				// "state.name",
				// "state.iso2",
				// "state.country_id",
				"parentUser.userId",
				"parentUser.title",
				"parentUser.dob",
				"parentUser.firstName",
				"parentUser.lastName",
				"parentUser.email",
				"parentUser.profilePic",
				"parentUser.dob",
				"parentUser.gender",
				"parentUser.roleId",
			])
			.where(`"user"."user_id"=:userId and "user"."is_deleted"=:is_deleted`, {
				userId: user.userId,
				is_deleted: false,
			})
			.getOne();

		if (!userDetail) {
			throw new NotFoundException(`Traveler not crearted`);
		}
		var birthDate = new Date(userDetail.dob);
		console.log(`birthdate ${birthDate}`);
		
		var age = moment(new Date()).diff(moment(birthDate),'years');
		console.log(`age ${age}`);
		if (age <= 2) {
			userDetail.user_type = "infant";
		} else if (age < 12) {
			userDetail.user_type = "child";
		} else {
			userDetail.user_type = "adult";
		}
		return userDetail;
	}

	async getUserData(userId: string): Promise<User> {
		const userdata = await this.findOne({
			userId: userId,
			isDeleted: false,
			roleId: In([
				Role.PAID_USER,
				Role.SUPER_ADMIN,
				Role.SUPPLIER,
				Role.GUEST_USER,
				Role.FREE_USER,
				Role.ADMIN,
			]),
		});

		if (!userdata)
			throw new NotFoundException(
				`This user does not exist&&&email&&&This user does not exist`
			);

		if (userdata.status != 1)
			throw new UnauthorizedException(
				`This account has been disabled. Please contact administrator person.`
			);
		return userdata;
	}

	async getTravelData(userId: string): Promise<User> {
		const userdata = await getManager()
			.createQueryBuilder(User, "user")
			.leftJoinAndSelect("user.createdBy2", "parentUser")
			//.leftJoinAndSelect("user.state", "state")
			.leftJoinAndSelect("user.country", "countries")
			.select([
				"user.userId",
				"user.title",
				"user.dob",
				"user.firstName",
				"user.lastName",
				"user.email",
				"user.profilePic",
				"user.dob",
				"user.gender",
				"user.roleId",
				"user.countryCode",
				"user.phoneNo",
				// "user.cityName",
				// "user.address",
				// "user.zipCode",
				"user.preferredCurrency2",
				"user.preferredLanguage2",
				"user.passportNumber",
				"user.passportExpiry",
				"countries.name",
				"countries.iso2",
				"countries.iso3",
				"countries.id",
				// "state.id",
				// "state.name",
				// "state.iso2",
				// "state.country_id",
				"parentUser.userId",
				"parentUser.title",
				"parentUser.dob",
				"parentUser.firstName",
				"parentUser.lastName",
				"parentUser.email",
				"parentUser.profilePic",
				"parentUser.dob",
				"parentUser.gender",
				"parentUser.roleId",
			])
			.where(`"user"."user_id"=:userId and "user"."is_deleted"=:is_deleted`, {
				userId: userId,
				is_deleted: false,
				roleId: Role.TRAVELER_USER,
			})
			.getOne();

		if (!userdata)
			throw new NotFoundException(
				`This traveler does not exist&&&email&&&This traveler does not exist`
			);

		if (userdata.status != 1)
			throw new UnauthorizedException(
				`This traveler has been disabled. Please contact administrator person.`
			);
		var today = new Date();
		var birthDate = new Date(userdata.dob);
		var age = moment(new Date()).diff(moment(birthDate),'years');

		if (age <= 2) {
			userdata.user_type = "infant";
		} else if (age < 12) {
			userdata.user_type = "child";
		} else {
			userdata.user_type = "adult";
		}
		return userdata;
	}
	/**
	 * export user
	 * @param roleId
	 */
	async exportUser(roleId: number[]): Promise<{ data: User[] }> {
		try {
			const userData = await this.find({
				where: { isDeleted: 0, roleId: In(roleId) },
			});
			if (!userData) {
				throw new NotFoundException(`No user found.`);
			}

			return { data: userData };
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

	async insertNewUser(data: any): Promise<boolean> {
		try {
			const salt = await bcrypt.genSalt();
			const user = new User();
			user.userId = uuidv4();
			user.accountType = 1;
			user.socialAccountId = "";
			user.phoneNo = "";
			user.isVerified = true;
			user.profilePic = "";
			user.timezone = "";
			user.status = 1;
			user.roleId = data.roleId;
			user.email = data.email;
			user.firstName = data.firstName;
			user.middleName = data.middleName;
			user.zipCode = "";
			user.lastName = data.lastName;
			user.salt = salt;
			user.title = "";
			user.countryCode = data.countryCode;
			user.phoneNo = data.phoneNumber;
			user.countryId = null;
			user.preferredLanguage = null;
			user.address = "";
			user.stateId = null;
			user.cityName = "";
			user.gender = "";
			user.createdBy = data.UserId;
			user.createdDate = new Date();
			user.updatedDate = new Date();
			user.password = await this.hashPassword(data.password, salt);
			const email = user.email;
			const userExist = await this.findOne({
				email,
			});
			if (userExist) {
				return false;
			} else {
				await user.save();
				return true;
			}
		} catch (error) {
			return false;
		}
	}

	async getUserDetails(userId: string, siteUrl: any, roles: Role[] = null) {
		let userDetail = await getManager()
			.createQueryBuilder(User, "user")
			.leftJoinAndSelect("user.state", "state")
			.leftJoinAndSelect("user.country", "countries")
			.leftJoinAndSelect("user.preferredCurrency2", "currency")
			.leftJoinAndSelect("user.preferredLanguage2", "language")
			.select([
				"user.userId",
				"user.title",
				"user.dob",
				"user.firstName",
				"user.lastName",
				"user.email",
				"user.profilePic",
				"user.dob",
				"user.gender",
				"user.roleId",
				"user.countryCode",
				"user.phoneNo",
				"user.cityName",
				"user.address",
				"user.zipCode",
				"user.preferredCurrency2",
				"user.preferredLanguage2",
				"user.passportNumber",
				"user.passportExpiry",
				"language.id",
				"language.name",
				"language.iso_1Code",
				"language.iso_2Code",
				"currency.id",
				"currency.code",
				"currency.country",
				"countries.name",
				"countries.iso2",
				"countries.iso3",
				"countries.id",
				"state.id",
				"state.name",
				"state.iso2",
				"state.country_id",
			])
			.where(`("user"."user_id"=:userId and "user"."is_deleted"=:is_deleted)`, {
				userId,
				is_deleted: false,
			})
			.andWhere(roles != null ? `"user"."role_id" in (:...roles) ` : `1=1`, {
				roles,
			})
			.getOne();

		if (!userDetail) {
			throw new NotFoundException(`No user found.`);
		}
		var today = new Date();
		var birthDate = new Date(userDetail.dob);
		var age = moment(new Date()).diff(moment(birthDate),'years');

		let user: any = {};
		if (age <= 2) {
			user.user_type = "infant";
		} else if (age < 12) {
			user.user_type = "child";
		} else {
			user.user_type = "adult";
		}
		user.userId = userDetail.userId;
		user.firstName = userDetail.firstName;
		user.lastName = userDetail.lastName || "";
		user.email = userDetail.email;
		user.gender = userDetail.gender || "";
		user.roleId = userDetail.roleId;
		user.phoneNo = userDetail.phoneNo || "";
		user.countryCode = userDetail.countryCode || "";
		user.address = userDetail.address || "";
		user.country = userDetail.country || {};
		user.state = userDetail.state || {};
		user.dob = userDetail.dob || "";
		user.title = userDetail.title || "";
		user.cityName = userDetail.cityName || "";
		user.dob = userDetail.dob || "";
		user.zipCode = userDetail.zipCode || "";
		user.preferredCurrency = userDetail.preferredCurrency2 || {};
		user.preferredLanguage = userDetail.preferredLanguage2 || {};
		user.passportNumber = userDetail.passportNumber || "";
		user.passportExpiry = userDetail.passportExpiry || "";
		user.profilePic = userDetail.profilePic
			? `${siteUrl}/profile/${userDetail.profilePic}`
			: "";
		return user;
	}
}
