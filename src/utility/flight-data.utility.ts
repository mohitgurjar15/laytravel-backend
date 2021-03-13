import { NotFoundException } from "@nestjs/common";
import { FlightBookingEmailParameterModel } from "src/config/email_template/model/flight-booking-email-parameter.model";
import { Booking } from "src/entity/booking.entity";
import { BookingStatus } from "src/enum/booking-status.enum";
import { BookingType } from "src/enum/booking-type.enum";
import { getConnection } from "typeorm";
import { CartDataUtility } from "./cart-data.utility";
import { DateTime } from "./datetime.utility";
import { Generic } from "./generic.utility";
import * as moment from "moment";

export class flightDataUtility {
  static async flightData(flightId) {
    const where = `"booking"."laytrip_booking_id" = '${flightId}'`;
    const bookingData = await getConnection()
      .createQueryBuilder(Booking, "booking")
      .leftJoinAndSelect("booking.cart", "cart")
      .leftJoinAndSelect("booking.bookingInstalments", "instalments")
      .leftJoinAndSelect("booking.currency2", "currency")
      .leftJoinAndSelect("booking.user", "User")
      .leftJoinAndSelect("booking.travelers", "traveler")
      .leftJoinAndSelect("traveler.userData", "userData")
      .leftJoinAndSelect("User.country", "countries")
      .leftJoinAndSelect("User.state", "state")
      .leftJoinAndSelect("booking.supplier", "supplier")
      .where(where)
      .getOne();

    if (!bookingData) {
      throw new NotFoundException(`No booking found&&&id&&&No booking found`);
    }

    if (bookingData.bookingInstalments.length > 0) {
      bookingData.bookingInstalments.sort((a, b) => a.id - b.id);
    }

    if (
      bookingData.bookingStatus == BookingStatus.CONFIRM ||
      bookingData.bookingStatus == BookingStatus.PENDING
    ) {
      var param = new FlightBookingEmailParameterModel();
      const user = bookingData.user;
      const moduleInfo = bookingData.moduleInfo[0];
      const routes = moduleInfo.routes;
      const travelers = bookingData.travelers;
      let flightData: {
        rout: any;
        status: any;
        droups: any;
      }[] = [];
      for (let index = 0; index < routes.length; index++) {
        const element = routes[index];
        var rout =
          index == 0
            ? `${moduleInfo.departure_info.city} To ${moduleInfo.arrival_info.city} (${moduleInfo.routes[0].type})`
            : `${moduleInfo.arrival_info.city} To ${moduleInfo.departure_info.city} (${moduleInfo.routes[1].type})`;
        var status = bookingData.bookingStatus == 0 ? "Pending" : "Confirm";
        var droups = [];
        for await (const stop of element.stops) {
          var flight = `${stop.airline}-${stop.flight_number}`;
          var depature = {
            code: stop.departure_info.code,
            name: stop.departure_info.name,
            city: stop.departure_info.city,
            country: stop.departure_info.country,
            date: await CartDataUtility.formatDate(stop.departure_date_time),
            time: stop.departure_time,
          };
          if (stop?.pnr_no) {
            depature["pnr_no"] = stop?.pnr_no || "";
          }
          var arrival = {
            code: stop.arrival_info.code,
            name: stop.arrival_info.name,
            city: stop.arrival_info.city,
            country: stop.arrival_info.country,
            date: await CartDataUtility.formatDate(stop.arrival_date_time),
            time: stop.arrival_time,
          };
          droups.push({
            flight: flight,
            depature: depature,
            arrival: arrival,
            airline: stop.airline_name,
          });
        }
        //console.log();
        flightData.push({
          rout: rout,
          status: status,
          droups: droups,
        });
      }

      var EmailSubject = "";
      if (bookingData.bookingType == BookingType.INSTALMENT) {
        EmailSubject =
          `REMINDER - TRAVEL PROVIDER RESERVATION CONFIRMATION` + flightId;
      } else {
        EmailSubject = `TRAVEL PROVIDER RESERVATION CONFIRMATION` + flightId;
      }
      const d = await CartDataUtility.formatDate(bookingData.bookingDate);
      const installmentDetail = {
        amount:
          bookingData.currency2.symbol +
          Generic.formatPriceDecimal(parseFloat(bookingData.totalAmount)),
        date: DateTime.convertDateFormat(d, "MM/DD/YYYY", "MMM DD, YYYY"),
        status: bookingData.paymentStatus == 1 ? "Confirm" : "Pending",
      };
      var travelerInfo = [];
      for await (const traveler of travelers) {
        var today = new Date();
        var birthDate = new Date(traveler.userData.dob);
        var age = moment(new Date()).diff(moment(birthDate), "years");

        var user_type = "";
        if (age < 2) {
          user_type = "Infant";
        } else if (age < 12) {
          user_type = "Child";
        } else {
          user_type = "Adult";
        }
        travelerInfo.push({
          name: traveler.userData.firstName + " " + traveler.userData.lastName,
          email: traveler.userData.email,
          type: user_type,
        });
      }
      const cartData = await CartDataUtility.cartData(bookingData.cartId);
      param.user_name = `${user.firstName}  ${user.lastName}`;
      param.flight = flightData;
      param.orderId = bookingData.laytripBookingId;
      param.traveler = travelerInfo;
      if (bookingData.bookingType == BookingType.INSTALMENT) {
        param.cart = {
          cartId: bookingData.cart.laytripCartId,
          totalAmount: cartData.totalAmount,
          totalPaid: cartData.paidAmount,
          rememberAmount: cartData.remainAmount,
        };
      } else {
        param.cart = {
          cartId: bookingData.cart.laytripCartId,
          totalAmount: cartData.totalAmount,
        };
      }

      param.bookingType = bookingData.bookingType;

      return { param, sub: EmailSubject, userMail: user.email };
    }
  }
}
