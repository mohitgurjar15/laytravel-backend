import { EntityRepository, Repository, getManager } from "typeorm";
import { Booking } from "src/entity/booking.entity";
import { ListBookingDto } from "./dto/list-booking.dto";
import { NotFoundException } from "@nestjs/common";
import { getBookingDetailsDto } from "./dto/get-booking-detail.dto";
import { ListPaymentDto } from "./dto/list-payment.dto";
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { User } from "src/entity/user.entity";

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
			module_id, supplier_id
		} = listBookingDto;
		const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;

		let where;
		where = `1=1 `;
		if (userId) {
			where += `AND ("booking"."user_id" = '${userId}')`;
		}
		if (module_id) {
			where += `AND ("booking"."module_id" = '${module_id}')`;
		}

		if (supplier_id) {
			where += `AND ("booking"."supplier_id" = '${supplier_id}')`;
		}

		if (start_date) {
			where += `AND (DATE("booking".booking_date) >= '${start_date}') `;
		}
		if (end_date) {
			where += `AND (DATE("booking".booking_date) <= '${end_date}') `;
		}
		if (booking_status) {
			where += `AND ("booking"."booking_status" = '${booking_status}')`;
		}
		if (booking_type) {
			where += `AND ("booking"."booking_type" = '${booking_type}')`;
		}

		if (booking_id) {
			where += `AND ("booking"."id" =  '${booking_id}')`;
		}

		// if (payment_type) {
		// 	where += `("booking"."payment_type" = '${payment_type}') AND`;
		// }
		if (customer_name) {
			where += `AND (("User"."first_name" ILIKE '%${customer_name}%')or("User"."last_name" ILIKE '%${customer_name}%'))`;
		}

		if (search) {
			where += `AND (("User"."first_name" ILIKE '%${search}%')or("User"."email" ILIKE '%${search}%')or("User"."last_name" ILIKE '%${search}%'))`;
		}
		const query = getManager()
			.createQueryBuilder(Booking, "booking")
			.leftJoinAndSelect("booking.bookingInstalments", "instalments")
			.leftJoinAndSelect("booking.currency2", "currency")
			.leftJoinAndSelect("booking.user", "User")
			.leftJoinAndSelect("booking.travelers", "traveler")
			.leftJoinAndSelect("traveler.userData", "userData")
			.leftJoinAndSelect("User.state", "state")
			.leftJoinAndSelect("User.country", "countries")
			// .leftJoinAndSelect("userData.state", "state")
			// .leftJoinAndSelect("userData.country", "countries")
			.leftJoinAndSelect("booking.supplier", "supplier")
			// .select(["booking.id",
			// 	"booking.userId",
			// 	"booking.moduleId",
			// 	"booking.bookingType",
			// 	"booking.bookingStatus",
			// 	"booking.currency",
			// 	"booking.totalAmount",
			// 	"booking.netRate",
			// 	"booking.markupAmount",
			// 	"booking.usdFactor",
			// 	"booking.bookingDate",
			// 	"booking.totalInstallments",
			// 	"booking.locationInfo",
			// 	"booking.moduleInfo",
			// 	"booking.paymentGatewayId",
			// 	"booking.paymentStatus",
			// 	"booking.paymentInfo",
			// 	"booking.isPredictive",
			// 	"booking.layCredit",
			// 	"booking.fareType",
			// 	"booking.isTicketd",
			// 	"booking.paymentGatewayProcessingFee",
			// 	"booking.supplierId",
			// 	"booking.nextInstalmentDate",
			// 	"booking.supplierBookingId",
			// 	"instalments.id",
			// 	"instalments.instalmentType",
			// 	"instalments.instalmentDate",
			// 	"instalments.currencyId",
			// 	"instalments.amount",
			// 	"instalments.instalmentStatus",
			// 	"instalments.paymentGatewayId",
			// 	"instalments.paymentInfo",
			// 	"instalments.paymentStatus",
			// 	// "bookingInstalments.instalment_date",
			// 	// "bookingInstalments.instalment_amount",
			// 	// "User.firstName",
			// 	// "User.lastName",
			// 	// "User.email",
			// 	// "User.phoneNo",
			// 	// "User.profilePic",
			// 	// "User.roleId",
			// 	"currency.id",
			// 	"currency.country",
			// 	"currency.code",
			// 	"currency.symbol",
			// 	"currency.liveRate",
			// 	"User.firstName",
			// 	"userData.lastName",
			// 	"userData.email",
			// 	"userData.phoneNo",
			// 	"userData.profilePic",
			// 	"userData.roleId",
			// 	"supplier.id",
			// 	"supplier.name",
			// 	"countries.name",
			// 	"countries.iso2",
			// 	"countries.iso3",
			// 	"countries.id",
			// 	"state.id",
			// 	"state.name",
			// 	"state.iso2",
			// ])

			.where(where)
			.take(take)
			.skip(skip)
			.orderBy(`booking.bookingDate`, 'DESC')
		const [data, count] = await query.getManyAndCount();
		//const count = await query.getCount();
		if (!data.length) {
			throw new NotFoundException(`No booking found&&&id&&&No booking found`);
		}
		return { data: data, total_count: count };
	}

	async getBookingDetails(bookingId) {
		let bookingDetails = await getManager()
			.createQueryBuilder(Booking, "booking")
			.leftJoinAndSelect("booking.bookingInstalments", "bookingInstalments")
			.leftJoinAndSelect("booking.currency2", "currency")
			.leftJoinAndSelect("booking.user", "User")
			.leftJoinAndSelect("booking.travelers", "traveler")
			.leftJoinAndSelect("traveler.userData", "userData")
			/* .select([
			"user.userId","user.title",
			"user.firstName","user.lastName","user.email",
			"user.countryCode","user.phoneNo","user.zipCode",
			"user.gender","user.dob","user.passportNumber",
			"user.passportExpiry",
			"countries.name","countries.iso2","countries.iso3","countries.id",
		]) */
			.where('"booking"."id"=:bookingId', { bookingId })
			.getOne();

		return bookingDetails;
	}

	async bookingDetail(bookingId: string) {
		//const { bookingId } = getBookingDetailsDto;

		const where = `"booking"."id" = '${bookingId}'`;
		const data = await getManager()
			.createQueryBuilder(Booking, "booking")
			.leftJoinAndSelect("booking.bookingInstalments", "instalments")
			.leftJoinAndSelect("booking.currency2", "currency")
			.leftJoinAndSelect("booking.user", "User")
			.leftJoinAndSelect("booking.travelers", "traveler")
			.leftJoinAndSelect("traveler.userData", "userData")
			.leftJoinAndSelect("User.state", "state")
			.leftJoinAndSelect("User.country", "countries")
			.leftJoinAndSelect("booking.supplier", "supplier")
			.where(where)
			.getOne();

		if (!data) {
			throw new NotFoundException(`No booking found&&&id&&&No booking found`);
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
			module_id
		} = listPaymentDto;

		const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;

		let query = getManager()
			.createQueryBuilder(Booking, "booking")
			.leftJoinAndSelect("booking.bookingInstalments", "BookingInstalments")
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
				"booking.id",
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
			])
			.take(take)
			.skip(skip)
			.where(`"User"."user_id" =:userId`, { userId: user.userId })
		//.orderBy("BookingInstalments.id", 'DESC')

		if (booking_id)
			query = query.andWhere(`"booking"."id"=:booking_id`, { booking_id });
		if (booking_type)
			query = query.andWhere(`"booking"."booking_type"=:booking_type`, {
				booking_type,
			});

		if (module_id)
			query = query.andWhere(`"booking"."module_id"=:module_id`, {
				module_id,
			});
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
			query = query.andWhere(`"BookingInstalments"."instalment_type" =:instalment_type`, { instalment_type });
		}

		const [result, count] = await query.getManyAndCount();
		//const count = await query.getCount();
		return { data: result, total_result: count };
	}


	async listPayment(where: string, limit: number, page_no: number) {
		const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;

		let query = getManager()
			.createQueryBuilder(BookingInstalments, "BookingInstalments")
			.leftJoinAndSelect("BookingInstalments.booking", "booking")
			.leftJoinAndSelect("booking.bookingInstalments", "installment")
			.leftJoinAndSelect("BookingInstalments.currency", "currency")
			.leftJoinAndSelect("BookingInstalments.user", "User")
			.leftJoinAndSelect("BookingInstalments.module", "moduleData")
			// .leftJoinAndSelect("BookingInstalments.supplier", "supplier")
			// .leftJoinAndSelect(
			// 	"BookingInstalments.failedPaymentAttempts",
			// 	"failedPaymentAttempts"
			// )
			.select([
				"BookingInstalments.id",
				"BookingInstalments.bookingId",
				"BookingInstalments.userId",
				"BookingInstalments.moduleId",
				"BookingInstalments.supplierId",
				"BookingInstalments.instalmentType",
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
			.take(take)
			.skip(skip)
			.orderBy("BookingInstalments.id", 'DESC')
		const [data, count] = await query.getManyAndCount();
		// const count = await query.getCount();
		if (!data.length) {
			throw new NotFoundException(
				`Payment record not found&&&id&&&Payment record not found`
			);
		}
		return { data: data, total_count: count };
	}
}
