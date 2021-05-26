import {
    EntityRepository,
    Repository,
    getManager,
    getConnection,
} from "typeorm";
import { Booking } from "src/entity/booking.entity";
import { ListBookingDto } from "./dto/list-booking.dto";
import { NotFoundException } from "@nestjs/common";
import { ListPaymentDto } from "./dto/list-payment.dto";
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { User } from "src/entity/user.entity";
import * as moment from "moment";
import { PredictiveBookingData } from "src/entity/predictive-booking-data.entity";
import { ExportBookingDto } from "./dto/export-booking.dto";
import { BookingType } from "src/enum/booking-type.enum";
import { BookingStatus } from "src/enum/booking-status.enum";
import { ModulesName } from "src/enum/module.enum";
import { CryptoUtility } from "src/utility/crypto.utility";
import { BookingStatusUtility } from "src/utility/booking-status.utility";

@EntityRepository(Booking)
export class BookingRepository extends Repository<Booking> {
    async listBooking(listBookingDto: ListBookingDto, userId: string = "") {
        const {
            limit,
            page_no,
            start_date,
            end_date,
            booking_status,
            booking_type,
            customer_name,
            payment_type,
            booking_id,
            search,
            module_id,
            supplier_id,
            email,
            booking_through,
            transaction_token,
            product_id,
            depature_date,
            booking_date,
            reservationId,
            category_name,
            order_by_booking_date,
            order_by_cancelation_date,
            order_by_depature_date,
            update_by,
            status,
        } = listBookingDto;
        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;

        let where;
        where = `1=1 `;
        if (userId) {
            where += `AND ("booking"."user_id" = '${userId}')`;
        }

        if (status?.length) {
            if (typeof status != "object") {
                console.log(status);
                
                let w = await BookingStatusUtility.filterCondition(parseInt(status), "booking");
                console.log(w);
                
                if (w) {
                    where += `AND (${w})`;
                }
            } else {
                console.log(status);
                let or = ''
                for await (const s of status) {
                    let w = await BookingStatusUtility.filterCondition(
                        s,
                        "booking"
                    );
                    if (w) {
                        or += `${or == '' ? '':'or'}(${w})`;
                    }
                }
                if(or != ''){
                     where += `AND (${or})`;
                }
            }
        }

        if (booking_through?.length) {
            if (typeof booking_through != "object") {
                where += `AND ("booking"."booking_through" =:booking_through)`;
            } else {
                where += `AND ("booking"."booking_through" in (:...booking_through))`;
            }
        }

        if (update_by?.length) {
            if (typeof update_by != "object") {
                where += `AND ("updateBy"."role_id" =:update_by)`;
            } else {
                where += `AND ("updateBy"."role_id" in (:...update_by))`;
            }
        }

        if (category_name?.length) {
            if (typeof category_name != "object") {
                where += `AND ("booking"."category_name" =:category_name)`;
            } else {
                where += `AND ("booking"."category_name" in (:...category_name))`;
            }
        }

        if (payment_type?.length) {
            if (typeof payment_type != "object") {
                where += `AND ("booking"."payment_type" =:payment_type)`;
            } else {
                where += `AND ("booking"."payment_type" in (:...payment_type))`;
            }
        }

        if (reservationId) {
            where += `AND ("booking"."reservation_id" = '${reservationId}')`;
        }

        if (module_id?.length) {
            if (typeof module_id != "object") {
                where += `AND ("booking"."module_id" =:module_id)`;
            } else {
                where += `AND ("booking"."module_id" in (:...module_id))`;
            }
        }

        if (supplier_id) {
            where += `AND ("booking"."supplier_id" = '${supplier_id}')`;
        }

        if (booking_date) {
            where += `AND (DATE("booking".booking_date) = '${booking_date}') `;
        }

        if (depature_date) {
            where += `AND (DATE("booking".check_in_date) = '${depature_date}') `;
        }

        if (start_date) {
            where += `AND (DATE("booking".booking_date) >= '${start_date}') `;
        }
        if (end_date) {
            where += `AND (DATE("booking".booking_date) <= '${end_date}') `;
        }
        if (booking_status?.length) {
            if (booking_status.length == 1) {
                where += `AND ("booking"."booking_status" =:booking_status)`;
            } else {
                where += `AND ("booking"."booking_status" in (:...booking_status))`;
            }
        }
        if (booking_type?.length) {
            if (typeof booking_type != "object") {
                where += `AND ("booking"."booking_type" =:booking_type)`;
            } else {
                where += `AND ("booking"."booking_type" in (:...booking_type))`;
            }
        }

        if (product_id) {
            where += `AND ("booking"."laytrip_booking_id" =  '${product_id}')`;
        }

        if (booking_id) {
            where += `AND ("cart"."laytrip_cart_id" =  '${booking_id}')`;
        }

        if (customer_name) {
            const cipher = await CryptoUtility.encode(customer_name);
            where += `AND (("User"."first_name" = '${cipher}')or("User"."last_name" = '${cipher}'))`;
        }

        if (search) {
            const cipher = await CryptoUtility.encode(search);
            where += `AND (("User"."first_name" = '${cipher}'))or("User"."email" = '${cipher}'))or("User"."last_name" = '${cipher}')) or ("instalments"."transaction_token" = '${cipher}')))`;
        }

        if (email) {
            where += `AND ("User"."email" = '${await CryptoUtility.encode(
                email
            )}')`;
        }

        if (transaction_token) {
            where += `AND ("instalments"."transaction_token" ILIKE '%${transaction_token}%')`;
        }
        console.log(where);

        const query = getManager()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect("booking.bookingInstalments", "instalments")
            .leftJoinAndSelect("booking.cart", "cart")
            .leftJoinAndSelect("booking.currency2", "currency")
            .leftJoinAndSelect("booking.user", "User")
            .leftJoinAndSelect("booking.updateByUser", "updateBy")
            .leftJoinAndSelect("booking.travelers", "traveler")
            .leftJoinAndSelect("User.state", "state")
            .leftJoinAndSelect("User.country", "countries")
            // .leftJoinAndSelect("booking.supplier", "supplier")
            .where(where, {
                booking_type,
                booking_status,
                module_id,
                payment_type,
                product_id,
                booking_id,
                booking_through,
                reservationId,
                category_name,
                update_by,
            })
            .take(take)
            .skip(skip);
        // .orderBy(`booking.bookingDate`, "DESC");
        if (order_by_depature_date) {
            query.addOrderBy(
                `booking.checkInDate`,
                order_by_depature_date == "ASC" ? "ASC" : "DESC"
            );
        }
        if (order_by_booking_date) {
            query.addOrderBy(
                `booking.bookingDate`,
                order_by_booking_date == "ASC" ? "ASC" : "DESC"
            );
        }
        if (order_by_cancelation_date) {
            query.addOrderBy(
                `booking.updatedDate`,
                order_by_cancelation_date == "ASC" ? "ASC" : "DESC"
            );
        }

        //  console.log(query);

        const [data, count] = await query.getManyAndCount();

        if (!data.length) {
            throw new NotFoundException(
                `No booking found&&&id&&&No booking found`
            );
        }
        return { data: data, total_count: count };
    }

    async getBookingDetails(bookingId) {
        let result = await getManager()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect("booking.bookingInstalments", "instalments")
            .leftJoinAndSelect("booking.currency2", "currency")
            .leftJoinAndSelect("booking.module", "module")
            .leftJoinAndSelect("booking.cart", "cart")
            .leftJoinAndSelect("booking.user", "User")
            .leftJoinAndSelect("booking.travelers", "traveler")
            .leftJoinAndSelect("traveler.userData", "userData")
            .leftJoinAndSelect("User.country", "countries")
            .leftJoinAndSelect("User.state", "state")
            /* .select([
			"user.userId","user.title",
			"user.firstName","user.lastName","user.email",
			"user.countryCode","user.phoneNo","user.zipCode",
			"user.gender","user.dob","user.passportNumber",
			"user.passportExpiry",
			"countries.name","countries.iso2","countries.iso3","countries.id",
		]) */
            .where('"booking"."laytrip_booking_id"=:bookingId', { bookingId })
            .getOne();

        let paidAmount = 0;
        let remainAmount = 0;

        //console.log(result);

        if (result.bookingInstalments.length > 0) {
            result.bookingInstalments.sort((a, b) => a.id - b.id);
        }

        delete result.user.updatedDate;
        delete result.user.salt;
        delete result.user.password;
        delete result.module.liveCredential;
        delete result.module.testCredential;
        for (let j in result.travelers) {
            // var birthDate = new Date(result.travelers[j].travelerInfo.dob);
            // var age = moment(new Date()).diff(moment(birthDate), 'years');
            // result.travelers[j].travelerInfo.age = age;
            // if (age < 2) {
            // 	result.travelers[j].travelerInfo.user_type = "infant";
            // } else if (age < 12) {
            // 	result.travelers[j].travelerInfo.user_type = "child";
            // } else {
            // 	result.travelers[j].travelerInfo.user_type = "adult";
            // }
        }

        return result;

        //return bookingDetails;
    }

    async getBookDetail(id) {
        let relations = [
            "user",
            "currency2",
            "bookingInstalments",
            "travelers",
            "card",
        ];

        let result = this.findOne({
            where: { laytripBookingId: id },
            relations,
        });

        return result;
    }

    async bookingDetail(bookingId: string) {
        //const { bookingId } = getBookingDetailsDto;

        const where = `"booking"."laytrip_booking_id" = '${bookingId}'`;
        const data = await getManager()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect("booking.cart", "cart")
            .leftJoinAndSelect("booking.bookingInstalments", "instalments")
            .leftJoinAndSelect("booking.currency2", "currency")
            .leftJoinAndSelect("booking.user", "User")
            .leftJoinAndSelect("booking.travelers", "traveler")
            .leftJoinAndSelect("User.country", "countries")
            .leftJoinAndSelect("User.state", "state")
            .leftJoinAndSelect("booking.supplier", "supplier")
            .where(where)
            .getOne();

        if (!data) {
            throw new NotFoundException(
                `No booking found&&&id&&&No booking found`
            );
        }

        if (data.bookingInstalments.length > 0) {
            data.bookingInstalments.sort((a, b) => a.id - b.id);
        }
        return data;
    }

    async getPayments(user: User, listPaymentDto: ListPaymentDto) {
        const {
            page_no,
            limit,
            booking_id,
            payment_end_date,
            booking_type,
            payment_start_date,
            instalment_type,
            module_id,
            payment_status,
            product_id,
        } = listPaymentDto;

        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;

        let query = getManager()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect("booking.cart", "cart")
            .leftJoinAndSelect(
                "booking.bookingInstalments",
                "BookingInstalments"
            )
            .leftJoinAndSelect("booking.currency2", "currency")
            .leftJoinAndSelect("booking.user", "User")
            .leftJoinAndSelect("booking.module", "moduleData")
            .leftJoinAndSelect("User.state", "state")
            .leftJoinAndSelect("User.country", "countries")
            // .leftJoinAndSelect("BookingInstalments.supplier", "supplier")
            .leftJoinAndSelect(
                "BookingInstalments.failedPaymentAttempts",
                "failedPaymentAttempts"
            )
            .select([
                "BookingInstalments.id",
                "BookingInstalments.bookingId",
                "BookingInstalments.userId",
                "BookingInstalments.moduleId",
                "BookingInstalments.supplierId",
                "BookingInstalments.instalmentType",
                "BookingInstalments.instalmentNo",
                "BookingInstalments.instalmentDate",
                "BookingInstalments.currencyId",
                "BookingInstalments.amount",
                "BookingInstalments.instalmentStatus",
                "BookingInstalments.paymentGatewayId",
                "BookingInstalments.paymentInfo",
                "BookingInstalments.paymentStatus",
                "BookingInstalments.isPaymentProcessedToSupplier",
                "BookingInstalments.isInvoiceGenerated",
                "BookingInstalments.comment",
                "BookingInstalments.transactionToken",
                "booking.laytripBookingId",
                "booking.id",
                "booking.categoryName",
                "booking.moduleId",
                "booking.bookingType",
                "booking.bookingStatus",
                "booking.currency",
                "booking.totalAmount",
                "booking.netRate",
                "booking.markupAmount",
                "booking.usdFactor",
                "booking.bookingDate",
                "booking.totalInstallments",
                "booking.locationInfo",
                "booking.paymentGatewayId",
                "booking.paymentStatus",
                "booking.paymentInfo",
                "booking.isPredictive",
                "booking.layCredit",
                "booking.fareType",
                "booking.isTicketd",
                "booking.paymentGatewayProcessingFee",
                "booking.supplierId",
                "booking.nextInstalmentDate",
                "booking.supplierBookingId",
                "currency.id",
                "currency.code",
                "currency.symbol",
                "currency.liveRate",
                "User.userId",
                "User.firstName",
                "User.lastName",
                "User.socialAccountId",
                "User.email",
                "User.phoneNo",
                "User.roleId",
                "moduleData.name",
                "moduleData.id",
                "failedPaymentAttempts.id",
                "failedPaymentAttempts.instalmentId",
                "failedPaymentAttempts.date",
                "cart.laytripCartId",
            ])
            .take(take)
            .skip(skip)
            .where(`"User"."user_id" =:userId`, { userId: user.userId });
        //.orderBy("BookingInstalments.id", 'DESC')

        if (product_id) {
            query = query.andWhere(
                `AND ("booking"."laytrip_booking_id" =  '${product_id}')`
            );
        }

        if (booking_id) {
            query = query.andWhere(
                `AND ("cart"."laytrip_cart_id" =  '${booking_id}')`
            );
        }
        if (booking_type)
            query = query.andWhere(`"booking"."booking_type"=:booking_type`, {
                booking_type,
            });

        if (module_id)
            query = query.andWhere(`"booking"."module_id"=:module_id`, {
                module_id,
            });
        if (payment_status) {
            query = query.andWhere(
                `"booking"."payment_status"=:payment_status`,
                {
                    payment_status,
                }
            );
        }
        if (payment_start_date && payment_end_date) {
            query = query.andWhere(
                `"BookingInstalments"."instalment_date" >=:payment_start_date and "BookingInstalments"."instalment_date" <=:payment_end_date`,
                { payment_start_date, payment_end_date }
            );
        } else if (payment_start_date) {
            query = query.andWhere(
                `"BookingInstalments"."instalment_date"=:payment_start_date`,
                { payment_start_date }
            );
        }

        if (instalment_type) {
            query = query.andWhere(
                `"BookingInstalments"."instalment_type" =:instalment_type`,
                { instalment_type }
            );
        }

        const [result, count] = await query.getManyAndCount();
        //const count = await query.getCount();
        return { data: result, total_result: count };
    }

    async listPayment(where: string, limit: number, page_no: number) {
        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;

        let query = getConnection()
            .createQueryBuilder(BookingInstalments, "BookingInstalments")
            .leftJoinAndSelect("BookingInstalments.booking", "booking")
            .leftJoinAndSelect("booking.cart", "cart")
            .leftJoinAndSelect("booking.bookingInstalments", "installment")
            .leftJoinAndSelect("BookingInstalments.currency", "currency")
            .leftJoinAndSelect("BookingInstalments.user", "User")
            .leftJoinAndSelect("BookingInstalments.module", "moduleData")
            .leftJoinAndSelect("BookingInstalments.captureByUser", "captureBy")
            .select([
                "BookingInstalments.attempt",
                "BookingInstalments.id",
                "BookingInstalments.bookingId",
                "BookingInstalments.userId",
                "BookingInstalments.moduleId",
                "BookingInstalments.supplierId",
                "BookingInstalments.instalmentType",
                "BookingInstalments.instalmentNo",
                "BookingInstalments.instalmentDate",
                "BookingInstalments.currencyId",
                "BookingInstalments.amount",
                "BookingInstalments.instalmentStatus",
                "BookingInstalments.paymentGatewayId",
                "BookingInstalments.paymentInfo",
                "BookingInstalments.paymentStatus",
                "BookingInstalments.isPaymentProcessedToSupplier",
                "BookingInstalments.isInvoiceGenerated",
                "BookingInstalments.transactionToken",
                "BookingInstalments.paymentCaptureDate",
                "BookingInstalments.comment",
                "installment.id",
                "installment.instalmentDate",
                "installment.currencyId",
                "installment.amount",
                "installment.instalmentStatus",
                "installment.paymentInfo",
                "installment.paymentStatus",
                "booking.bookingType",
                "booking.bookingStatus",
                "booking.currency",
                "booking.totalAmount",
                "booking.categoryName",
                "booking.netRate",
                "booking.markupAmount",
                "booking.usdFactor",
                "booking.bookingDate",
                "booking.totalInstallments",
                "booking.locationInfo",
                "booking.moduleInfo",
                "booking.paymentGatewayId",
                "booking.paymentStatus",
                "booking.paymentInfo",
                "booking.isPredictive",
                "booking.layCredit",
                "booking.fareType",
                "booking.isTicketd",
                "booking.laytripBookingId",
                "booking.paymentGatewayProcessingFee",
                "booking.supplierId",
                "booking.nextInstalmentDate",
                "booking.supplierBookingId",
                "currency.id",
                "currency.code",
                "currency.symbol",
                "currency.liveRate",
                "User.userId",
                "User.firstName",
                "User.lastName",
                "User.socialAccountId",
                "User.email",
                "User.phoneNo",
                "User.roleId",
                "moduleData.name",
                "cart.laytripCartId",
                "BookingInstalments.isManually",
                "captureBy.firstName",
                "captureBy.lastName",
                "captureBy.socialAccountId",
                "captureBy.email",
                "captureBy.phoneNo",
                "captureBy.roleId",
            ])

            .where(where)
            .take(take)
            .skip(skip)
            .orderBy("BookingInstalments.id", "DESC");
        const [data, count] = await query.getManyAndCount();
        // const count = await query.getCount();
        if (!data.length) {
            throw new NotFoundException(
                `Payment record not found&&&id&&&Payment record not found`
            );
        }
        return { data: data, total_count: count };
    }

    async exportPayment(where: string) {
        let query = getConnection()
            .createQueryBuilder(BookingInstalments, "BookingInstalments")
            .leftJoinAndSelect("BookingInstalments.booking", "booking")
            .leftJoinAndSelect("booking.cart", "cart")
            //.leftJoinAndSelect("booking.bookingInstalments", "installment")
            .leftJoinAndSelect("BookingInstalments.currency", "currency")
            .leftJoinAndSelect("BookingInstalments.user", "User")
            .leftJoinAndSelect("BookingInstalments.module", "moduleData")
            .leftJoinAndSelect("BookingInstalments.captureByUser", "captureBy")
            .select([
                "captureBy.firstName",
                "captureBy.lastName",
                "captureBy.socialAccountId",
                "captureBy.email",
                "captureBy.phoneNo",
                "captureBy.roleId",
                "BookingInstalments.attempt",
                "BookingInstalments.id",
                "BookingInstalments.bookingId",
                "BookingInstalments.userId",
                "BookingInstalments.moduleId",
                "BookingInstalments.supplierId",
                "BookingInstalments.instalmentType",
                "BookingInstalments.instalmentNo",
                "BookingInstalments.instalmentDate",
                "BookingInstalments.currencyId",
                "BookingInstalments.amount",
                "BookingInstalments.instalmentStatus",
                "BookingInstalments.paymentGatewayId",
                "BookingInstalments.paymentInfo",
                "BookingInstalments.paymentStatus",
                "BookingInstalments.isPaymentProcessedToSupplier",
                "BookingInstalments.isInvoiceGenerated",
                "BookingInstalments.transactionToken",
                "BookingInstalments.comment",
                "BookingInstalments.paymentCaptureDate",
                "BookingInstalments.isManually",
                "cart.laytripCartId",
                // "installment.id",
                // "installment.instalmentDate",
                // "installment.currencyId",
                // "installment.amount",
                // "installment.instalmentStatus",
                // "installment.paymentInfo",
                // "installment.paymentStatus",
                "booking.bookingType",
                "booking.bookingStatus",
                "booking.currency",
                "booking.totalAmount",
                "booking.netRate",
                "booking.markupAmount",
                "booking.usdFactor",
                "booking.bookingDate",
                "booking.categoryName",
                "booking.totalInstallments",
                "booking.locationInfo",
                // "booking.moduleInfo",
                "booking.paymentGatewayId",
                "booking.paymentStatus",
                "booking.paymentInfo",
                "booking.isPredictive",
                "booking.layCredit",
                "booking.fareType",
                "booking.isTicketd",
                "booking.laytripBookingId",
                "booking.paymentGatewayProcessingFee",
                "booking.supplierId",
                "booking.nextInstalmentDate",
                "booking.supplierBookingId",
                "currency.id",
                "currency.code",
                "currency.symbol",
                "currency.liveRate",
                "User.userId",
                "User.firstName",
                "User.lastName",
                "User.socialAccountId",
                "User.email",
                "User.phoneNo",
                "User.roleId",
                "moduleData.name",
            ])

            .where(where)
            .orderBy("BookingInstalments.id", "DESC");
        const [data, count] = await query.getManyAndCount();
        // const count = await query.getCount();
        if (!data.length) {
            throw new NotFoundException(
                `Payment record not found&&&id&&&Payment record not found`
            );
        }
        return { data: data, total_count: count };
    }
    async getPredictiveBookingDdata() {
        //const {booking_id , below_minimum_seat} = filterOption
        const date = new Date();
        var todayDate = date.toISOString();
        todayDate = todayDate
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "");
        let query = getManager()
            .createQueryBuilder(PredictiveBookingData, "predictiveBookingData")
            .leftJoinAndSelect("predictiveBookingData.booking", "booking")
            .leftJoinAndSelect("booking.cart", "cart")
            .leftJoinAndSelect("booking.module", "moduleData")

            .select([
                "booking.bookingType",
                "booking.updateBy",
                "booking.bookingStatus",
                "booking.checkInDate",
                "booking.currency",
                "booking.totalAmount",
                "booking.netRate",
                "booking.markupAmount",
                "booking.usdFactor",
                "booking.bookingDate",
                "booking.totalInstallments",
                "booking.moduleInfo",
                "booking.categoryName",
                "booking.locationInfo",
                "booking.paymentGatewayId",
                "booking.paymentStatus",
                "booking.paymentInfo",
                "booking.isPredictive",
                "booking.layCredit",
                "booking.fareType",
                "booking.isTicketd",
                "booking.laytripBookingId",
                "booking.paymentGatewayProcessingFee",
                "booking.supplierId",
                "booking.nextInstalmentDate",
                "booking.supplierBookingId",
                "predictiveBookingData.id",
                "predictiveBookingData.bookingId",
                "predictiveBookingData.price",
                "predictiveBookingData.date",
                "booking.categoryName",
                "predictiveBookingData.isBelowMinimum",
                "predictiveBookingData.netPrice",
                "predictiveBookingData.remainSeat",
                "moduleData.name",
                "moduleData.id",
                "cart.laytripCartId",
            ])

            .where(
                `date(predictiveBookingData.created_date) = '${
                    todayDate.split(" ")[0]
                }' AND moduleData.id IN(:...id)  AND booking.booking_status In (${
                    BookingStatus.PENDING
                }) AND predictiveBookingData.is_resedule = false `,
                { id: [ModulesName.FLIGHT] }
            );

        const [data, count] = await query.getManyAndCount();
        // const count = await query.getCount();
        // if (!data.length) {
        // 	throw new NotFoundException(
        // 		`No booking found`
        // 	);
        // }
        return { data, count };
    }

    async getPendingBooking() {
        const date = new Date();
        var todayDate = date.toISOString();
        todayDate = todayDate
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "");
        let query = getManager()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect("booking.cart", "cart")
            .leftJoinAndSelect("booking.module", "moduleData")

            // .select([
            // 	"booking.supplierBookingId",
            // 	"booking.id"
            // ])
            .where(
                `"booking"."booking_type"= ${BookingType.INSTALMENT} AND "booking"."booking_status"= ${BookingStatus.PENDING} AND "booking"."module_id" IN(:...id)`,
                { id: [ModulesName.FLIGHT] }
            );

        return await query.getMany();
    }

    async getDailyPredictiveBookingPrices(bookingId) {
        //const {booking_id , below_minimum_seat} = filterOption
        const date = new Date();
        var todayDate = date.toISOString();
        todayDate = todayDate
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "");
        let query = getManager()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect("booking.cart", "cart")
            .leftJoinAndSelect(
                "booking.predictiveBookingData",
                "predictiveBookingData"
            )
            .select([
                "booking.laytripBookingId",
                "booking.id",
                "booking.categoryName",
                "predictiveBookingData.id",
                "predictiveBookingData.bookingId",
                "predictiveBookingData.price",
                "predictiveBookingData.date",
                "predictiveBookingData.isBelowMinimum",
                "predictiveBookingData.netPrice",
                "predictiveBookingData.remainSeat",
            ])

            .where(
                `booking.laytripBookingId = '${bookingId}' AND predictiveBookingData.isResedule = false`
            );

        const data = await query.getOne();
        // const count = await query.getCount();
        if (!data) {
            throw new NotFoundException(`Booking id not found`);
        }
        return data;
    }

    async exportCSV(filterOption: ExportBookingDto) {
        const {
            start_date,
            end_date,
            booking_status,
            booking_type,
            customer_name,
            payment_type,
            booking_id,
            search,
            module_id,
            supplier_id,
            userId,
            product_id,
            depature_date,
            booking_date,
            reservationId,
            booking_through,
            category_name,
            update_by,
            order_by_booking_date,
            order_by_cancelation_date,
            order_by_depature_date,status
        } = filterOption;

        let where;
        where = `1=1 `;
        if (userId) {
            where += `AND ("booking"."user_id" = '${userId}')`;
        }
        if (reservationId) {
            where += `AND ("booking"."reservation_id" = '${reservationId}')`;
        }
        if (module_id?.length) {
            if (typeof module_id != "object") {
                where += `AND ("booking"."module_id" =:module_id)`;
            } else {
                where += `AND ("booking"."module_id" in (:...module_id))`;
            }
        }

        if (status?.length) {
            if (typeof status != "object") {
                console.log(status);

                let w = await BookingStatusUtility.filterCondition(
                    parseInt(status),
                    "booking"
                );
                console.log(w);

                if (w) {
                    where += `AND (${w})`;
                }
            } else {
                console.log(status);
                let or = "";
                for await (const s of status) {
                    let w = await BookingStatusUtility.filterCondition(
                        s,
                        "booking"
                    );
                    if (w) {
                        or += `${or == "" ? "" : "or"}(${w})`;
                    }
                }
                if (or != "") {
                    where += `AND (${or})`;
                }
            }
        }


        if (category_name?.length) {
            if (typeof category_name != "object") {
                where += `AND ("booking"."category_name" =:category_name)`;
            } else {
                where += `AND ("booking"."category_name" in (:...category_name))`;
            }
        }

        if (supplier_id) {
            where += `AND ("booking"."supplier_id" = '${supplier_id}')`;
        }

        if (booking_date) {
            where += `AND (DATE("booking".booking_date) = '${booking_date}') `;
        }

        if (depature_date) {
            where += `AND (DATE("booking".check_in_date) = '${depature_date}') `;
        }

        if (start_date) {
            where += `AND (DATE("booking".booking_date) >= '${start_date}') `;
        }
        if (end_date) {
            where += `AND (DATE("booking".booking_date) <= '${end_date}') `;
        }
        if (booking_status?.length) {
            if (booking_status.length == 1) {
                where += `AND ("booking"."booking_status" =:booking_status)`;
            } else {
                where += `AND ("booking"."booking_status" in (:...booking_status))`;
            }
        }
        if (booking_type?.length) {
            if (typeof booking_type != "object") {
                where += `AND ("booking"."booking_type" =:booking_type)`;
            } else {
                where += `AND ("booking"."booking_type" in (:...booking_type))`;
            }
        }

        if (product_id) {
            where += `AND ("booking"."laytrip_booking_id" =  '${product_id}')`;
        }

        if (booking_id) {
            where += `AND ("cart"."laytrip_cart_id" =  '${booking_id}')`;
        }

        if (payment_type?.length) {
            if (typeof payment_type != "object") {
                where += `AND ("booking"."payment_type" =:payment_type)`;
            } else {
                where += `AND ("booking"."payment_type" in (:...payment_type))`;
            }
        }
        if (customer_name) {
            const cipher = await CryptoUtility.encode(search);
            where += `AND (("User"."first_name" = '${cipher}')or("User"."last_name" = '${cipher}'))`;
        }

        if (search) {
            const cipher = await CryptoUtility.encode(search);
            where += `AND (("User"."first_name" = '${cipher}'))or("User"."email" = '${cipher}'))or("User"."last_name" = '${cipher}')))`;
        }
        if (booking_through?.length) {
            if (typeof booking_through != "object") {
                where += `AND ("booking"."booking_through" =:booking_through)`;
            } else {
                where += `AND ("booking"."booking_through" in (:...booking_through))`;
            }
        }

        if (update_by?.length) {
            if (typeof update_by != "object") {
                where += `AND ("updateBy"."role_id" =:update_by)`;
            } else {
                where += `AND ("updateBy"."role_id" in (:...update_by))`;
            }
        }

        const query = getManager()
            .createQueryBuilder(Booking, "booking")
            .leftJoinAndSelect("booking.cart", "cart")
            .leftJoinAndSelect("booking.bookingInstalments", "instalments")
            .leftJoinAndSelect("booking.currency2", "currency")
            .leftJoinAndSelect("booking.user", "User")
            .leftJoinAndSelect("booking.travelers", "traveler")
            .leftJoinAndSelect("User.state", "state")
            .leftJoinAndSelect("User.country", "countries")
            // .leftJoinAndSelect("userData.state", "state")
            // .leftJoinAndSelect("userData.country", "countries")
            .leftJoinAndSelect("booking.supplier", "supplier")

            .where(where, {
                booking_type,
                booking_status,
                module_id,
                payment_type,
                booking_through,
                category_name,
                update_by,
            });
        //.orderBy(`booking.bookingDate`, "DESC");

        if (order_by_depature_date) {
            query.addOrderBy(
                `booking.checkInDate`,
                order_by_depature_date == "ASC" ? "ASC" : "DESC"
            );
        }
        if (order_by_booking_date) {
            query.addOrderBy(
                `booking.bookingDate`,
                order_by_booking_date == "ASC" ? "ASC" : "DESC"
            );
        }
        if (order_by_cancelation_date) {
            query.addOrderBy(
                `booking.updatedDate`,
                order_by_cancelation_date == "ASC" ? "ASC" : "DESC"
            );
        }
        const [data, count] = await query.getManyAndCount();
        //const count = await query.getCount();
        if (!data.length) {
            throw new NotFoundException(
                `No booking found&&&id&&&No booking found`
            );
        }
        return { data: data, total_count: count };
    }

    async getBookingId() {
        // var andWhere = {
        // 	isDeleted: false,
        // 	roleId: In(roles)
        // }
        const query = await getConnection()
            .createQueryBuilder(Booking, "booking")
            .orderBy(`booking.bookingDate`, "DESC")
            .select(["booking.laytripBookingId"])
            .getMany();
        if (!query.length) {
            throw new NotFoundException("no data found");
        }
        let responce = [];
        for await (const item of query) {
            if (item.laytripBookingId) {
                responce.push(item.laytripBookingId);
            }
        }
        return {
            data: responce,
        };
    }
}
