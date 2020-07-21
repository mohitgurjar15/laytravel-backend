import { Repository, EntityRepository, In, getManager } from "typeorm";
import { User } from "../entity/user.entity";
import {
	BadRequestException,
	NotFoundException,
	NotAcceptableException,
	InternalServerErrorException,
	UnauthorizedException,
	ConflictException,
} from "@nestjs/common";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { ChangePasswordDto } from "src/user/dto/change-password.dto";
import { ListUserDto } from "src/user/dto/list-user.dto";
import * as bcrypt from "bcrypt";
import { errorMessage } from "src/config/common.config";
import { SaveUserDto } from "src/user/dto/save-user.dto";
import { v4 as uuidv4 } from "uuid";
import { MailerService } from "@nestjs-modules/mailer";
import { ProfilePicDto } from "./dto/profile-pic.dto";
import { SiteUrl } from "src/decorator/site-url.decorator";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
	hashPassword(password: string, salt: string): Promise<string> {
		return bcrypt.hash(password, salt);
	}

	async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
		const { old_password, password } = changePasswordDto;

		const user = await this.findOne({
			where: { userId: userId, isDeleted: 0 },
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
			where = `"role_id" IN (${role}) AND (("first_name" ILIKE '%${keyword}%') or ("middle_name" ILIKE '%${keyword}%') or ("last_name" ILIKE '%${keyword}%') or ("email" ILIKE '%${keyword}%'))`;
		} else {
			where = `("role_id" IN (${role}) ) and 1=1`;
		}
		const [result, total] = await this.findAndCount({
			where: where,
			skip: skip,
			take: take,
		});
		
		if (!result || total <= skip) {
			throw new NotFoundException(`No user found.`);
        }
        result.forEach(function(data) {
			data.profilePic = data.profilePic
				? `${siteUrl}/profile/${data.profilePic}`
				: "";
		});
		return { data: result, TotalReseult: total };
	}

	async createUser(user: User): Promise<User> {
		const email = user.email;
		const userExist = await this.findOne({
			email,
		});
		if (userExist) {
			throw new ConflictException(
				`This email address is already registered with us. Please enter different email address .`
			);
		} else {
			await user.save();
			return user;
		}
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

	async getUserDetails(userId:string, siteUrl,roles=null){

		let userDetail =  await getManager()
            .createQueryBuilder(User, "user")
            .leftJoinAndSelect("user.state","state")
            .leftJoinAndSelect("user.country","countries")
            .leftJoinAndSelect("user.preferredCurrency","currency")
            .leftJoinAndSelect("user.preferredLanguage2","language")
            .select([
                	"user.userId","user.title","user.dob",
					"user.firstName","user.lastName",
					"user.email","user.profilePic","user.dob",
					"user.countryCode","user.phoneNo",
					"user.cityName","user.address","user.zipCode",
					"user.preferredCurrency","user.preferredLanguage2",
					"user.passportNumber","user.passportExpiry",
					"language.id", "language.name","language.iso_1Code","language.iso_2Code",
					"currency.id","currency.code","currency.country",
					"countries.name","countries.iso2","countries.iso3","countries.id",
					"state.id","state.name","state.iso2","state.country_id",
            ])
			.where(`("user"."user_id"=:userId and "user"."is_deleted"=:is_deleted)`,{ userId,is_deleted:false})
			.andWhere(roles!=null ? (`"user"."role_id" in (:...roles) `):`1=1`,{roles})
            .getOne();
			let user:any={};
			user.userId = userDetail.userId;
			user.firstName = userDetail.firstName;
			user.lastName = userDetail.lastName || "";
			user.email = userDetail.email;
			user.phoneNo = userDetail.phoneNo || "";
			user.countryCode= userDetail.countryCode || "";
			user.address= userDetail.address || "";
			user.country= userDetail.country || {};
			user.state= userDetail.state || {};
			user.dob = userDetail.dob || "";
			user.title= userDetail.title || "";
			user.cityName= userDetail.cityName || "";
			user.dob= userDetail.dob || "";
			user.ziCode= userDetail.zipCode || "";
			user.preferredCurrency= userDetail.preferredCurrency || {};
			user.preferredLanguage= userDetail.preferredLanguage2 || {};
			user.passportNumber= userDetail.passportNumber || "";
			user.passportExpiry= userDetail.passportExpiry || "";
			user.profilePic = userDetail.profilePic
				? `${siteUrl}/profile/${userDetail.profilePic}`
				: "";

			return user;
	}
}
