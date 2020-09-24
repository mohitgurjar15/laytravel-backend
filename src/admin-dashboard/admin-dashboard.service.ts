import { Injectable, NotFoundException } from "@nestjs/common";
import { getManager } from "typeorm";
import { Booking } from "src/entity/booking.entity";
import { DashboardFilterDto } from "./dto/dashboard-filter.dto";
import { Role } from "src/enum/role.enum";

@Injectable()
export class AdminDashboardService {
	async TotalRevanue(filterOption: DashboardFilterDto) {
		const { moduleId, startDate, toDate } = filterOption;
		var where = `1=1 AND ("booking"."booking_status" = 1)`;
		if (moduleId) {
			where += `AND ("booking"."module_id" = '${moduleId}')`;
		}

		if (startDate) {
			where += `AND (DATE("booking".booking_date) >= 's${startDate}') `;
		}

		if (toDate) {
			where += `AND (DATE("booking".booking_date) >= '${toDate}') `;
		}
		var data = await getManager().query(`
                SELECT count(id) as total_booking,
                SUM( total_amount * usd_factor) as total_amount,
                SUM( net_rate * usd_factor) as total_cost,
                SUM( markup_amount * usd_factor) as total_profit
                from booking where ${where}
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
		var tcount = totalCount[0].count ? totalCount[0].count : 0 ; 
		return {
			current_month_Count:mcount,
			current_week_count:wcount,
			total_count : tcount
		}
	}
}
