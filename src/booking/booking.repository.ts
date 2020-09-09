import { EntityRepository, Repository, getManager } from "typeorm";
import { Booking } from "src/entity/booking.entity";
import { ListBookingDto } from "./dto/list-booking.dto";
import { NotFoundException } from "@nestjs/common";
import { getBookingDetailsDto } from "./dto/get-booking-detail.dto";

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
		} = listBookingDto;
		const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;

		let where;
		where = `1=1 `;
		if (userId) {
			where += `AND ("booking"."user_id" = '${userId}')`;
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
		// if (payment_type) {
		// 	where += `("booking"."payment_type" = '${payment_type}') AND`;
		// }
		if (customer_name) {
			where += `AND (("User"."first_name" ILIKE '%${customer_name}%')or("User"."email" ILIKE '%${customer_name}%')or("User"."last_name" ILIKE '%${customer_name}%')or("User"."email" ILIKE '%${customer_name}%'))`;
		}
		const [data, count] = await getManager()
			.createQueryBuilder(Booking, "booking")
			.leftJoinAndSelect("booking.bookingInstalments", "bookingInstalments")
			.leftJoinAndSelect("booking.currency2", "currency")
			.leftJoinAndSelect("booking.user", "User")
			.where(where)
			.limit(take)
			.offset(skip)
			.getManyAndCount();

		if (!data.length) {
			throw new NotFoundException(`No booking exiest&&&id&&&No booking exiest`);
		}
		return { data: data, total_count: count };
	}

	async getBookingDetails(bookingId) {
		let bookingDetails = await getManager()
			.createQueryBuilder(Booking, "booking")
			.leftJoinAndSelect("booking.bookingInstalments", "bookingInstalments")
			.leftJoinAndSelect("booking.currency2", "currency")
			.leftJoinAndSelect("booking.user", "User")
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

		if (bookingDetails) {
			return bookingDetails;
		}
		return false;
	}

	async bookingDetail(bookingId:string) {
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
			throw new NotFoundException(`No booking exiest&&&id&&&No booking exiest`);
		}
		return data;
	}
}
