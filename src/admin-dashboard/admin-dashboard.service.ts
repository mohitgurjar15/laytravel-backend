import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { getManager } from "typeorm";
import { Booking } from "src/entity/booking.entity";
import { DashboardFilterDto } from "./dto/dashboard-filter.dto";
import { Role } from "src/enum/role.enum";
import { errorMessage } from "src/config/common.config";


@Injectable()
export class AdminDashboardService {
	async TotalRevanue(filterOption: DashboardFilterDto) {
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
                from booking 
            `);
		// var subdata = await getManager()
		// .query(`
		//     SELECT booking_status as status_code ,
		//     count(id) as total_booking,
		//     CASE
		//         WHEN booking_status = 0 THEN 'PENDING'
		//         WHEN booking_status = 1 THEN 'CONFIRM'
		//     END AS status,
		//     SUM( total_amount * usd_factor) as total_amount,
		//     SUM( net_rate * usd_factor) as total_cost,
		//     SUM( markup_amount * usd_factor) as total_profit
		//     from booking GROUP BY booking_status where ${where}
		// `);
		// data ['status_code_wise_revanue'] = subdata;

		// if(!data.length)
		// {
		//     throw new NotFoundException("Revanue not found")
		// }
		if (data[0].total_amount == null) {
			data[0].total_amount = 0;
			data[0].total_cost = 0;
			data[0].total_profit = 0;
		}
		data[0]['total_booking'] = totalBookings[0].total_booking

		return data[0];
	}

	async memberStaticsForGraph(filterOption: DashboardFilterDto) {
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
	}

	async memberStatics() {
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
	}


	async userCountOnCountry() {
		// let userCount = await getManager()
		// 	.createQueryBuilder(User, "user")
		// 	//.leftJoinAndSelect("user.createdBy2", "parentUser")
		// 	//.leftJoinAndSelect("user.state", "state")
		// 	.leftJoinAndSelect("user.country", "countries")
		// 	.select([
		// 		"count(user.userId)",
		// 		// "user.country_id",
		// 		"countries.name",

		// 	])
		// 	.groupBy("countries_id")
		// 	.getMany();

		try {
			const result = await getManager().query(
				`SELECT "countries"."name" AS "countries_name", "countries"."id" AS "countries_id", COUNT(DISTINCT("user"."user_id")) as "user_count" FROM "user" "user" LEFT JOIN "countries" "countries" ON "countries"."id"="user"."country_id" WHERE role_id In (${Role.FREE_USER},${Role.GUEST_USER},${Role.PAID_USER}) AND "country_id" > 0  GROUP BY countries_id`
			);
			return result;
		}
		catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No user Found.&&&id`);
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

			return { total_earned_points : earnedReword.sum ||  0 , total_redeem_points : redeemReword.sum || 0}
		}
		catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No user Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}

	}
}
