import { EntityRepository, Repository, getManager } from "typeorm";
import { Booking } from "src/entity/booking.entity";
import { ListBookingDto } from "./dto/list-booking.dto";
import { NotFoundException } from "@nestjs/common";
import { getBookingDetailsDto } from "./dto/get-booking-detail.dto";
import { ListPaymentDto } from "./dto/list-payment.dto";
import { BookingInstalments } from "src/entity/booking-instalments.entity";

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
			module_id
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
			.leftJoinAndSelect("booking.bookingInstalments", "bookingInstalments")
			.leftJoinAndSelect("booking.currency2", "currency")
			.leftJoinAndSelect("booking.user", "User")
			.leftJoinAndSelect("booking.travelers", "traveler")
			.leftJoinAndSelect("traveler.userData", "userData")
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
			// 	// "bookingInstalments.instalment_date",
			// 	// "bookingInstalments.instalment_amount",
			// 	"User.firstName",
			// 	"User.lastName",
			// 	"User.email",
			// 	"User.phoneNo",
			// 	"User.profilePic",
			// 	"User.roleId",
			// 	"currency.id",
			// 	"currency.country",
			// 	"currency.code",
			// 	"currency.symbol",
			// 	"currency.liveRate",
			// 	"userData.firstName",
			// 	"userData.lastName",
			// 	"userData.email",
			// 	"userData.phoneNo",
			// 	"userData.profilePic",
			// 	"userData.roleId"])
			.where(where)
			.take(take)
			.offset(skip)
			//.orderBy(`booking.bookingDate`, 'DESC')
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
			.leftJoinAndSelect("booking.bookingInstalments", "bookingInstalments")
			.leftJoinAndSelect("booking.currency2", "currency")
			.leftJoinAndSelect("booking.user", "User")
			.where(where)
			.getOne();

		if (!data) {
			throw new NotFoundException(`No booking found&&&id&&&No booking found`);
		}
		return data;
	}

	async getPayments(user, listPaymentDto: ListPaymentDto) {
		const {
			page_no,
			limit,
			booking_id,
			payment_end_date,
			booking_type,
			payment_start_date,
		} = listPaymentDto;

		const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;

		let query = getManager()
			.createQueryBuilder(Booking, "booking")
			.leftJoinAndSelect("booking.bookingInstalments", "bookingInstalments")
			.leftJoinAndSelect("booking.currency2", "currency")
			.leftJoinAndSelect("booking.user", "User")
			.leftJoinAndSelect("booking.module", "module")
			// .leftJoinAndSelect("booking.travelers", "traveler")
			// .leftJoinAndSelect("traveler.userData", "User")
			.select([
				"booking.id",
				"booking.moduleId",
				"booking.bookingStatus",
				"booking.totalAmount",
				"booking.bookingDate",
				"booking.totalInstallments",
				"booking.nextInstalmentDate",
				"bookingInstalments.instalmentType",
				"bookingInstalments.instalmentDate",
				"bookingInstalments.amount",
				"bookingInstalments.instalmentStatus",
				"currency.code",
				"currency.symbol",
				"module.name",
			])
			.where(
				`"booking"."booking_type"=:bookingType and "booking"."user_id"=:userId`,
				{ bookingType: 1, userId: user.userId }
			)
			.offset(skip)
			.take(take);

		if (booking_id)
			query = query.andWhere(`"booking"."id"=:booking_id`, { booking_id });
		if (booking_type)
			query = query.andWhere(`"booking"."module_id"=:booking_type`, {
				booking_type,
			});
		if (payment_start_date && payment_end_date) {
			query = query.andWhere(
				`"bookingInstalments"."instalment_date" >=:payment_start_date and "bookingInstalments"."instalment_date" <=:payment_end_date`,
				{ payment_start_date, payment_end_date }
			);
		} else if (payment_start_date) {
			query = query.andWhere(
				`"bookingInstalments"."instalment_date"=:payment_start_date`,
				{ payment_start_date }
			);
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
			.leftJoinAndSelect("BookingInstalments.currency", "currency")
			.leftJoinAndSelect("BookingInstalments.user", "User")
			.leftJoinAndSelect("BookingInstalments.module", "moduleData")
			.leftJoinAndSelect("BookingInstalments.supplier", "supplier")
			.leftJoinAndSelect(
				"BookingInstalments.failedPaymentAttempts",
				"failedPaymentAttempts"
			)
			// .select([
			// 	"booking.id",
			// 	"booking.moduleId",
			// 	"booking.bookingStatus",
			// 	"booking.totalAmount",
			// 	"booking.bookingDate",
			// 	"booking.totalInstallments",
			// 	"booking.nextInstalmentDate",
			// 	"bookingInstalments.instalmentType",
			// 	"bookingInstalments.instalmentDate",
			// 	"bookingInstalments.amount",
			// 	"bookingInstalments.instalmentStatus",
			// 	"currency.code",
			// 	"currency.symbol",
			// 	"moduleData.name",
			// ])

			.where(where)
			.take(take)
			.offset(skip);

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
