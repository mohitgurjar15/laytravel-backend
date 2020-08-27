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



@Injectable()
export class TravelerService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,
		private jwtService: JwtService,
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
		} = saveTravelerDto;
		try {
			console.log(parent_user_id)
			let countryDetails = await getManager()
				.createQueryBuilder(Countries, "country")
				.where(`id=:country_code`, { country_code })
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

			if (parent_user_id != undefined && parent_user_id != '') {
				console.log(`hdfw`);
				const userData = await this.userRepository.getUserData(parent_user_id);
				if (userData.email == user.email) {
					throw new ConflictException(
						`Parents user email id and traveler email id both are same &&& email &&& Parents user email id and traveler email id both are same`
					);
				}
				return this.userRepository.createtraveler(user);
			} else {
				user.roleId = Role.GUEST_USER;
				const data = await this.userRepository.createUser(user);
				const payload: JwtPayload = {
					user_id: user.userId,
					email: user.email,
					username: user.firstName + " " + user.lastName,
					firstName: user.firstName,
					phone: user.phoneNo,
					middleName: user.middleName,
					lastName: user.lastName,
					salt: '',
	
					profilePic:  "",
					roleId: user.roleId,
				};
				const accessToken = this.jwtService.sign(payload);
				
				return { data: data, token: accessToken };
				
			}
			
			
		} catch (error) {
			console.log(error)
			if(error.response.statusCode == undefined)
			{
				
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
			const [result, total] = await this.userRepository.findAndCount({
				where: `created_by = '${userId}' AND user_id != '${userId}' AND is_deleted = false AND role_id = ${Role.TRAVELER_USER}`,
			});

			if (!result.length) {
				throw new NotFoundException(`No traveler found.`);
			}
			return { data: result, TotalReseult: total };
		} catch (error) {
			if(error.response.statusCode == undefined)
			{
				console.log(error)
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

	async getTraveler(userId: string):Promise<User> {
		try {
			return await this.userRepository.getTravelData(userId);
		} catch (error) {
			if(error.response.statusCode == undefined)
			{
				console.log(error)
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
    
    async updateTraveler(updateTravelerDto:UpdateTravelerDto ,  userId:string , updateBy : string)
    {
        try {
            const traveler = await this.userRepository.getTravelData(userId);
			
			
            const {first_name,last_name,title,dob,gender,country_code,passport_expiry,passport_number} = updateTravelerDto

            traveler.countryCode = country_code;
			traveler.passportExpiry = passport_expiry == "" ? null : passport_expiry;
			traveler.passportNumber = passport_number == "" ? null : passport_number;
			traveler.firstName = first_name;
			traveler.lastName = last_name;
            traveler.isVerified = true;
            traveler.title = title
            traveler.dob = dob
            traveler.gender = gender
            traveler.updatedBy = updateBy
			traveler.updatedDate = new Date();

			await traveler.save();
			
            return traveler;
		} catch (error) {
			if(error.response.statusCode == undefined)
			{
				console.log(error)
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
	


	async deleteTraveler(userId:string , updateBy : string)
    {
        try {
            const traveler = await this.userRepository.getTravelData(userId);
            traveler.isDeleted = true;
            traveler.updatedBy = updateBy
			traveler.updatedDate = new Date();

			await traveler.save();
			
            return { message :`Traveler ${traveler.email} is deleted`};
		} catch (error) {
			if(error.response.statusCode == undefined)
			{
				console.log(error)
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
