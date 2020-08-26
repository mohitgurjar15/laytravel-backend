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
import { Activity } from "src/utility/activity.utility";

@Injectable()
export class TravelerService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,

		private readonly mailerService: MailerService
	) {}

	async createNewtraveller(
		saveTravelerDto: SaveTravelerDto,
		createdBy: string
	) {
		const {
			title,
			first_name,
			last_name,
			dob,
			country_code,
			passport_number,
			passport_expiry,
			parent_user_id,
			gender,
			email,
		} = saveTravelerDto;
		try {
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
			user.passportExpiry = passport_expiry;
			user.passportNumber = passport_number;
			user.roleId = Role.TRAVELER_USER;
			user.email = email;
			user.firstName = first_name;
			user.middleName = "";
			user.zipCode = "";
			user.lastName = last_name;
			user.createdBy = parent_user_id;
			user.isVerified = true;
			user.createdDate = new Date();
			user.updatedDate = new Date();

			if (parent_user_id) {
				const userData = await this.userRepository.getUserData(parent_user_id);
				if (userData.email == user.email) {
					throw new ConflictException(
						`Parents user email id and traveler email id both are same &&& email &&& Parents user email id and traveler email id both are same`
					);
				}
			} else {
				user.roleId = Role.GUEST_USER;
			}
			Activity.logActivity(
				createdBy,
				"traveler",
				`Traveler ${user.email} is created by user ${createdBy}`
			);

            return this.userRepository.createtraveler(user);
            
		} catch (error) {
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
}
