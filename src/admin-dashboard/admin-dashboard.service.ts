import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { getManager } from "typeorm";
import { DashboardFilterDto } from "./dto/dashboard-filter.dto";
import { Role } from "src/enum/role.enum";
import { errorMessage } from "src/config/common.config";
import { BookingStatus } from "src/enum/booking-status.enum";
import { PaymentStatus } from "src/enum/payment-status.enum";


@Injectable()
export class AdminDashboardService {
	async TotalRevanue(filterOption: DashboardFilterDto) {
		try {
			const { moduleId, startDate, toDate } = filterOption;
			var where = `1=1 AND ("booking"."booking_status" = 1)`;
			if (moduleId) {
				where += `AND ("booking"."module_id" = '${moduleId}')`;
			}

			if (startDate) {
				where += `AND (DATE("booking".booking_date) >= '${startDate}') `;
			}

			if (toDate) {
				where += `AND (DATE("booking".booking_date) >= '${toDate}') `;
			}
			var data = await getManager().query(`
                SELECT count(id) as confirm_booking,
                SUM( total_amount * usd_factor) as total_amount,
                SUM( net_rate * usd_factor) as total_cost,
                SUM( markup_amount * usd_factor) as total_profit
                from booking where ${where}
            `);


			var totalBookings = await getManager().query(`
                SELECT count(id) as total_booking
                from booking ${moduleId ? `WHERE "module_id" = '${moduleId}'` : ''}
            `);
			if (data[0].total_amount == null) {
				data[0].total_amount = 0;
				data[0].total_cost = 0;
				data[0].total_profit = 0;
			}
			data[0]['total_booking'] = totalBookings[0].total_booking

			return data[0];
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
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async memberStaticsForGraph(filterOption: DashboardFilterDto) {
		try {
			var d = new Date();
			var n = d.getDate();

			var fromDate = new Date();
			fromDate.setDate(fromDate.getDate() - n);
			var monthDate = fromDate.toISOString();
			monthDate = monthDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			var tDate = new Date();

			var todayDate = tDate.toISOString();
			todayDate = todayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");

			const { moduleId, startDate, toDate } = filterOption;
			var where = `role_id In (${Role.FREE_USER},${Role.PAID_USER} ) `;
			if (startDate) {
				where += `AND (DATE(created_date) >= '${startDate}') `;
			} else {
				where += `AND (DATE(created_date) >= '${monthDate}') `;
			}

			if (toDate) {
				where += `AND (DATE(created_date) >= '${toDate}') `;
			} else {
				where += `AND (DATE(created_date) >= '${todayDate}') `;
			}

			const result = await getManager().query(
				`SELECT DATE("created_date"),
            COUNT(DISTINCT("User"."user_id")) as "count" 
            FROM "user" "User" 
            where ${where} 
            GROUP BY DATE("created_date")
        `
			);
			return result;
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
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async memberStatics() {
		try {
			var d = new Date();
			var n = d.getDate();

			var fromDate = new Date();
			fromDate.setDate(fromDate.getDate() - n);
			var monthDate = fromDate.toISOString();
			monthDate = monthDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");

			var tDate = new Date();

			var todayDate = tDate.toISOString();
			todayDate = todayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");

			var date = new Date();
			var fdate = date.toLocaleString("en-US", {
				weekday: "long",
			});
			var weekday = new Array(7);
			weekday[1] = "Monday";
			weekday[2] = "Tuesday";
			weekday[3] = "Wednesday";
			weekday[4] = "Thursday";
			weekday[5] = "Friday";
			weekday[6] = "Saturday";
			weekday[7] = "Sunday";
			var day = weekday.indexOf(fdate);
			var fromDate = new Date();
			fromDate.setDate(fromDate.getDate() - day);
			var mondayDate = fromDate.toISOString();
			mondayDate = mondayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			const monthlyCount = await getManager().query(
				`SELECT 
                COUNT(DISTINCT("User"."user_id")) as "count" 
                FROM "user" "User" 
				where 
					role_id In (${Role.FREE_USER},${Role.PAID_USER} ) 
					AND (DATE(created_date) >= '${monthDate}')
					AND (DATE(created_date) >= '${todayDate}')
			`
			);

			const weeklyCount = await getManager().query(
				`SELECT
				COUNT(DISTINCT("User"."user_id")) as "count" 
				FROM "user" "User" 
				where 
					role_id In (${Role.FREE_USER},${Role.PAID_USER} )
					AND (DATE(created_date) >= '${mondayDate}')
					AND (DATE(created_date) >= '${todayDate}')
			`
			);

			const totalCount = await getManager().query(
				`SELECT
				COUNT(DISTINCT("User"."user_id")) as "count" 
				FROM "user" "User" 
				where 
					role_id In (${Role.FREE_USER},${Role.PAID_USER} )
			`
			);

			var mcount = monthlyCount[0].count ? monthlyCount[0].count : 0;
			var wcount = weeklyCount[0].count ? weeklyCount[0].count : 0;
			var tcount = totalCount[0].count ? totalCount[0].count : 0;
			return {
				current_month_Count: mcount,
				current_week_count: wcount,
				total_count: tcount
			}
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
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}


	async userCountOnCountry() {


		try {
			const result = await getManager().query(
				`SELECT "countries"."iso2" AS "country_sort_code","countries"."iso3" AS "countries_code","countries"."name" AS "countries_name", "countries"."id" AS "countries_id", COUNT(DISTINCT("user"."user_id")) as "user_count" FROM "user" "user" RIGHT JOIN "countries" "countries" ON "countries"."id"="user"."country_id" WHERE role_id In (${Role.FREE_USER},${Role.GUEST_USER},${Role.PAID_USER}) AND "country_id" > 0  GROUP BY countries_id`
			);
			return result;
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
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}



	async laytripCreditStates(filterOption: DashboardFilterDto) {
		const { moduleId, startDate, toDate } = filterOption
		try {
			var earned_where = `status = 1`;
			var redeem_where = `status = 1`
			// if (moduleId) {
			// 	earned_where += `AND `
			// }

			if (startDate) {
				earned_where += `AND (DATE(earn_date) >= '${startDate}')`;
				redeem_where += `AND (DATE(redeem_date) >= '${startDate}')`;
			}

			if (toDate) {
				earned_where += `AND (DATE(earn_date) <= '${toDate}')`;
				redeem_where += `AND (DATE(redeem_date) <= '${toDate}')`;
			}
			let [earnedReword] = await getManager()
				.query(`SELECT sum("points") FROM "lay_credit_earn" WHERE ${earned_where}  `);

			let [redeemReword] = await getManager()
				.query(`SELECT sum("points") FROM "lay_credit_redeem" WHERE ${redeem_where}`)

			//const points = earnedReword.sum - redeemReword.sum;

			return { total_earned_points: earnedReword.sum || 0, total_redeem_points: redeemReword.sum || 0 }
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
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async bookingStatistics() {
		try {
			var tDate = new Date();
			var todayDate = tDate.toISOString();
			todayDate = todayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			todayDate = todayDate.split(' ')[0]
			
			let response = {}

			// complited trips :- complite bookings 
			const completedTrips = await getManager().query(
				`SELECT  sum ("total_amount") as 'total', count(*) as "cnt"
				FROM "booking" WHERE check_in_date < '${todayDate}' AND booking_status = ${BookingStatus.CONFIRM}`
			);
			response['completed_trips'] = completedTrips.cnt

			// open bookings
			const openBookings = await getManager().query(
				`SELECT count(*) as "cnt" FROM "booking" WHERE check_in_date > '${todayDate}' booking_status IN (${BookingStatus.PENDING},${BookingStatus.CONFIRM})`
			);
			response['open_bookings'] = openBookings.cnt

			const ToBePaidByTheCustomer = await getManager().query(
				`SELECT sum("booking"."usd_factor"*"booking_instalments"."amount") as "total"
				FROM booking
				INNER JOIN booking_instalments
				ON booking.id = booking_instalments.booking_id WHERE "booking_instalments"."instalment_status" = ${PaymentStatus.PENDING} AND "booking"."booking_status" IN (${BookingStatus.CONFIRM},${BookingStatus.PENDING})`
			);
			response['to_be_paid_by_the_customer'] = ToBePaidByTheCustomer.total
			
		
			return response;
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
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}
}
