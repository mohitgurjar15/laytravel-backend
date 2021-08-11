import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from "@nestjs/common";
import { User } from "src/entity/user.entity";
import { CreateLandingPageDto } from "./dto/new-landing-page.dto";
import { v4 as uuidv4 } from "uuid";
import { LandingPages } from "src/entity/landing-page.entity";
import { ListLandingPageDto } from "./dto/list-landing-pages.dto";
import { getConnection } from "typeorm";
import { BookingStatus } from "src/enum/booking-status.enum";
import { CartBooking } from "src/entity/cart-booking.entity";
import { ListReferralDto } from "./dto/list-refferals.dto";
import { CryptoUtility } from "src/utility/crypto.utility";
import { Role } from "src/enum/role.enum";
import * as uuidValidator from "uuid-validate";
import { ExportReferralDto } from "./dto/export-referrals.dto";
import { LANDING_PAGE } from "src/config/landing-page.config";
import { NewLandingPageDownPaymentConfigDto } from "./dto/down-payment-config.dto";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { DownPaymentType } from "src/enum/down-payment-type.enum";
import { LandingPageDownPaymentConfig } from "src/entity/landing-page-downPayment.entity";
import { ListDownPaymentDto } from "./dto/list-down-payment.dto";
import { OfferCriterias } from "src/enum/offer-criteria.enum";
import { OfferCriteriaVariables } from "src/enum/offer-criteria-variables.enum";
import { airports } from "src/flight/airports";
import { NewLandingPageDiscountConfigDto } from "./dto/discount-config.dto";
import { LandingPageDiscountConfig } from "src/entity/landing-page-discount.entity";
import { ListDiscountDto } from "./dto/list-dicount-config.dto";
import { ModulesName } from "src/enum/module.enum";

@Injectable()
export class LandingPageService {
    async createNewLandingPage(
        createLandingPageDto: CreateLandingPageDto,
        user: User
    ) {
        const { name, templet } = createLandingPageDto;

        let where = `"landingPages"."is_deleted" = false AND "landingPages"."name" like '${name}'`;

        const query = getConnection()
            .createQueryBuilder(LandingPages, "landingPages")
            .where(where);

        const result = await query.getOne();
        if (result) {
            throw new ConflictException(`Given Page name already in use.`);
        }

        let landingPage = new LandingPages();
        landingPage.id = uuidv4();
        landingPage.name = name.toLowerCase();
        landingPage.templete = templet;
        landingPage.createdDate = new Date();
        landingPage.userId = user.userId;

        await landingPage.save();

        return {
            message: `Landing page created successfully.`,
        };
    }

    async listLandingPage(paginationOption: ListLandingPageDto) {
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;
        const keyword = search || "";

        let where;
        if (keyword) {
            where = `"landingPages"."is_deleted" = false AND(("landingPages"."name" ILIKE '%${keyword}%') or ("landingPages"."templete" ILIKE '%${keyword}%'))`;
        } else {
            where = `"landingPages"."is_deleted" = false`;
        }
        const query = getConnection()
            .createQueryBuilder(LandingPages, "landingPages")
            .leftJoinAndSelect("landingPages.createByUser", "Users")
            .select([
                "landingPages",
                "Users.firstName",
                "Users.lastName",
                "Users.email",
            ])
            .where(where)
            .take(take)
            .skip(skip);

        const [result, total] = await query.getManyAndCount();
        if (!result.length) {
            throw new NotFoundException(`No data found.`);
        }
        return { data: result, TotalReseult: total };
    }

    async getLandingPage(id: string) {
        if (!uuidValidator(id)) {
            throw new NotFoundException("Given id not avilable");
        }
        let where = `"landingPages"."is_deleted" = false AND "landingPages"."id" = '${id}'`;

        const query = getConnection()
            .createQueryBuilder(LandingPages, "landingPages")
            .leftJoinAndSelect("landingPages.createByUser", "Users")
            .select([
                "landingPages",
                "Users.firstName",
                "Users.lastName",
                "Users.email",
            ])
            .where(where);

        const result = await query.getOne();
        if (!result) {
            throw new NotFoundException(`Id not found.`);
        }
        const refferalUsers = await getConnection()
            .createQueryBuilder(User, "user")
            .where(`referral_id = '${result.id}' AND is_verified = true`)
            .getCount();
        // const refferalbooking = await getConnection().query(
        //     `SELECT count(*) as "cnt" FROM "cart_booking" WHERE referral_id = '${result.id}' `
        // );
        let cartBookings = await getConnection()
            .createQueryBuilder(CartBooking, "cartBooking")
            .leftJoinAndSelect("cartBooking.bookings", "booking")
            .where(
                `("booking"."booking_status" In (${BookingStatus.CONFIRM},${BookingStatus.PENDING}) AND "cartBooking"."referral_id" = '${result.id}')`
            )
            .getCount();
        return {
            data: result,
            refferalUser: refferalUsers || 0,
            refferalBookings: cartBookings || 0,
        };
    }

    async listReferralBooking(paginationOption: ListReferralDto) {
        const { limit, page_no, referral_id, search } = paginationOption;

        if (!uuidValidator(referral_id)) {
            throw new NotFoundException("Given id not avilable");
        }

        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;
        const keyword = search || "";

        let where = `("booking"."booking_status" In (${BookingStatus.CONFIRM},${BookingStatus.PENDING}) AND "cartBooking"."referral_id" = '${referral_id}')`;
        if (keyword) {
            const cipher = await CryptoUtility.encode(search);
            where += `AND (("cartBooking"."laytrip_cart_id" = '${keyword}')or("booking"."laytrip_booking_id" = '${keyword}')or("User"."first_name" = '${cipher}')or("User"."email" = '${cipher}')or("User"."last_name" = '${cipher}'))`;
        }

        let [cartBookings, count] = await getConnection()
            .createQueryBuilder(CartBooking, "cartBooking")
            .leftJoinAndSelect("cartBooking.bookings", "booking")
            .leftJoinAndSelect("booking.user", "User")
            .select([
                "User.userId",
                "User.title",
                "User.dob",
                "User.firstName",
                "User.lastName",
                "User.email",
                "User.profilePic",
                "User.dob",
                "User.gender",
                "User.roleId",
                "User.countryCode",
                "User.phoneNo",
                "cartBooking",
                "booking",
            ])
            .where(where)
            .take(take)
            .skip(skip)
            .getManyAndCount();
        if (!cartBookings.length) {
            throw new NotFoundException(`No data found.`);
        }
        return { data: cartBookings, count };
    }

    async listReferralUser(paginationOption: ListReferralDto) {
        const { limit, page_no, referral_id, search } = paginationOption;

        if (!uuidValidator(referral_id)) {
            throw new NotFoundException("Given id not avilable");
        }

        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;
        const keyword = search || "";

        let where = `referral_id = '${referral_id}' AND is_verified = true AND role_id In (${Role.FREE_USER},${Role.PAID_USER})`;
        if (keyword) {
            const cipher = await CryptoUtility.encode(search);
            where += `AND (("first_name" = '${cipher}')or("email" = '${cipher}')or("last_name" = '${cipher}'))`;
        }

        let [users, count] = await getConnection()
            .createQueryBuilder(User, "user")
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
            ])
            .where(where)
            .take(take)
            .skip(skip)
            .getManyAndCount();
        if (!users.length) {
            throw new NotFoundException(`No data found.`);
        }
        return { data: users, count };
    }

    async addLandingPageDownPayment(newLandingPageDownPaymentConfigDto: NewLandingPageDownPaymentConfigDto, user: User) {
        const { landing_page_id, module_id, days_config_id, down_payment_option, down_payment_type, offer_criteria, payment_frequency } = newLandingPageDownPaymentConfigDto

        let message = `Downpayment configuration added successfully.`
        for await (const iterator of module_id) {
            let where = `config.module_id = ${iterator} AND config.days_config_id = ${days_config_id} AND  config.landing_page_id ='${landing_page_id}'`
            let config = await getConnection()
                .createQueryBuilder(LandingPageDownPaymentConfig, "config")
                .where(where)
                .getOne();
            if (!config) {
                config = new LandingPageDownPaymentConfig
                config.createDate = new Date()
                message = `Downpayment configuration updated successfully.`
            }else{
                config.updatedDate = new Date()
            }
            const offerValues = offer_criteria[0][iterator == ModulesName.FLIGHT ? 'flight' : "hotel"]
            config.moduleId = iterator
            config.daysConfigId = days_config_id
            config.landingPageId = landing_page_id
            config.downPaymentOption = down_payment_option
            config.isDownPaymentInPercentage = down_payment_type == DownPaymentType.PERCENTAGE ? true : false
            config.isWeeklyInstallmentAvailable = payment_frequency.includes(InstalmentType.WEEKLY) ? true : false
            config.isBiWeeklyInstallmentAvailable = payment_frequency.includes(InstalmentType.BIWEEKLY) ? true : false
            config.isMonthlyInstallmentAvailable = payment_frequency.includes(InstalmentType.MONTHLY) ? true : false
            config.offerCriteria = offerValues.offer_criteria_type
            config.offerVariable = offerValues.offer_criteria_variable
            if (offerValues.offer_criteria_type == OfferCriterias.ROUTE && offerValues.offer_criteria_variable == OfferCriteriaVariables.ROUTE) {
                let value = []
                for await (const iterator of offerValues.offer_criteria_value) {
                    value.push(`${iterator.from}-${iterator.to}`)
                }
                config.offerCriteriaValues = value || null
            } else {
                config.offerCriteriaValues = offerValues.offer_criteria_value || null
            }
            await config.save()

        }
        // let where = `config.module_id = ${module_id} AND config.days_config_id = ${days_config_id} AND  config.landing_page_id ='${landing_page_id}'`
        // if (down_payment_option.length) {
        //     for await (const iterator of down_payment_option) {
        //         if (typeof iterator != 'number') {
        //             throw new BadRequestException(`${iterator} not valid in down payment option`)
        //         }
        //     }
        // }

        // if (payment_frequency.length) {
        //     for await (const iterator of payment_frequency) {
        //         if (!Object.values(InstalmentType).includes(iterator)) {
        //             throw new BadRequestException(`${iterator} not valid payment type`)
        //         }
        //     }
        // }
        // let config = new LandingPageDownPaymentConfig
        // config.moduleId = module_id
        // config.daysConfigId = days_config_id
        // config.landingPageId = landing_page_id
        // config.downPaymentOption = down_payment_option
        // config.isDownPaymentInPercentage = down_payment_type == DownPaymentType.PERCENTAGE ? true : false
        // config.createDate = new Date()
        // config.isWeeklyInstallmentAvailable = payment_frequency.includes(InstalmentType.WEEKLY) ? true : false
        // config.isBiWeeklyInstallmentAvailable = payment_frequency.includes(InstalmentType.BIWEEKLY) ? true : false
        // config.isMonthlyInstallmentAvailable = payment_frequency.includes(InstalmentType.MONTHLY) ? true : false
        // config.offerCriteria = offer_criteria_type
        // config.offerVariable = offer_criteria_variable
        // config.createBy = user.userId
        // if (offer_criteria_type == OfferCriterias.ROUTE && offer_criteria_variable == OfferCriteriaVariables.ROUTE) {
        //     let value = []
        //     for await (const iterator of offer_criteria_value) {
        //         value.push(`${iterator.from}-${iterator.to}`)
        //     }
        //     config.offerCriteriaValues = value
        // } else {
        //     config.offerCriteriaValues = offer_criteria_value
        // }
        // const newConfig = await config.save()

        return {
            message: message,
            // data: newConfig
        }
    }

    // async updateLandingPageDownPayment(newLandingPageDownPaymentConfigDto: NewLandingPageDownPaymentConfigDto, user: User) {
    //     const { landing_page_id, module_id, days_config_id, down_payment_option, down_payment_type, offer_criteria_variable, offer_criteria_type, offer_criteria_value, payment_frequency } = newLandingPageDownPaymentConfigDto

    //     let where = `config.module_id = ${module_id} AND config.days_config_id = ${days_config_id} AND  config.landing_page_id ='${landing_page_id}'`
    //     if (down_payment_option.length) {
    //         for await (const iterator of down_payment_option) {
    //             if (typeof iterator != 'number') {
    //                 throw new BadRequestException(`${iterator} not valid in down payment option`)
    //             }
    //         }
    //     }

    //     if (payment_frequency.length) {
    //         for await (const iterator of payment_frequency) {
    //             if (!Object.values(InstalmentType).includes(iterator)) {
    //                 throw new BadRequestException(`${iterator} not valid payment type`)
    //             }
    //         }
    //     }

    //     let config = await getConnection()
    //         .createQueryBuilder(LandingPageDownPaymentConfig, "config")
    //         .where(where)
    //         .getOne();

    //     if (!config) {
    //         throw new NotFoundException(`Please enter valid inputs`)
    //     }
    //     // let config = new LandingPageDownPaymentConfig
    //     config.moduleId = module_id
    //     config.daysConfigId = days_config_id
    //     config.landingPageId = landing_page_id
    //     config.downPaymentOption = down_payment_option
    //     config.isDownPaymentInPercentage = down_payment_type == DownPaymentType.PERCENTAGE ? true : false
    //     config.updatedDate = new Date()
    //     config.updateBy = user.userId
    //     config.isWeeklyInstallmentAvailable = payment_frequency.includes(InstalmentType.WEEKLY) ? true : false
    //     config.isBiWeeklyInstallmentAvailable = payment_frequency.includes(InstalmentType.BIWEEKLY) ? true : false
    //     config.isMonthlyInstallmentAvailable = payment_frequency.includes(InstalmentType.MONTHLY) ? true : false
    //     config.offerCriteria = offer_criteria_type
    //     config.offerVariable = offer_criteria_variable


    //     if (offer_criteria_type == OfferCriterias.ROUTE && offer_criteria_variable == OfferCriteriaVariables.ROUTE) {
    //         let value = []
    //         for await (const iterator of offer_criteria_value) {
    //             value.push(`${iterator.from}-${iterator.to}`)
    //         }
    //         config.offerCriteriaValues = value
    //     } else {
    //         config.offerCriteriaValues = offer_criteria_value
    //     }


    //     await config.save()

    //     return {
    //         message: `Payment configuration updated successfully.`,
    //         data: config
    //     }
    // }

    async getLandingPageDownPayment(listDownPaymentDto: ListDownPaymentDto) {
        const { module_id, landing_page_id } = listDownPaymentDto
        let where = `config.module_id = ${module_id}`

        let landingPageId

        if (landing_page_id) {
            where += `AND config.landing_page_id = '${landing_page_id}'`
        }

        let config = await getConnection()
            .createQueryBuilder(LandingPageDownPaymentConfig, "config")
            .where(where)
            .getMany();

        for await (const iterator of config) {
            if (iterator.offerCriteria == OfferCriterias.ROUTE && iterator.offerVariable == OfferCriteriaVariables.ROUTE) {
                const values: any = iterator.offerCriteriaValues
                let offerCriteriaValues = []
                for await (const val of values) {
                    let spl = val.split("-")

                    let obj = {
                        from: airports[spl[0]],
                        to: airports[spl[1]]
                    }
                    offerCriteriaValues.push(obj)
                }
                iterator.offerCriteriaValues = offerCriteriaValues
            } else if (iterator.offerVariable == OfferCriteriaVariables.AIRPORT_CODE) {
                let offerCriteriaValues = []
                const values: any = iterator.offerCriteriaValues
                for await (const val of values) {
                    let obj = {
                        airport_code: airports[val],
                    }
                    offerCriteriaValues.push(obj)
                }
                iterator.offerCriteriaValues = offerCriteriaValues
            } else if (iterator.offerVariable == OfferCriteriaVariables.COUNTRY) {
                let offerCriteriaValues = []
                const values: any = iterator.offerCriteriaValues
                for await (const val of values) {
                    let obj = {
                        country: val,
                    }
                    offerCriteriaValues.push(obj)
                }
                iterator.offerCriteriaValues = offerCriteriaValues
            } else if (iterator.offerVariable == OfferCriteriaVariables.CITY) {
                let offerCriteriaValues = []
                const values: any = iterator.offerCriteriaValues
                for await (const val of values) {
                    let obj = {
                        city: val,
                    }
                    offerCriteriaValues.push(obj)
                }
                iterator.offerCriteriaValues = offerCriteriaValues
            }

        }

        if (!config) {
            throw new NotFoundException(`Please enter valid inputs`)
        }

        return { config, laytrip_id: landingPageId }
    }

    async addLandingPageDiscount(newLandingPageDiscountConfigDto: NewLandingPageDiscountConfigDto, user: User) {
        const { landing_page_id, module_id, days_config_id, down_payment_type, offer_criteria, minimum_amount, discount, start_date, end_date, from_booking_date, to_booking_date } = newLandingPageDiscountConfigDto

        let config: LandingPageDiscountConfig



        let message = `Discount configuration added successfully.`
        for await (const iterator of module_id) {
            let where = `config.module_id = ${iterator} AND config.days_config_id = ${days_config_id} AND  config.landing_page_id ='${landing_page_id}'`
            let config = await getConnection()
                .createQueryBuilder(LandingPageDiscountConfig, "config")
                .where(where)
                .getOne();
            if (!config) {
                config = new LandingPageDiscountConfig
                config.createDate = new Date()
                message = `Discount configuration updated successfully.`
            }else{
                config.updatedDate = new Date()
            }
            const offerValues = offer_criteria[0][iterator == ModulesName.FLIGHT ? 'flight' : "hotel"]
            config.daysConfigId = days_config_id
            config.moduleId = iterator
            config.landingPageId = landing_page_id
            config.isDiscountInPercentage = down_payment_type == DownPaymentType.PERCENTAGE ? true : false
            config.minimumAmount = minimum_amount
            config.discount = discount
            config.checkInDate = start_date || null
            config.checkoutDate = end_date || null
            config.startDate = from_booking_date || null
            config.endDate = to_booking_date || null
            config.createBy = user.userId
            config.offerCriteria = offerValues.offer_criteria_type
            config.offerVariable = offerValues.offer_criteria_variable
            if (offerValues.offer_criteria_type == OfferCriterias.ROUTE && offerValues.offer_criteria_variable == OfferCriteriaVariables.ROUTE) {
                let value = []
                for await (const iterator of offerValues.offer_criteria_value) {
                    value.push(`${iterator.from}-${iterator.to}`)
                }
                config.offerCriteriaValues = value || null
            } else {
                config.offerCriteriaValues = offerValues.offer_criteria_value || null
            }
            await config.save()

        }
        return {
            message: message,
            data: config
        }
    }

    // async updateLandingPageDiscount(newLandingPageDiscountConfigDto: NewLandingPageDiscountConfigDto, user: User) {
    //     const { landing_page_id, module_id, days_config_id, down_payment_type, offer_criteria_variable, offer_criteria_type, offer_criteria_value,minimum_amount } = newLandingPageDiscountConfigDto

    //     let where = `config.module_id = ${module_id} AND config.days_config_id = ${days_config_id} AND  config.landing_page_id ='${landing_page_id}'`
    //     // if (down_payment_option.length) {
    //     //     for await (const iterator of down_payment_option) {
    //     //         if (typeof iterator != 'number') {
    //     //             throw new BadRequestException(`${iterator} not valid in down payment option`)
    //     //         }
    //     //     }
    //     // }

    //     // if (payment_frequency.length) {
    //     //     for await (const iterator of payment_frequency) {
    //     //         if (!Object.values(InstalmentType).includes(iterator)) {
    //     //             throw new BadRequestException(`${iterator} not valid payment type`)
    //     //         }
    //     //     }
    //     // }

    //     let config = await getConnection()
    //     	.createQueryBuilder(LandingPageDiscountConfig, "config")
    //     	.where(where)
    //     	.getOne();

    //     if (!config) {
    //     	throw new NotFoundException(`Please enter valid inputs`)
    //     }
    //     // let config = new LandingPageDownPaymentConfig
    //     config.moduleId = module_id
    //     config.daysConfigId = days_config_id
    //     config.landingPageId = landing_page_id
    //     // config.downPaymentOption = down_payment_option
    //     config.isDiscountInPercentage = down_payment_type == DownPaymentType.PERCENTAGE ? true : false
    //     config.createDate = new Date()
    //     config.offerCriteria = offer_criteria_type
    //     config.offerVariable = offer_criteria_variable
    //     config.minimumAmount = minimum_amount


    //     if(offer_criteria_type == OfferCriterias.ROUTE &&  offer_criteria_variable == OfferCriteriaVariables.ROUTE ){
    //         let value = []
    //         for await (const iterator of offer_criteria_value) {
    //             value.push(`${iterator.from}-${iterator.to}`)
    //         }
    //         config.offerCriteriaValues = value
    //     }else{
    //         config.offerCriteriaValues = offer_criteria_value
    //     }


    //     await config.save()

    //     return {
    //         message: `Discount configuration updated successfully.`,
    //         data: config
    //     }
    // }

    async getLandingPageDiscount(listDiscountDto: ListDiscountDto) {
        const { module_id, landing_page_id } = listDiscountDto
        let where = `config.module_id = ${module_id}`

        let landingPageId

        if (landing_page_id) {
            where += `AND config.landing_page_id = '${landing_page_id}'`
        }

        let config = await getConnection()
            .createQueryBuilder(LandingPageDiscountConfig, "config")
            .where(where)
            .getMany();

        for await (const iterator of config) {
            if (iterator.offerCriteria == OfferCriterias.ROUTE && iterator.offerVariable == OfferCriteriaVariables.ROUTE) {
                const values: any = iterator.offerCriteriaValues
                let offerCriteriaValues = []
                for await (const val of values) {
                    let spl = val.split("-")

                    let obj = {
                        from: airports[spl[0]],
                        to: airports[spl[1]]
                    }
                    offerCriteriaValues.push(obj)
                }
                iterator.offerCriteriaValues = offerCriteriaValues
            } else if (iterator.offerVariable == OfferCriteriaVariables.AIRPORT_CODE) {
                let offerCriteriaValues = []
                const values: any = iterator.offerCriteriaValues
                for await (const val of values) {
                    let obj = {
                        airport_code: airports[val],
                    }
                    offerCriteriaValues.push(obj)
                }
                iterator.offerCriteriaValues = offerCriteriaValues
            } else if (iterator.offerVariable == OfferCriteriaVariables.CITY) {
                let offerCriteriaValues = []
                const values: any = iterator.offerCriteriaValues
                for await (const val of values) {
                    let obj = {
                        city: val,
                    }
                    offerCriteriaValues.push(obj)
                }
                iterator.offerCriteriaValues = offerCriteriaValues
            }

        }

        if (!config) {
            throw new NotFoundException(`Please enter valid inputs`)
        }

        return { config, laytrip_id: landingPageId }
    }

    async getLandingPageName(name: string) {
        let where = `"landingPages"."is_deleted" = false AND "landingPages"."name" = '${name}'`;

        const query = getConnection()
            .createQueryBuilder(LandingPages, "landingPages")
            .leftJoinAndSelect("landingPages.createByUser", "Users")
            .select([
                "landingPages",
                "Users.firstName",
                "Users.lastName",
                "Users.email",
            ])
            .where(where);

        const result = await query.getOne();
        if (!result) {
            throw new NotFoundException(`Id not found.`);
        }
        return { data: result, config: LANDING_PAGE[result.name] };
    }

    async exportReferralBooking(paginationOption: ExportReferralDto) {
        const { referral_id, search } = paginationOption;

        if (!uuidValidator(referral_id)) {
            throw new NotFoundException("Given id not avilable");
        }


        const keyword = search || "";

        let where = `("booking"."booking_status" In (${BookingStatus.CONFIRM},${BookingStatus.PENDING}) AND "cartBooking"."referral_id" = '${referral_id}')`;
        if (keyword) {
            const cipher = await CryptoUtility.encode(search);
            where += `AND (("User"."first_name" = '${cipher}')or("User"."email" = '${cipher}')or("User"."last_name" = '${cipher}'))`;
        }

        let [cartBookings, count] = await getConnection()
            .createQueryBuilder(CartBooking, "cartBooking")
            .leftJoinAndSelect("cartBooking.bookings", "booking")
            .leftJoinAndSelect("booking.user", "User")
            .select([
                "User.userId",
                "User.title",
                "User.dob",
                "User.firstName",
                "User.lastName",
                "User.email",
                "User.profilePic",
                "User.dob",
                "User.gender",
                "User.roleId",
                "User.countryCode",
                "User.phoneNo",
                "cartBooking",
                "booking",
            ])
            .where(where)
            .getManyAndCount();
        if (!cartBookings.length) {
            throw new NotFoundException(`No data found.`);
        }
        return { data: cartBookings, count };
    }

    async exportReferralUser(paginationOption: ExportReferralDto) {
        const { referral_id, search } = paginationOption;

        if (!uuidValidator(referral_id)) {
            throw new NotFoundException("Given id not avilable");
        }


        const keyword = search || "";

        let where = `referral_id = '${referral_id}' AND is_verified = true AND role_id In (${Role.FREE_USER},${Role.PAID_USER})`;
        if (keyword) {
            const cipher = await CryptoUtility.encode(search);
            where += `AND (("first_name" = '${cipher}')or("email" = '${cipher}')or("last_name" = '${cipher}'))`;
        }

        let [users, count] = await getConnection()
            .createQueryBuilder(User, "user")
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
            ])
            .where(where)
            .getManyAndCount();
        if (!users.length) {
            throw new NotFoundException(`No data found.`);
        }
        return { data: users, count };
    }
}
