import {
    Injectable,
    ConflictException,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    NotAcceptableException,
    UnauthorizedException,
    ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "src/auth/user.repository";
import { SaveTravelerDto } from "./dto/save-traveler.dto";
import { User } from "src/entity/user.entity";
import { v4 as uuidv4 } from "uuid";
import { Role } from "src/enum/role.enum";
import { getConnection, getManager } from "typeorm";
import { Countries } from "src/entity/countries.entity";
import { UpdateTravelerDto } from "./dto/update-traveler.dto";
import { JwtPayload } from "src/auth/jwt-payload.interface";
import { JwtService } from "@nestjs/jwt";
import * as moment from "moment";
import { errorMessage } from "src/config/common.config";
import { Gender } from "src/enum/gender.enum";
import * as uuidValidator from "uuid-validate";
import { MultipleTravelersDto } from "./dto/multiple-add-traveler.dto";

@Injectable()
export class TravelerService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService
    ) {}

    async multipleTravelerAdd(
        TravelerDto: MultipleTravelersDto,
        parent_user_id: string,
        guest_id: string
    ) {
        try {
            const { travelers } = TravelerDto;
            let userData: User;
            if (parent_user_id) {
                userData = await this.userRepository.getUserData(
                    parent_user_id
                );
                if (!userData) {
                    throw new UnauthorizedException(
                        `Please login to continue.`
                    );
                }
            } else {
                if (!uuidValidator(guest_id)) {
                    throw new UnauthorizedException(
                        `Please login to continue.`
                    );
                }
            }

            for await (const traveler of travelers) {
                if (traveler.traveler_id) {
                    const userId = traveler.traveler_id;
                    if (!uuidValidator(userId)) {
                        throw new NotFoundException("Traveler not registered.");
                    }

                    const travelerData = await this.userRepository.findOne({
                        userId,
                    });
                    if (!travelerData) {
                        throw new NotFoundException(`Traveler not registered.`);
                    }
                } else {
                    let countryDetails = await getConnection()
                        .createQueryBuilder(Countries, "country")
                        .where(`id=:country_id`, {
                            country_id: traveler.country_id,
                        })
                        .getOne();

                    if (!countryDetails)
                        throw new BadRequestException(
                            `Country code not exist with database.&&&country_id`
                        );
                }
            }
            let responce = [];
            for await (const traveler of travelers) {
                console.log(traveler.traveler_id != userData.userId);
                console.log(traveler.traveler_id);
                if (traveler.traveler_id == userData?.userId) {
                    const primaryTraveler = await this.userRepository.getTravelData(
                        traveler.traveler_id
                    );
                    responce.push(primaryTraveler);
                } else if (
                    traveler.traveler_id &&
                    traveler.traveler_id != userData.userId
                ) {
                    const updatedTraveler = await this.updateTraveler(
                        traveler,
                        traveler.traveler_id,
                        parent_user_id,
                        guest_id
                    );
                    responce.push(updatedTraveler);
                } else {
                    const newTraveler = await this.createNewtraveller(
                        traveler,
                        parent_user_id,
                        guest_id
                    );
                    responce.push(newTraveler);
                }
            }
            return {
                travelers: responce,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                console.log("m");
                switch (error.response.statusCode) {
                    case 404:
                        if (
                            error.response.message ==
                            "This user does not exist&&&email&&&This user does not exist"
                        ) {
                            error.response.message = `Traveler not registered.`;
                        }
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }
    async createNewtraveller(
        saveTravelerDto: SaveTravelerDto,
        parent_user_id: string,
        guest_id: string
    ) {
        const {
            first_name,
            last_name,
            dob,
            country_code,
            passport_number,
            passport_expiry,
            gender,
            email,
            phone_no,
            country_id,
        } = saveTravelerDto;
        try {
            if (country_id) {
                let countryDetails = await getManager()
                    .createQueryBuilder(Countries, "country")
                    .where(`id=:country_id`, { country_id })
                    .getOne();

                if (!countryDetails)
                    throw new BadRequestException(
                        `Country code not exist with database.&&&country_id`
                    );
            }

            if (!parent_user_id) {
                if (!uuidValidator(guest_id)) {
                    throw new UnauthorizedException(
                        `Please login to continue.`
                    );
                }
            }
            const user = new User();
            user.userId = uuidv4();
            user.accountType = 1;
            user.socialAccountId = "";
            user.phoneNo = "";
            if (gender) {
                user.title = gender == Gender.M ? "mr" : "ms";
            }

            user.dob = dob || null;
            user.countryCode = country_code || null;
            user.timezone = "";
            user.status = 1;
            user.gender = gender || null;
            user.countryId = country_id || null;
            user.passportExpiry =
                passport_expiry == "" ? null : passport_expiry;
            user.passportNumber =
                passport_number == "" ? null : passport_number;
            user.roleId = Role.TRAVELER_USER;
            user.email = email;
            user.firstName = first_name;
            user.middleName = "";
            user.zipCode = "";
            user.lastName = last_name;
            if (parent_user_id) {
                user.createdBy = parent_user_id == "" ? null : parent_user_id;
            }
            if (guest_id) {
                user.parentGuestUserId = guest_id;
            }

            user.isVerified = true;
            user.createdDate = new Date();
            user.updatedDate = new Date();
            user.isDeleted = false;
            user.phoneNo = phone_no == "" || phone_no == null ? "" : phone_no;

            return this.userRepository.createtraveler(user);
            // if (parent_user_id != undefined && parent_user_id != "") {
            // 	// const userData = await this.userRepository.getUserData(parent_user_id);
            // 	// if (userData.email == user.email) {
            // 	// 	throw new ConflictException(
            // 	// 		`You have already added your email.`
            // 	// 	);
            // 	// }
            // 	return this.userRepository.createtraveler(user);
            // } else if (guest_id) {

            // }
            // else {
            // 	user.roleId = Role.GUEST_USER;
            // 	if (user.email == "") {
            // 		throw new NotFoundException(
            // 			`Please enter your email id &&&email&&&Please enter your email id`
            // 		);
            // 	}
            // 	const roles = [Role.TRAVELER_USER]
            // 	const data = await this.userRepository.createUser(user, roles);
            // 	const payload: JwtPayload = {
            // 		user_id: data.userId,
            // 		email: data.email,
            // 		username: data.firstName + " " + data.lastName,
            // 		firstName: data.firstName,
            // 		phone: data.phoneNo,
            // 		middleName: data.middleName,
            // 		lastName: data.lastName,
            // 		salt: "",

            // 		profilePic: "",
            // 		roleId: data.roleId,
            // 	};
            // 	var userdata: any = {};
            // 	userdata = data;
            // 	userdata.token = this.jwtService.sign(payload);

            // 	return userdata;
            // }
        } catch (error) {
            if (typeof error.response !== "undefined") {
                console.log("m");
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
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async listTraveler(userId: string, guest_id) {
        try {
            let where;
            if (userId) {
                if (!uuidValidator(userId)) {
                    throw new NotFoundException("Given id not avilable");
                }
                where = ` "user"."is_deleted" = false AND ("user"."created_by" = '${userId}' OR "user"."user_id" = '${userId}')`;
            } else {
                if (!uuidValidator(guest_id)) {
                    throw new NotFoundException("Given guest_id not avilable");
                }
                where = ` "user"."is_deleted" = false AND ("user"."parent_guest_user_id" = '${guest_id}')`;
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
                .getManyAndCount();

            if (!result.length) {
                throw new NotFoundException(`No data found.`);
            }
            for await (const data of result) {
                // delete data.updatedDate;
                // delete data.salt;
                // delete data.password;
                data.passportExpiry = data.passportExpiry || "";
                data.passportNumber = data.passportNumber || "";
                var birthDate = new Date(data.dob);

                var age = moment(new Date()).diff(moment(birthDate), "years");
                data.age = age;
                if (age < 2) {
                    data.user_type = "infant";
                } else if (age < 12) {
                    data.user_type = "child";
                } else {
                    data.user_type = "adult";
                }
            }

            return { data: result, TotalReseult: count };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async getTraveler(userId: string): Promise<User> {
        try {
            if (!uuidValidator(userId)) {
                throw new NotFoundException("Given id not avilable");
            }
            return await this.userRepository.getTravelData(userId);
        } catch (error) {
            if (typeof error.response !== "undefined") {
                console.log("m");
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
                    case 400:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async updateTraveler(
        updateTravelerDto: UpdateTravelerDto,
        userId: string,
        updateBy: string,
        guest_id: string
    ) {
        try {
            if (!uuidValidator(userId)) {
                throw new NotFoundException("Given id not avilable");
            }
            //const traveler = await this.userRepository.getTravelData(userId);
            const traveler = await this.userRepository.findOne(userId);
            if (!traveler) {
                throw new NotFoundException(
                    `Traveler not found &&&id&&&Traveler not found`
                );
            }
            const {
                first_name,
                last_name,
                email,
                dob,
                gender,
                country_code,
                passport_expiry,
                passport_number,
                phone_no,
                country_id,
            } = updateTravelerDto;
            if (country_id) {
                let countryDetails = await getManager()
                    .createQueryBuilder(Countries, "country")
                    .where(`id=${country_id}`)
                    .getOne();

                if (!countryDetails)
                    throw new BadRequestException(
                        `Country code not exist with database.&&&country_id`
                    );
            }

            traveler.countryCode = country_code;
            traveler.passportExpiry =
                passport_expiry == "" ? null : passport_expiry;
            traveler.passportNumber =
                passport_number == "" ? null : passport_number;
            traveler.firstName = first_name;
            traveler.lastName = last_name;
            traveler.isVerified = true;
            if (email && traveler.roleId == Role.TRAVELER_USER) {
                traveler.email = email;
            }
            if (gender) {
                traveler.title = gender == Gender.M ? "mr" : "ms";
            }

            traveler.dob = dob;
            traveler.gender = gender || null;
            traveler.updatedBy = updateBy ? updateBy : guest_id;
            traveler.phoneNo =
                phone_no == "" || phone_no == null ? "" : phone_no;
            traveler.updatedDate = new Date();
            traveler.countryId = country_id || null;
            traveler.status = 1;
            //console.log("countryDetails.id",traveler)
            await traveler.save();

            return await this.userRepository.getTravelData(userId);
        } catch (error) {
            if (typeof error.response !== "undefined") {
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
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async deleteTraveler(userId: string, updateBy: string) {
        try {
            if (!uuidValidator(userId)) {
                throw new NotFoundException("Given id not avilable");
            }
            const traveler = await this.userRepository.getTravelData(userId);
            traveler.isDeleted = true;
            traveler.updatedBy = updateBy;
            traveler.updatedDate = new Date();

            await traveler.save();

            return { message: `Traveler is deleted successfully` };
        } catch (error) {
            if (typeof error.response !== "undefined") {
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
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }
}
