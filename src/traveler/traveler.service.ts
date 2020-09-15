import {
	Injectable,
	ConflictException,
	NotFoundException,
	BadRequestException,
	InternalServerErrorException,
	NotAcceptableException,
	UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "src/auth/user.repository";
import { MailerService } from "@nestjs-modules/mailer";
import { SaveTravelerDto } from "./dto/save-traveler.dto";
import { User } from "src/entity/user.entity";
import { v4 as uuidv4 } from "uuid";
import { Role } from "src/enum/role.enum";
import { getManager } from "typeorm";
import { Countries } from "src/entity/countries.entity";
import { UpdateTravelerDto } from "./dto/update-traveler.dto";
import { JwtPayload } from "src/auth/jwt-payload.interface";
import { JwtService } from "@nestjs/jwt";
import * as moment from 'moment';

@Injectable()
export class TravelerService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,
		private jwtService: JwtService
	) {}

	async createNewtraveller(
		saveTravelerDto: SaveTravelerDto,
		parent_user_id: string
	) {
		const {
			title,
			first_name,
			last_name,
			dob,
			country_code,
			passport_number,
			passport_expiry,
			gender,
			email,
			phone_no,country_id
		} = saveTravelerDto;
		try {
			let countryDetails = await getManager()
				.createQueryBuilder(Countries, "country")
				.where(`id=:country_id`, { country_id })
				.getOne();

			if (!countryDetails)
				throw new BadRequestException(
					`Country code not exist with database.&&&country_id`
				);

			const user = new User();
			user.userId = uuidv4();
			user.accountType = 1;
			user.socialAccountId = "";
			user.phoneNo = "";
			user.title = title;
			user.dob = dob;
			user.countryCode = country_code;
			user.timezone = "";
			user.status = 1;
			user.gender = gender;
			user.countryId = country_id
			user.passportExpiry = passport_expiry == "" ? null : passport_expiry;
			user.passportNumber = passport_number == "" ? null : passport_number;
			user.roleId = Role.TRAVELER_USER;
			user.email = email;
			user.firstName = first_name;
			user.middleName = "";
			user.zipCode = "";
			user.lastName = last_name;
			user.createdBy = parent_user_id == "" ? null : parent_user_id;
			user.isVerified = true;
			user.createdDate = new Date();
			user.updatedDate = new Date();
			user.isDeleted = false;
			user.phoneNo = phone_no == "" || phone_no == null ? "" : phone_no;
			if (parent_user_id != undefined && parent_user_id != "") {
				const userData = await this.userRepository.getUserData(parent_user_id);
				if (userData.email == user.email) {
					throw new ConflictException(
						`Parents user email id and traveler email id both are same &&& email &&& Parents user email id and traveler email id both are same`
					);
				}
				return this.userRepository.createtraveler(user);
			} else {
				user.roleId = Role.GUEST_USER;
				if(user.email == ""){
					throw new NotFoundException(`Please enter your email id &&&email&&&Please enter your email id`)
				}
				const data = await this.userRepository.createUser(user);
				const payload: JwtPayload = {
					user_id: data.userId,
					email: data.email,
					username: data.firstName + " " + data.lastName,
					firstName: data.firstName,
					phone: data.phoneNo,
					middleName: data.middleName,
					lastName: data.lastName,
					salt: "",

					profilePic: "",
					roleId: data.roleId,
				};
				var userdata:any = {};
				userdata = data
				userdata.token = this.jwtService.sign(payload);

				return userdata;
			}
		} catch (error) {
			console.log(error);
			if (error.response.statusCode == undefined) {
				throw new InternalServerErrorException(
					`${error.message}&&&id&&&${error.Message}`
				);
			}
			switch (error.response.statusCode) {
				case 404:
					if (
						error.response.message ==
						"This user does not exist&&&email&&&This user does not exist"
					) {
						error.response.message = `This parent user does not exist&&&email&&&This parent user not exist`;
					}
					throw new NotFoundException(error.response.message);
				case 409:
					throw new ConflictException(error.response.message);
				case 422:
					throw new BadRequestException(error.response.message);
				case 500:
					throw new InternalServerErrorException(error.response.message);
				case 406:
					throw new NotAcceptableException(error.response.message);
				case 404:
					throw new NotFoundException(error.response.message);
				case 401:
					throw new UnauthorizedException(error.response.message);
				default:
					throw new InternalServerErrorException(
						`${error.message}&&&id&&&${error.Message}`
					);
			}
		}
	}

	async listTraveler(userId: string) {
		try {
			const where = ` "user"."is_deleted" = false AND ("user"."created_by" = '${userId}' OR "user"."user_id" = '${userId}')`;
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
				.getManyAndCount();

			if (!result.length) {
				throw new NotFoundException(`No traveler found.`);
			}
			result.forEach(function(data) {
				// delete data.updatedDate;
				// delete data.salt;
				// delete data.password;
				var birthDate = new Date(data.dob);
				
				var age = moment(new Date()).diff(moment(birthDate),'years');
				
				
				if (age < 2) {
					data.user_type = "infant";
				} else if (age < 12) {
					data.user_type = "child";
				} else {
					data.user_type = "adult";
				}
			});

			return { data: result, TotalReseult: count };
		} catch (error) {
			if (error.response.statusCode == undefined) {
				throw new InternalServerErrorException(
					`${error.message}&&&id&&&${error.Message}`
				);
			}
			switch (error.response.statusCode) {
				case 404:
					throw new NotFoundException(error.response.message);
				case 409:
					throw new ConflictException(error.response.message);
				case 422:
					throw new BadRequestException(error.response.message);
				case 500:
					throw new InternalServerErrorException(error.response.message);
				case 406:
					throw new NotAcceptableException(error.response.message);
				case 404:
					throw new NotFoundException(error.response.message);
				case 401:
					throw new UnauthorizedException(error.response.message);
				default:
					throw new InternalServerErrorException(
						`${error.message}&&&id&&&${error.Message}`
					);
			}
		}
	}

	async getTraveler(userId: string): Promise<User> {
		try {
			return await this.userRepository.getTravelData(userId);
		} catch (error) {
			if (error.response.statusCode == undefined) {
				console.log(error);
				throw new InternalServerErrorException(
					`${error.message}&&&id&&&${error.Message}`
				);
			}
			switch (error.response.statusCode) {
				case 404:
					if (
						error.response.message ==
						"This user does not exist&&&email&&&This user does not exist"
					) {
						error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
					}
					throw new NotFoundException(error.response.message);
				case 409:
					throw new ConflictException(error.response.message);
				case 422:
					throw new BadRequestException(error.response.message);
				case 500:
					throw new InternalServerErrorException(error.response.message);
				case 406:
					throw new NotAcceptableException(error.response.message);
				case 404:
					throw new NotFoundException(error.response.message);
				case 401:
					throw new UnauthorizedException(error.response.message);
				default:
					throw new InternalServerErrorException(
						`${error.message}&&&id&&&${error.Message}`
					);
			}
		}
	}

	async updateTraveler(
		updateTravelerDto: UpdateTravelerDto,
		userId: string,
		updateBy: string
	) {
		try {
			//const traveler = await this.userRepository.getTravelData(userId);
			const traveler = await this.userRepository.findOne(userId)
			if(!traveler)
			{
				throw new NotFoundException(`Traveler not found &&&id&&&Traveler not found`)
			}
			const {
				first_name,
				last_name,
				title,
				dob,
				gender,
				country_code,
				passport_expiry,
				passport_number,
				phone_no,
				country_id,
			} = updateTravelerDto;
			let countryDetails = await getManager()
				.createQueryBuilder(Countries, "country")
				.where(`id=${ country_id }`)
				.getOne();

			if (!countryDetails)
				throw new BadRequestException(
					`Country code not exist with database.&&&country_id`
				);
			traveler.countryCode = country_code;
			traveler.passportExpiry = passport_expiry == "" ? null : passport_expiry;
			traveler.passportNumber = passport_number == "" ? null : passport_number;
			traveler.firstName = first_name;
			traveler.lastName = last_name;
			traveler.isVerified = true;
			traveler.title = title;
			traveler.dob = dob;
			traveler.gender = gender;
			traveler.updatedBy = updateBy;
			traveler.phoneNo = phone_no == "" || phone_no == null ? "" : phone_no;
			traveler.updatedDate = new Date();
			traveler.countryId = countryDetails.id;
			traveler.status = 1;
			//console.log("countryDetails.id",traveler)
			await traveler.save();

			return await this.userRepository.getTravelData(userId);
		} catch (error) {
			if (error.response.statusCode == undefined) {
				console.log(error);
				throw new InternalServerErrorException(
					`${error.message}&&&id&&&${error.Message}`
				);
			}
			switch (error.response.statusCode) {
				case 404:
					if (
						error.response.message ==
						"This user does not exist&&&email&&&This user does not exist"
					) {
						error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
					}
					throw new NotFoundException(error.response.message);
				case 409:
					throw new ConflictException(error.response.message);
				case 422:
					throw new BadRequestException(error.response.message);
				case 500:
					throw new InternalServerErrorException(error.response.message);
				case 406:
					throw new NotAcceptableException(error.response.message);
				case 404:
					throw new NotFoundException(error.response.message);
				case 401:
					throw new UnauthorizedException(error.response.message);
				default:
					throw new InternalServerErrorException(
						`${error.message}&&&id&&&${error.Message}`
					);
			}
		}
	}

	async deleteTraveler(userId: string, updateBy: string) {
		try {
			const traveler = await this.userRepository.getTravelData(userId);
			traveler.isDeleted = true;
			traveler.updatedBy = updateBy;
			traveler.updatedDate = new Date();

			await traveler.save();

			return { message: `Traveler ${traveler.email} is deleted` };
		} catch (error) {
			if (error.response.statusCode == undefined) {
				console.log(error);
				throw new InternalServerErrorException(
					`${error.message}&&&id&&&${error.Message}`
				);
			}
			switch (error.response.statusCode) {
				case 404:
					if (
						error.response.message ==
						"This user does not exist&&&email&&&This user does not exist"
					) {
						error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
					}
					throw new NotFoundException(error.response.message);
				case 409:
					throw new ConflictException(error.response.message);
				case 422:
					throw new BadRequestException(error.response.message);
				case 500:
					throw new InternalServerErrorException(error.response.message);
				case 406:
					throw new NotAcceptableException(error.response.message);
				case 404:
					throw new NotFoundException(error.response.message);
				case 401:
					throw new UnauthorizedException(error.response.message);
				default:
					throw new InternalServerErrorException(
						`${error.message}&&&id&&&${error.Message}`
					);
			}
		}
	}
}
