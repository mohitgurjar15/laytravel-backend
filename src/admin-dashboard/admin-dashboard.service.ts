import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { getConnection, getManager } from "typeorm";
import { DashboardFilterDto } from "./dto/dashboard-filter.dto";
import { Role } from "src/enum/role.enum";
import { errorMessage } from "src/config/common.config";
import { BookingStatus } from "src/enum/booking-status.enum";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { BookingType } from "src/enum/booking-type.enum";

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
      var data = await getConnection().query(`
                SELECT count(id) as confirm_booking,
                SUM( total_amount * usd_factor) as total_amount,
                SUM( net_rate * usd_factor) as total_cost,
                SUM( markup_amount * usd_factor) as total_profit
                from booking where ${where}
            `);

      var totalBookings = await getConnection().query(`
                SELECT count(id) as total_booking
                from booking ${moduleId ? `WHERE "module_id" = '${moduleId}'` : ""
        }
            `);
      if (data[0].total_amount == null) {
        data[0].total_amount = 0;
        data[0].total_cost = 0;
        data[0].total_profit = 0;
      }
      data[0]["total_booking"] = totalBookings[0].total_booking;

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

      const result = await getConnection().query(
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
        weekday: "long"
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
      const monthlyCount = await getConnection().query(
        `SELECT 
                COUNT(DISTINCT("User"."user_id")) as "count" 
                FROM "user" "User" 
				where 
					role_id In (${Role.FREE_USER},${Role.PAID_USER} ) 
					AND (DATE(created_date) >= '${monthDate}')
					AND (DATE(created_date) >= '${todayDate}')
			`
      );

      const weeklyCount = await getConnection().query(
        `SELECT
				COUNT(DISTINCT("User"."user_id")) as "count" 
				FROM "user" "User" 
				where 
					role_id In (${Role.FREE_USER},${Role.PAID_USER} )
					AND (DATE(created_date) >= '${mondayDate}')
					AND (DATE(created_date) >= '${todayDate}')
			`
      );

      const totalCount = await getConnection().query(
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
      };
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
      const result = await getConnection().query(
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
    const { moduleId, startDate, toDate } = filterOption;
    try {
      var earned_where = `status = 1`;
      var redeem_where = `status = 1`;
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
      let [earnedReword] = await getConnection().query(
        `SELECT sum("points") FROM "lay_credit_earn" WHERE ${earned_where}  `
      );

      let [redeemReword] = await getConnection().query(
        `SELECT sum("points") FROM "lay_credit_redeem" WHERE ${redeem_where}`
      );

      //const points = earnedReword.sum - redeemReword.sum;

      return {
        total_earned_points: earnedReword.sum || 0,
        total_redeem_points: redeemReword.sum || 0
      };
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

  async bookingStatistics(filterOption: DashboardFilterDto) {
    try {
      const { moduleId, startDate, toDate } = filterOption;
      var tDate = new Date();
      var todayDate = tDate.toISOString();
      todayDate = todayDate
        .replace(/T/, " ") // replace T with a space
        .replace(/\..+/, "");
      todayDate = todayDate.split(" ")[0];

      var response = {};

      let moduleIdCondition = "1=1";
      if (moduleId) {
        moduleIdCondition = `"booking"."module_id" = ${moduleId}`;
      }

      let dateConditon = `1=1`;
      if (startDate) {
        dateConditon += `AND DATE ("booking"."booking_date") >= DATE('${startDate}')`;
      }
      if (toDate) {
        dateConditon += `AND DATE ("booking"."booking_date") <= DATE('${toDate}')`;
      }
      // complited trips :- complite bookings
      const completedTrips = await getConnection().query(
        `SELECT  count(*) as "cnt"
				FROM "booking" WHERE check_in_date < '${todayDate}' AND booking_status = ${BookingStatus.CONFIRM} AND ${moduleIdCondition} AND ${dateConditon}`
      );

      response["completed_trips"] = completedTrips[0].cnt;

      const completedTripsUsd = await getConnection().query(`SELECT  sum(total_amount) as "total"
      FROM "booking" WHERE check_in_date < '${todayDate}' AND booking_status = ${BookingStatus.CONFIRM} AND ${moduleIdCondition} AND ${dateConditon}`);

      response["completed_trips_usd"] = (Math.round(completedTripsUsd[0].total * 100) / 100).toFixed(2) || 0;


      // open bookings
      const openBookings = await getConnection().query(
        `SELECT count(*) as "cnt" FROM "booking" WHERE check_in_date > '${todayDate}' AND booking_status IN (${BookingStatus.PENDING},${BookingStatus.CONFIRM}) AND ${moduleIdCondition} AND ${dateConditon}`
      );
      response["open_bookings"] = openBookings[0].cnt;

      const openBookingsUsd = await getConnection().query(
        `SELECT sum("booking"."usd_factor"*"total_amount") as "total"  FROM "booking" WHERE booking_status IN (${BookingStatus.PENDING},${BookingStatus.CONFIRM}) AND ${moduleIdCondition} AND ${dateConditon}`
      );
      response["open_bookings_usd"] = (Math.round(openBookingsUsd[0].total * 100) / 100).toFixed(2) || 0;

      const ToBePaidByTheCustomer = await getConnection().query(
        `SELECT sum("booking_instalments"."amount") as "total" 
				FROM booking
				INNER JOIN booking_instalments
				ON booking.id = booking_instalments.booking_id WHERE "booking_instalments"."instalment_status" = ${PaymentStatus.PENDING} AND "booking"."booking_status" IN (${BookingStatus.CONFIRM},${BookingStatus.PENDING})
				AND ${moduleIdCondition} AND ${dateConditon}`
      );
      response["to_be_paid_by_the_customer"] =
        ToBePaidByTheCustomer[0].total || 0;

      const paidByTheCustomer = await getConnection().query(
        `SELECT sum("booking"."usd_factor"/"booking_instalments"."amount") as "total" 
				FROM booking
				INNER JOIN booking_instalments
				ON booking.id = booking_instalments.booking_id WHERE "booking_instalments"."instalment_status" = ${PaymentStatus.CONFIRM} AND "booking"."booking_status" IN (${BookingStatus.CONFIRM},${BookingStatus.PENDING})
				AND ${moduleIdCondition} AND ${dateConditon}`
      );
      //response["paid_by_the_customer"] = paidByTheCustomer[0].total

      const uncoveredPreBookings = await getConnection().query(
        `SELECT count(*) as "cnt" FROM "booking" WHERE booking_status = ${BookingStatus.PENDING} AND ${moduleIdCondition} AND ${dateConditon}`
      );
      response["uncovered_Pre_Bookings"] = uncoveredPreBookings[0].cnt || 0;

      const uncoveredPreBookingsUsd = await getConnection().query(
        `SELECT  SUM( total_amount * usd_factor) as total_amount FROM "booking" WHERE booking_status = ${BookingStatus.PENDING} AND ${moduleIdCondition} AND ${dateConditon}`
      );
      response["uncovered_Pre_Bookings_Usd"] = (Math.round(uncoveredPreBookingsUsd[0].total_amount * 100) / 100).toFixed(2) || 0;

      var revenues = await getConnection().query(`
                SELECT count(id) as confirm_booking,
                SUM( total_amount * usd_factor) as total_amount,
                SUM( net_rate * usd_factor) as total_cost,
                SUM( markup_amount ) as total_profit
                from booking where  booking_status = ${BookingStatus.CONFIRM} AND ${moduleIdCondition} AND ${dateConditon}
			`);

      response["revenues"] = revenues[0].total_profit || 0;

      var revenueInstallment = await getConnection().query(`
      SELECT count(id) as confirm_booking,
      SUM( total_amount * usd_factor) as total_amount,
      SUM( net_rate * usd_factor) as total_cost,
      SUM( markup_amount * usd_factor) as total_profit
      from booking where booking_type = ${BookingType.INSTALMENT} AND booking_status = ${BookingStatus.CONFIRM} AND ${moduleIdCondition} AND ${dateConditon}`);

      var revenueNoInstallment = await getConnection().query(`
      SELECT count(id) as confirm_booking,
      SUM( total_amount * usd_factor) as total_amount,
      SUM( net_rate * usd_factor) as total_cost,
      SUM( markup_amount * usd_factor) as total_profit
      from booking where booking_type = ${BookingType.NOINSTALMENT} AND booking_status = ${BookingStatus.CONFIRM} AND ${moduleIdCondition} AND ${dateConditon}`);

      var revenueFromNoInstallment = revenues[0].total_profit - revenueInstallment[0].total_profit;
      response["revenue_from_full_price"] = (Math.round(revenueFromNoInstallment * 100) / 100).toFixed(2);

      var revenueFromInstallment = revenues[0].total_profit - revenueNoInstallment[0].total_profit;
      response["revenue_from_installment"] = (Math.round(revenueFromInstallment * 100) / 100).toFixed(2);

      var revenueFromNoInstallmentPercent = revenueFromNoInstallment * 100 / revenues[0].total_profit
      response["revenue_from_full_price_percentage"] = (Math.round(revenueFromNoInstallmentPercent * 100) / 100).toFixed(2);

      var revenueFromInstallmentPercent = revenueFromInstallment * 100 / revenues[0].total_profit
      response["revenue_from_installment_percentage"] = (Math.round(revenueFromInstallmentPercent * 100) / 100).toFixed(2);

      var installmentBookingQty = await getConnection().query(`
      SELECT count(id) as confirm_booking
      from booking where  booking_type = ${BookingType.INSTALMENT} AND ${moduleIdCondition} AND ${dateConditon}`);
      response["booking_with_installment_qty"] = installmentBookingQty[0].confirm_booking || 0;

      var noInstallmentBookingQty = await getConnection().query(`
      SELECT count(id) as confirm_booking
      from booking where booking_type = ${BookingType.NOINSTALMENT}  AND ${moduleIdCondition} AND ${dateConditon}`);
      response["booking_with_no_installment_qty"] = noInstallmentBookingQty[0].confirm_booking || 0;

      var valueOfBooking = await getConnection().query(`
                SELECT  SUM( total_amount * usd_factor) as total_amount from booking where ${moduleIdCondition} AND ${dateConditon}
			`);

      response["value_of_bookings"] = valueOfBooking[0].total_amount || 0;

      var valueOfBooking = await getConnection().query(`
      SELECT  SUM( total_amount * usd_factor) as total_amount from booking where ${moduleIdCondition} AND ${dateConditon}
`);

      response["value_of_bookings"] = valueOfBooking[0].total_amount || 0;

      var valueOfBookingQty = await getConnection().query(`
      SELECT  count(id) as cnt from booking where ${moduleIdCondition} AND ${dateConditon}
      `);

      response["value_of_bookings_qyt"] = valueOfBookingQty[0].cnt || 0;

      var paidbyCustomerFullPayment = await getConnection().query(`
                SELECT  SUM( total_amount / usd_factor) as total_amount from booking where "booking"."booking_type" = ${BookingType.NOINSTALMENT} AND "booking"."booking_status" = ${BookingStatus.CONFIRM} AND "booking"."payment_status" = ${PaymentStatus.CONFIRM}
			`);

      var paidbyCustomerPoint = await getConnection().query(`
                SELECT  SUM( lay_credit) as total_point from booking where "booking"."booking_type" = ${BookingType.NOINSTALMENT} AND "booking"."booking_status" In (${BookingStatus.CONFIRM},${BookingStatus.PENDING})  
			`);
      var paidbyCustomerpartialPoint = await getConnection().query(`
      select sum(amount) as total_amount from booking_instalments where payment_status = ${PaymentStatus.CONFIRM}  
			`);
      response["paid_by_customer"] =
        parseFloat(paidbyCustomerpartialPoint[0].total_amount) +
        parseFloat(paidbyCustomerFullPayment[0].total_amount) +
        parseFloat(paidbyCustomerPoint[0].total_point) || 0;

      var totalBooking = await getConnection().query(`
                SELECT  count(id) as cnt from booking where ${moduleIdCondition} AND ${dateConditon}  
			`);
      response["total_booking"] = totalBooking[0].cnt;

      const FullyPaidByLayTrip = await getConnection().query(`
			SELECT SUM("booking"."usd_factor"/"booking_instalments"."amount") as "total" 
				FROM booking
				INNER JOIN booking_instalments
				ON booking.id = booking_instalments.booking_id WHERE "booking_instalments"."instalment_status" = ${PaymentStatus.PENDING} AND "booking"."booking_type" = ${BookingType.INSTALMENT} AND "booking"."booking_status" = ${BookingStatus.CONFIRM} 
				AND ${moduleIdCondition} AND ${dateConditon}
			`);
      response["fully_paid_by_laytrip"] =
        (Math.round(FullyPaidByLayTrip[0].total * 100) / 100).toFixed(2) || 0;

      const custCredAtRisk = await getConnection()
        .query(`SELECT sum("booking"."usd_factor"/"booking_instalments"."amount") as "total" 
	             	FROM booking_instalments
		            INNER JOIN booking
		            ON booking.id = booking_instalments.booking_id WHERE "booking_instalments"."instalment_status" = ${PaymentStatus.PENDING} AND "booking"."booking_status" = ${BookingStatus.CONFIRM} 
		            AND ${moduleIdCondition} AND ${dateConditon}`);

      response["customer_credit_at_risk"] =
        (Math.round(custCredAtRisk[0].total * 100) / 100).toFixed(2) || 0;

      const grossSales = await getConnection().query(`
        SELECT sum("booking"."total_amount"/"booking"."usd_factor") as "total_amount" 
        FROM booking where "booking"."booking_status" In (${BookingStatus.CONFIRM},${BookingStatus.PENDING}) 
        AND ${moduleIdCondition} AND ${dateConditon}`
      );
      response["gross_sales"] =
        (Math.round(grossSales[0].total_amount * 100) / 100).toFixed(2) || 0;

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

  async customerStatistics(filterOption: DashboardFilterDto) {
    var response = {};
    const userConditon = `role_id In (${Role.FREE_USER},${Role.PAID_USER}) AND is_deleted = false `;

    const userDoneBooking90Days = await getConnection().query(
      `SELECT count(*) as cnt  FROM "user" "User" WHERE DATE_PART('day',(select booking_date from booking where booking.user_id = "User"."user_id" AND ${userConditon} order by booking_date limit 1) - created_date ) < 90`
    );
    response["user_done_booking_90_days"] = userDoneBooking90Days[0].cnt;

    const userDoneBookingAfter90Days = await getConnection().query(
      ` SELECT  count(*) as "cnt" FROM "user" "User" where ${userConditon}`
    );
    response["user_done_booking_after_90_days"] =
      userDoneBookingAfter90Days[0].cnt - userDoneBooking90Days[0].cnt;

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

    const result = await getConnection().query(
      `SELECT
		COUNT(DISTINCT("User"."user_id")) as "count" 
		FROM "user" "User" 
		where ${where} 
	`
    );
    response["new_user"] = result[0].count;

    const totalInitialBookings = await getConnection().query(
      `SELECT
		user_id, COUNT(*)
	    FROM
		booking
	    GROUP BY
		user_id
	    HAVING 
		COUNT(*) < 2`
    );
    response["total_initial_bookings"] = totalInitialBookings.length;

    const totalRepeatBookings = await getConnection().query(
      `SELECT
		  user_id, COUNT(*)
		  FROM
		  booking
		  GROUP BY
		  user_id
		  HAVING 
		  COUNT(*) > 1`
    );
    response["total_repeat_bookings"] = totalRepeatBookings.length;

    const totalTicketsBooked = await getConnection().query(`
    SELECT  count(*) as "cnt" FROM booking`);
    response["total_ticket_booked"] = totalTicketsBooked[0].cnt;

    var sumOfTotalAmount = await getConnection().query(`
    SELECT sum("booking"."total_amount"/"booking"."usd_factor") as "total_amount" 
    FROM booking `
    );


    var countOfUserEnum = await getConnection().query(`
    SELECT
		 COUNT("user"."user_id") as user_count
	   FROM "user" 
      WHERE
      ${userConditon}`);


    const grossPerUser = parseFloat(sumOfTotalAmount[0].total_amount) / parseFloat(countOfUserEnum[0].user_count);
    response["gross_per_user"] = (Math.round(grossPerUser * 100) / 100).toFixed(2);

    var sumOfMarkUpAmount = await getConnection().query(`
    SELECT sum("booking"."markup_amount"/"booking"."usd_factor") as "total_amount" 
    FROM booking `
    );


    const revenuePerUser = parseFloat(sumOfMarkUpAmount[0].total_amount) / parseFloat(countOfUserEnum[0].user_count);
    response["revenue_per_user"] = (Math.round(revenuePerUser * 100) / 100).toFixed(2);

    const revenueGrowthUsd = parseFloat(sumOfMarkUpAmount[0].total_amount);
    response["revenue_growth_in_usd"] = (Math.round(revenueGrowthUsd * 100) / 100).toFixed(2);

    const revenueGrowthPercentage = (100 * parseFloat(sumOfMarkUpAmount[0].total_amount) / parseFloat(sumOfTotalAmount[0].total_amount));
    response["revenue_growth_percentage"] = (Math.round(revenueGrowthPercentage * 100) / 100).toFixed(2);

    var markUpTotalBooking = (parseFloat(sumOfMarkUpAmount[0].total_amount)) / parseFloat(totalTicketsBooked[0].cnt);
    var totalAmtTotalBooking = (parseFloat(sumOfTotalAmount[0].total_amount)) / parseFloat(totalTicketsBooked[0].cnt);

    const avgBookingMarkUp = (100 * markUpTotalBooking) / totalAmtTotalBooking;
    response["average_booking_markup_percentage"] = (Math.round(avgBookingMarkUp * 100) / 100).toFixed(2);

    const avgBookingMarkUpUsd = (parseFloat(sumOfTotalAmount[0].total_amount)) - (parseFloat(sumOfMarkUpAmount[0].total_amount))
    response["average_booking_markup_usd"] = (Math.round(avgBookingMarkUpUsd * 100) / 100).toFixed(2);

    const newUpfrontUsers = await getConnection().query(
      `SELECT
		  user_id, COUNT(*)
		  FROM
      booking
      WHERE
      booking_type In (${BookingType.NOINSTALMENT})
		  GROUP BY
		  user_id
		  HAVING 
      COUNT(*) < 2`
    );
    response["new_upfront_users"] = newUpfrontUsers.length;

    const totalAccountHolders = await getConnection().query(
      `SELECT "user"."user_id", COUNT(*)
      FROM
      "user"
      GROUP BY
		  user_id`
    );
    response["total_account_holders"] = (Math.round(totalAccountHolders.length * 100) / 100);

    const totalGuestUsers = await getConnection().query(
      `SELECT "user"."user_id", COUNT(*)
      FROM
      "user"
      WHERE
      role_id In (${Role.GUEST_USER})
      GROUP BY
		  user_id`
    );
    response["total_guest_users"] = (Math.round(totalGuestUsers.length * 100) / 100);

    const activeGuestUsers = await getConnection().query(
      `SELECT "user"."user_id", COUNT(*)
      FROM
      "user"
      WHERE
      is_deleted=false
      AND
      is_verified=true
      AND
      role_id In (${Role.GUEST_USER})
      GROUP BY
		  user_id`
    );
    response["active_guest_users"] = (Math.round(activeGuestUsers.length * 100) / 100);

    const activeFreeUsers = await getConnection().query(
      `SELECT "user"."user_id", COUNT(*)
      FROM
      "user"
      WHERE
      is_deleted=false
      AND
      is_verified=true
      AND
      role_id In (${Role.FREE_USER})
      GROUP BY
		  user_id`
    );
    response["active_free_users"] = (Math.round(activeFreeUsers.length * 100) / 100);

    const totalActiveUsers = await getConnection().query(
      `SELECT "user"."user_id", COUNT(*)
      FROM
      "user"
      WHERE
      is_deleted=false
      AND
      is_verified=true
      GROUP BY
		  user_id`
    );
    response["total_active_users"] = (Math.round(totalActiveUsers.length * 100) / 100);



    const salesByFullPriceCount = await getConnection().query(
      `SELECT COUNT(id)
      FROM
      "booking"
      WHERE
      booking_type In (${BookingType.INSTALMENT})
      GROUP BY
		  id`
    );
    response["sales_by_full_price_count"] = (Math.round(salesByFullPriceCount.length * 100) / 100);

    const totalBooking = await getConnection().query(`
                SELECT  count(id) as cnt from booking`);

    const salesByFullPricePercent = salesByFullPriceCount.length * 100 / totalBooking[0].cnt;
    response["sales_by_full_price_percent"] = (Math.round(salesByFullPricePercent * 100) / 100);

    const salesByFullPriceRevenue = await getConnection().query(`
    SELECT sum("booking"."markup_amount"/"booking"."usd_factor") as "total_amount" 
    FROM booking WHERE booking_type In (${BookingType.INSTALMENT}) 
    `);
    response["sales_by_full_price_revenue"] = (Math.round(salesByFullPriceRevenue[0].total_amount * 100) / 100);

    const salesByInstallmentCount = await getConnection().query(
      `SELECT COUNT(id)
      FROM
      "booking"
      WHERE
      booking_type In (${BookingType.NOINSTALMENT})
      GROUP BY
		  id`
    );
    response["sales_by_installment_count"] = (Math.round(salesByInstallmentCount.length * 100) / 100);

    const salesByInstallmentPercent = salesByInstallmentCount.length * 100 / totalBooking[0].cnt;
    response["sales_by_installment_percent"] = (Math.round(salesByInstallmentPercent * 100) / 100);

    const salesByInstallmentRevenue = await getConnection().query(`
    SELECT sum("booking"."markup_amount"/"booking"."usd_factor") as "total_amount" 
    FROM booking WHERE booking_type In (${BookingType.NOINSTALMENT}) 
    `);
    response["sales_by_installment_revenue"] = (Math.round(salesByInstallmentRevenue[0].total_amount * 100) / 100);



    var userRegisteredViaApp = await getConnection().query(`
    SELECT COUNT(*) as cnt
      FROM
      "user"
      WHERE
      register_via In ('android','ios') AND is_deleted = false
      AND Role_id IN(${Role.FREE_USER},${Role.GUEST_USER},${Role.PAID_USER})
      `);

    response["user_registered_via_app"] = userRegisteredViaApp[0].cnt || 0;

    var userRegisteredViaWeb = await getConnection().query(`
    SELECT COUNT(*) as cnt
      FROM
      "user" where is_deleted = false AND Role_id IN(${Role.FREE_USER},${Role.GUEST_USER},${Role.PAID_USER})
      `);

    response["user_registered_via_web"] = parseInt(userRegisteredViaWeb[0].cnt) - parseInt(userRegisteredViaApp[0].cnt) || 0;

    return response;
  }
}
