import { BookingType } from "src/enum/booking-type.enum";
import { ModulesName } from "src/enum/module.enum";
import { DateTime } from "src/utility/datetime.utility";
import { BookingLink, TermsConditonLink } from "../base-url";
import { CartBookingEmailParameterModel } from "../email_template/model/cart-booking-email.model";
import { LaytripFooter } from "./laytrip_footer.html";
import { LaytripHeader } from "./laytrip_header.html";

export async function LaytripCartBookingConfirmtionMail(
    param: CartBookingEmailParameterModel
) {
    let content = `<tr>
    <td align="center" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center"
            style="width: 100%; font-family: 'Poppins', sans-serif; ">
            <tbody>
                <tr>
                    <td align="left" valign="top"
                    style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 18px; line-height: 25px; color: #707070;padding:0 0 20px 0; text-align: left;">
                        Hi ${param.user_name ? param.user_name : ""},</td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 18px; line-height: 25px; color: #707070;padding:0 0 20px 0; text-align: left;">
                        Congratulations on booking your travel! <span style = "color: #707070">Your Laytrip Booking ID is ${
                            param.orderId
                        }.</span>  Please use this number when referencing your booking.`;
    if (param.bookingType == BookingType.NOINSTALMENT) {
        content += ` Here are your Booking Details:`;
    }
    content += `</td>
                </tr>`;
    if (param.bookingType == BookingType.INSTALMENT) {
        content += `<tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 18px;  line-height: 25px; color: #707070;padding:0 0 15px 0; text-align: left;">
                        We will send you your airline, hotel, car and home rental reservation number(s) once we have received your final installment payment. Until your final installment is received, our  
                        <a href="${TermsConditonLink}" style="color: #0C7BFF;">Terms</a> for changes and cancellations apply. 
                        Here are your Booking details:
                </tr>`;
    }

    for await (const booking of param.bookings) {
        let traveleName = "";
        let travelerEmail = "";
        for await (const traveler of booking.travelers) {
            if (traveleName != "") {
                traveleName += ", ";
            }
            if (travelerEmail != "") {
                travelerEmail += ", ";
            }
            traveleName += traveler.name ? traveler.name : "";
            travelerEmail += traveler.email
                ? '<span style="color: #0C7BFF;">' + traveler.email + "</span>"
                : "";
        }
        if (booking.moduleId == ModulesName.FLIGHT) {
            content += `<tr>
                    <td
                        align="left"
                        valign="top"
                        style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:20px; text-align: left;"
                    >
                        <span style="color: #000000">
                        Traveler:</span><span style="font-size: 18px">${traveleName}</span>
                    </td>
                </tr>
                <tr>
                    <td
                        align="left"
                        valign="top"
                        style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px; font-size: 18px text-align: left;"
                    >
                        <span style="color: #000000">Email:</span><span style="font-size: 18px">${travelerEmail}</span>
                    </td>
                </tr>`;
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
                            }:</span>Depart ${
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
                        style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:20px; text-align: left;"
                    >
                        <span style="color: #000000">
                        Traveler:</span><span style="font-size: 18px">${traveleName}</span>
                    </td>
                </tr>
                <tr>
                    <td
                        align="left"
                        valign="top"
                        style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px; font-size: 18px text-align: left;"
                    >
                        <span style="color: #000000">Email:</span><span style="font-size: 18px">${travelerEmail}</span>
                    </td>
                </tr><tr>
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
                    style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070;  padding-top:5px; font-size: 18px text-align: left;"
                >
                    <span style="color: #000000">Total Price:</span><span style="font-size: 18px">${param.cart.totalAmount}</span>
                </td>
            </tr>`;
    if (param.bookingType == BookingType.INSTALMENT) {
        content += `
    <tr>
                <td
                    align="left"
                    valign="top"
                    style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px; font-size: 18px text-align: left;"
                >
                    <span style="color: #000000">Total Paid:</span><span style="font-size: 18px">${param.cart.totalPaid}</span>
                </td>
            </tr>
            <tr>
                <td
                    align="left"
                    valign="top"
                    style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px; font-size: 18px text-align: left;"
                >
                    <span style="color: #000000">Balance Due:</span>  <span style="font-size: 18px" >${param.cart.rememberAmount}</span>
                </td>
            </tr>`;
    }
    if (param.paymentDetail.length) {
        content += `<tr>
                <td
                    align="left"
                    valign="top"
                    style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px; font-size: 18px text-align: left;"
                >
                    <span style="color: #707070">Installments</span> 
                </td>
            </tr> `;
        for (let index = 0; index < param.paymentDetail.length; index++) {
            const payment = param.paymentDetail[index];
            //   console.log(payment.amount);
            if (index > 0) {
                content += `
                <tr>
                <td
                    align="left"
                    valign="top"
                    style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070; padding-top:5px; font-size: 18px text-align: left;"
                >
                    #${index} ${payment.amount} ${
                    payment.status
                } ${DateTime.convertDateFormat(
                    payment.date,
                    "YYYY-MM-DD",
                    "MMMM DD, YYYY"
                )}
                </td>
            </tr>`;
            }
        }
    }
    content += `
                <tr>
                    <td style="padding: 20px 0 0 0;">
                        <table class="oc_wrapper" align="center" border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    <td align="center" valign="middle" style="font-family: 'Open Sans', sans-serif; font-size: 18px; font-weight: 200; " height="48">
                                        <a class="" style="color: #f725c5;" href = '${BookingLink}'>My  Bookings</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>`;
    if (param.bookingType != BookingType.INSTALMENT) {
        content += `<tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 18px; line-height: 25px; color: #707070;padding:0 0 20px 0; text-align: left;">
                        Contact us anytime at <a href = 'mailto:customerservice@laytrip.com' style = "color: #0C7BFF"
                        >customerservice@laytrip.com</a>. We hope you have a great trip!
                    </td>
                </tr>`;
    }
    content += `    
            </tbody>
        </table>
    </td>
</tr><tr>
<td align="center" valine="top" style="padding: 5px 25px 10px; background: #ffffff;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
        <tbody> 
            <tr>
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 20px; color: #707070;padding-top:27px; text-align: left;">Sincerely,</td>
            </tr>
            <tr>
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 18px; color:#0043FF;padding-top:5px; text-align: left;"><a href = 'mailto:customerservice@laytrip.com'>Laytrip Customer Service</a></td>
            </tr>
        </tbody>
    </table>
</td>
</tr>`;
    return LaytripHeader + content + LaytripFooter;
}
