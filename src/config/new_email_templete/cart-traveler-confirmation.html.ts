import { BookingType } from "src/enum/booking-type.enum";
import { ModulesName } from "src/enum/module.enum";
import { DateTime } from "src/utility/datetime.utility";
import { BookingLink } from "../base-url";
import { CartBookingEmailParameterModel } from "../email_template/model/cart-booking-email.model";
import { LaytripFooter } from "./laytrip_footer.html";
import { LaytripHeader } from "./laytrip_header.html";

export async function LaytripCartBookingTravelProviderConfirmtionMail(
    param: CartBookingEmailParameterModel
) {
      let traveleName = "";
      let travelerEmail = "";
      for await (const traveler of param.travelers) {
          if (traveleName != "") {
              traveleName += ", ";
          }
          if (travelerEmail == "") {
              travelerEmail += traveler.email
                  ? '<span style="color: #0C7BFF;">' +
                    traveler.email +
                    "</span>"
                  : "";
          }
          traveleName += traveler.name ? traveler.name : "";
      }

      let content = `<tr>
    <td align="center" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
        <table  width="550px" border="0" cellspacing="0" cellpadding="0" align="center"
            style="width: 550px; font-family: 'Poppins', sans-serif; ">
            <tbody>
                <tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #000000; font-weight: 600;; text-align: left; font-weight: 600;">
                        Hi ${param.user_name ? param.user_name : ""},</td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                        Congratulations on booking your travel with Laytrip. <span style = "color: #000000; font-weight: 600;">Your Laytrip Booking ID is ${
                            param.orderId
                        }.</span> Please use this number when referencing your booking with Laytrip.
                    </td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">`;

      for (let index = 1; index <= param.bookings.length; index++) {
          const booking = param.bookings[index - 1];
          if (booking.moduleId == ModulesName.FLIGHT) {
              if (booking.flighData[0].droups[0].depature?.pnr_no) {
                  content += `<span style = "color: #000000; font-weight: 600;">Your ${booking.flighData[0].droups[0].flight} Travel Provider Confirmation Number is ${booking.flighData[0].droups[0].depature?.pnr_no}.</span> `;
              }
          }
          if (booking.moduleId == ModulesName.HOTEL) {
              content += `<span style = "color: #000000; font-weight: 600;">Your Hotel Travel Provider Confirmation Number is Your Lastname.</span> `;
          }
          if (index != param.bookings.length) {
              content += `<br/>`;
          } else {
              content += ` As your reservation with your Travel Provider is confirmed, please contact your Travel Provider directly for any of your travel needs from this time forward. Here are your Reservation Details:`;
          }
      }

      content += ` </td>
                </tr>`;
      content += `
                <tr>
                    <td
                          align="left" valign="top"bold;
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 5px; display: block; line-height: 27px; color: #707070; text-align: left;">
                        <span  style="color: #000000; font-weight: 600;">
                        Traveler: 
                        </span>
                        <span style="font-size: 18px" >
                        ${traveleName}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td
                          align="left" valign="top"bold;
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 5px; display: block; line-height: 27px; color: #707070; text-align: left;">
                        <span  style="color: #000000; font-weight: 600;">
                        Email: 
                        </span>
                        <span style="font-size: 18px" >
                        ${travelerEmail}
                        </span>
                    </td>
                </tr>`;

      for await (const booking of param.bookings) {
          if (booking.moduleId == ModulesName.FLIGHT) {
              for await (const flight of booking.flighData) {
                  for await (const droup of flight.droups) {
                      content += `<tr>
                        <td
                              align="left" valign="top"bold;
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 5px; display: block; line-height: 27px; color: #707070; text-align: left;">
                            <span style="color: #000000; font-weight: 600;">${
                                droup.flight
                            }: </span>Depart ${
                          droup.depature.code
                      } ${DateTime.convertDateFormat(
                          droup.depature.date,
                          "MM/DD/YYYY",
                          "MMMM DD, YYYY"
                      )} ${droup.depature.time.replace(/\s/g, "")},
                            Arrive ${
                                droup.arrival.code
                            } ${droup.arrival.time.replace(/\s/g, "")}
                        </td>
                    </tr>`;
                  }
              }
          } else if (booking.moduleId == ModulesName.HOTEL) {
              content += `<tr>
                        <td
                             align="left" valign="top"bold;
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 5px; display: block; line-height: 27px; color: #707070; text-align: left;">
                            <span style="color: #000000; font-weight: 600;">Hotel:</span> ${
                                booking.hotelData.hotelName
                            }, Check-in ${DateTime.convertDateFormat(
                  booking.hotelData.checkIn,
                  "YYYY-MM-DD",
                  "MMMM DD, YYYY"
              )}, ${booking.hotelData.room} Room 
                            ${
                                booking.hotelData.adult
                                    ? ", " + booking.hotelData.adult + " Adult"
                                    : ""
                            }
                            ${
                                booking.hotelData.child
                                    ? ", " + booking.hotelData.child + " Child"
                                    : ""
                            }
                            </td>
                    </tr>`;
          }
      }
      content += `<tr>
                <td
                      align="left" valign="top"bold;
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 5px; display: block; line-height: 27px; color: #707070; text-align: left;">
                    <span  style="color: #000000; font-weight: 600;">Total Price: </span> <span style="font-size: 18px" >${param.cart.totalAmount}</span>
                </td>
            </tr>
            <tr>
                <td
                      align="left" valign="top"bold;
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 5px; display: block; line-height: 27px; color: #707070; text-align: left;">
                    <span  style="color: #000000; font-weight: 600;">Total Paid: </span> <span style="font-size: 18px" >${param.cart.totalPaid}</span>
                </td>
            </tr>
            <tr>
                <td
                      align="left" valign="top"bold;
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 5px; display: block; line-height: 27px; color: #707070; text-align: left;">
                    <span  style="color: #000000; font-weight: 600;">Balance Due: </span> <span style="font-size: 18px" >${param.cart.rememberAmount}</span>
                </td>
            </tr>`;
      for await (const booking of param.bookings) {
          if (booking.moduleId == ModulesName.FLIGHT) {
              if (booking.flighData[0].droups[0].depature?.pnr_no) {
                  content += `<tr>
                <td
                      align="left" valign="top"bold;
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 5px; display: block; line-height: 27px; color: #707070; text-align: left;">
                    <span  style="color: #707070">Provider Reservation Number: ${booking.flighData[0].droups[0].depature?.pnr_no}</span>
                    </span>
                </td>
            </tr>`;
              }
          }
      }
     
      content += `    <tr>
                    <td style="padding: 15px 0;">
                        <table class="oc_wrapper" align="center" border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                        <a class="" style="color: #f725c5;" href = '${BookingLink}'>My Bookings</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                        Contact us anytime at  <a href = 'mailto:customerservice@laytrip.com'
                        style="color: #0C7BFF;">customerservice@laytrip.com</a>. We hope you have a great trip!
                    </td>
                </tr>
            </tbody>
        </table>
    </td>
</tr>
<tr>
<td align="center" valine="top" style="padding: 5px 25px 10px; background: #ffffff;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
        <tbody> 
            <tr>
                <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 0px; display: block; line-height: 27px; color: #707070; text-align: left;">Sincerely,</td>
            </tr>
            <tr>
                <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 10px; display: block; line-height: 27px; color: #0043FF; text-align: left;"><a href = 'mailto:customerservice@laytrip.com'>Laytrip Customer Service</a></td>
            </tr>
        </tbody>
    </table>
</td>
</tr>`;
      return LaytripHeader + content + LaytripFooter;
  }
