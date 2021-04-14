import { BookingType } from "src/enum/booking-type.enum";
import { ModulesName } from "src/enum/module.enum";
import { DateTime } from "src/utility/datetime.utility";
import { BookingLink } from "../base-url";
import { CartBookingEmailParameterModel } from "../email_template/model/cart-booking-email.model";
import { FlightBookingEmailParameterModel } from "../email_template/model/flight-booking-email-parameter.model";
import { LaytripFooter } from "./laytrip_footer.html";
import { LaytripHeader } from "./laytrip_header.html";

export async function TravelProviderConfiramationMail(
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
        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center"
            style="width: 100%; font-family: 'Poppins', sans-serif; ">
            <tbody>
                <tr>
                    <td align="left" valign="top"
                    style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 18px; line-height: 25px; color: #707070;padding: 0 0 20px 0; text-align: left;">
                        Hi ${param.user_name ? param.user_name : ""},</td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 18px; line-height: 25px; color: #707070;padding: 0 0 20px 0; text-align: left;">
                        Booking ID ${param.orderId} Change Confirmation!
                    </td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 18px;  line-height: 25px; color: #707070;padding: 15px 0; text-align: left;">
                        Your reservation has been changed by the Travel Provider. Please review these changes below:</td>
                </tr>
                <tr>
                    <td
                        align="left"
                        valign="top"
                        style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:10px;  text-align: left;"
                    >
                        <span  style="color: #000000">
                        Traveler: 
                        </span>
                        <span style="font-size: 18px" >
                        ${traveleName}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td
                        align="left"
                        valign="top"
                        style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px;  text-align: left;"
                    >
                        <span  style="color: #000000">
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
                            align="left"
                            valign="top"
                            style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px; font-size: 18px text-align: left;"
                        >
                            <span style="color: #000000">${
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
                            align="left"
                            valign="top"
                            style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px; font-size: 18px text-align: left;"
                        >
                            <span style="color: #000000">Hotel:</span> ${
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
                    align="left"
                    valign="top"
                    style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px;  text-align: left;"
                >
                    <span  style="color: #000000">Total Price: </span> <span style="font-size: 18px" >${param.cart.totalAmount}</span>
                </td>
            </tr>`;
             if (
                 param.cart.rememberAmount &&
                 param.cart.rememberAmount != "$0"
             ) {
                 content += `<tr>
                <td
                    align="left"
                    valign="top"
                    style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px;  text-align: left;"
                >
                    <span  style="color: #000000">Total Paid: </span> <span style="font-size: 18px" >${param.cart.totalPaid}</span>
                </td>
            </tr>
            <tr>
                <td
                    align="left"
                    valign="top"
                    style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px;  text-align: left;"
                >
                    <span  style="color: #000000">Balance Due: </span> <span style="font-size: 18px" >${param.cart.rememberAmount}</span>
                </td>
            </tr>`;
             } else {
                 content += `<tr>
                <td
                    align="left"
                    valign="top"
                    style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px;  text-align: left;"
                >
                    <span  style="color: #000000">Total Paid: </span> <span style="font-size: 18px" >${param.cart.totalAmount}</span>
                </td>
            </tr>
            <tr>
                <td
                    align="left"
                    valign="top"
                    style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px;  text-align: left;"
                >

                    <span  style="color: #000000">Balance Due: </span> <span style="font-size: 18px" >$0</span>
                </td>
            </tr>`;
             }

             for await (const booking of param.bookings) {
                 if (booking.moduleId == ModulesName.FLIGHT) {
                     if (booking.flighData[0].droups[0].depature?.pnr_no) {
                         content += `<tr>
                <td
                    align="left"
                    valign="top"
                    style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px; padding-bottom:px; text-align: left;"
                >
                    <span  style="color: #707070">Provider Reservation Number: ${booking.flighData[0].droups[0].depature?.pnr_no}</span>
                    </span>
                </td>
            </tr>`;
                     }
                 }
             }

             content += `            <tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 18px; line-height: 25px; color: #707070;padding: 0 0 20px 0; text-align: left;">
                        <br/><br/>If you have any questions please contact <a href = 'mailto:customerservice@laytrip.com'
                        style="color: #0C7BFF;">customerservice@laytrip.com</a>.
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
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 20px; color: #707070;padding-top:27px; text-align: left;">Sincerely,</td>
            </tr>
            <tr>
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 18px; color: #0043FF;padding-top:5px; text-align: left;"><a href = 'mailto:customerservice@laytrip.com' style:"color:#0043FF">Laytrip Customer Service</a></td>
            </tr>
        </tbody>
    </table>
</td>
</tr>`;
             return LaytripHeader + content + LaytripFooter;
         }
