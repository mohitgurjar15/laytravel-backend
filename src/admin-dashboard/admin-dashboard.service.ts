import { Injectable, NotFoundException } from "@nestjs/common";
import { getManager } from "typeorm";
import { Booking } from "src/entity/booking.entity";
import { DashboardFilterDto } from "./dto/dashboard-filter.dto";
import { Role } from "src/enum/role.enum";

@Injectable()
export class AdminDashboardService {
	async TotalRevanue(filterOption : DashboardFilterDto) {

        const {moduleId , startDate , toDate } = filterOption
        var where = `1=1 AND ("booking"."booking_status" = 1)`
        if(moduleId)
        {
            where += `AND ("booking"."module_id" = '${moduleId}')`;
        }

        if(startDate)
        {
            where += `AND (DATE("booking".booking_date) >= 's${startDate}') `;
        }

        if(toDate)
        {
            where += `AND (DATE("booking".booking_date) >= '${toDate}') `;
        }
		var data = await getManager()
            .query(`
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
        if(data[0].total_amount == null)
        {
            data[0].total_amount = 0
            data[0].total_cost = 0
            data[0].total_profit = 0
        }



		return data[0];
    }
    
    async memberStaticsForGraph (filterOption : DashboardFilterDto) {

			var fromDate = new Date();
			fromDate.setDate(fromDate.getDate() - 30);
			var monthDate = fromDate.toISOString();
			 monthDate = monthDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");
			var tDate = new Date();

			var todayDate = tDate.toISOString();
			todayDate = todayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");

        const {moduleId , startDate , toDate } = filterOption
        var where = `role_id In (${Role.FREE_USER},${Role.PAID_USER})`
        if(moduleId)
        {
            where += `AND ("booking"."module_id" = '${moduleId}')`;
        }

        if(startDate)
        {
            where += `AND (DATE(created_date) >= 's${startDate}') `;
        }
        else{
            where += `AND (DATE(created_date) >= 's${monthDate}') `;
        }

        if(toDate)
        {
            where += `AND (DATE(created_date) >= '${toDate}') `;
        }
        else
        {
            where += `AND (DATE(created_date) >= '${todayDate}') `;
        }

        const result = await getManager().query(
            `SELECT DATE("created_date"),
            COUNT(DISTINCT("User"."user_id")) as "count" 
            FROM "user" "User" 
            HAVING ${where}
            GROUP BY DATE("created_date")
        `);
        return result;
    }    

}
