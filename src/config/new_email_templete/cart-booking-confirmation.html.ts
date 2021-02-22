import { BookingType } from "src/enum/booking-type.enum";
import { ModulesName } from "src/enum/module.enum";
import { DateTime } from "src/utility/datetime.utility";
import { CartBookingEmailParameterModel } from "../email_template/model/cart-booking-email.model";
import { LaytripFooter } from "./laytrip_footer.html";
import { LaytripHeader } from "./laytrip_header.html";

export async function LaytripCartBookingConfirmtionMail(
    param: CartBookingEmailParameterModel
  ) {
    let content = `<tr>
    <td align="center" valine="top" style="padding: 20px 25px 10px; background: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center"
            style="width: 100%; font-family: 'Poppins', sans-serif; ">
            <tbody>
                <tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 14px; line-height: 20px; color: #000000; text-align: left;">
                        Hi ${param.user_name ? param.user_name : ''},</td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 14px; line-height: 20px; color: #707070;padding: 20px 0; text-align: left;">
                        Congratulations on booking your travel! Your Laytrip Product ID is <span
                        style="color: #f725c5;">${param.orderId}</span> please use this number when referencing your booking. Here are your Booking Details:
                    </td>
                </tr>`
                if(param.bookingType == BookingType.INSTALMENT){
                content += `<tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 14px;  line-height: 20px; color: #707070;padding: 15px 0; text-align: left;">
                        We will send you your airline, hotel, car and home rental reservation number(s) once we have received your final installment payment. Until your final installment is received, our 
                        <span style="color: #f725c5;">Laytrip Policy</span>for changes and cancellations apply. 
                        <br/>Here are your booking details:</td>
                </tr>` 
                }
                content += `
                
                <tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070; padding-top:10px; padding-bottom:10px; text-align: left;">
                        <span style="font-weight: 700; padding-right:10px; color: #000000;">Bookings </span>
                    </td>
                </tr>`
                for await (const booking of param.bookings) {
                    if(booking.moduleId == ModulesName.FLIGHT){
                content += `<tr>
                    <td>
                        <table border="1" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #dddddd; font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;"
                            id="templateColumns">
                            <tr>
                                <th align="center" valign="center" cellpadding="10" cellspacing="0"
                                    width="20%" class="header_txt"
                                    style="padding: 15px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
                                    flight
                                </th>
                                <th align="center" valign="center" cellpadding="10" cellspacing="0"
                                    width="40%" class="header_txt"
                                    style="padding: 15px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
                                    Departure
                                </th>
                                <th align="center" valign="center" cellpadding="10" cellspacing="0"
                                    width="40%" class="header_txt"
                                    style="padding: 15px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
                                    Arrival
                                </th>
                            </tr>`
                            for await (const flight of booking.flighData) {
                                content +=
                            `<tr>
                                <td colspan="3"
                                    style="padding: 20px 0; background-color: #ecf1ff; color: #000000; font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 15px;">
                                        <span>${flight.rout}</span>
                                        <span>Product Id : ${booking.productId}</span>
                                    </div>
                                </td>
                            </tr>`
                            for await (const droup of flight.droups) {
                                content +=`<tr>
                                <td class="templateColumnContainer">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="leftColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;"> ${droup.flight}</span>
                                                <span style="display: block;">${droup.airline}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td class="templateColumnContainer">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">Airport :- ${droup.depature.code} (La Guardia)</span>
                                                <span style="display: block;">City :- ${droup.depature.city}</span>
                                                <span style="display: block;">Country:- ${droup.depature.country}</span>
                                                <span style="display: block;"> Date :- ${ DateTime.convertDateFormat(droup.depature.date, 'MM/DD/YYYY', 'MMM DD, YYYY')}</span>
                                                <span style="display: block;">time :- ${droup.depature.time}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td class="templateColumnContainer">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">Airport :- ${droup.arrival.code}</span>
                                                <span style="display: block;">City :- ${droup.arrival.city}</span>
                                                <span style="display: block;">Country:- ${droup.arrival.country}</span>
                                                <span style="display: block;"> Date :- ${DateTime.convertDateFormat(droup.arrival.date, 'MM/DD/YYYY', 'MMM DD, YYYY')}</span>
                                                <span style="display: block;">time :- ${droup.arrival.time}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>`
                            }
                                
                            }
                            
                            
                content +=`</table>
                    </td>
                </tr>
                
                <tr>
                    <td>
                        <table border="1" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #dddddd; font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;"
                            id="templateColumns">
                            <tr>
                                <td colspan="4"
                                    style="padding: 10px 0; background-color: #ecf1ff; color: #000000; font-weight: 800; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 15px;">
                                        <span>Traveler details</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th align="center" valign="center" cellpadding="10" cellspacing="0"
                                    width="15%" class="header_txt"
                                    style="padding: 10px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
                                    No
                                </th>
                                <th align="center" valign="center" cellpadding="10" cellspacing="0"
                                    width="30%" class="header_txt"
                                    style="padding: 10px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
                                    Name
                                </th>
                                <th align="center" valign="center" cellpadding="10" cellspacing="0"
                                    width="35%" class="header_txt"
                                    style="padding: 10px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
                                    Email
                                </th>
                                <th align="center" valign="center" cellpadding="10" cellspacing="0"
                                    width="20%" class="header_txt"
                                    style="padding: 10px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
                                    Type
                                </th>
                            </tr>`
                            for (let index = 0; index < booking.travelers.length; index++) {
                                const traveler = booking.travelers[index];
                                content += `<tr>
                                <td class="templateColumnContainer" width="15%">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="leftColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">${index+1}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td class="templateColumnContainer" width="25%">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">${traveler.name}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td class="templateColumnContainer" width="25%">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">${traveler.email}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td class="templateColumnContainer" width="35%">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">${traveler.type}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>`
                            }
                            content +=`</table>
                    </td>
                </tr><tr><td>   <br/></td></tr>`
                    }
                }
                content +=
                `<tr>
                    <td>
                        <table border="1" cellpadding="3" cellspacing="0" width="600" style="border: 1px solid #dddddd; margin-top: 15px; font-weight: 300; font-size: 12px; font-family: 'Poppins', sans-serif;"
                            id="templateColumns">
                            <tr>
                                <td><span style="font-weight: 500; font-size: 13px; padding-right:10px; color: #000000; font-family: 'Poppins', sans-serif;">Booking ID:</span></td>
                                <td><span style="font-weight: 500; font-size: 13px; padding-right:10px; color: #000000; font-family: 'Poppins', sans-serif;">${param.orderId}</span></td>
                            </tr>
                            <tr>
                                <td><span style="font-weight: 500; font-size: 13px; padding-right:10px; color: #000000; font-family: 'Poppins', sans-serif;">Total Price:</span></td>
                                <td><span style="font-weight: 500; font-size: 13px; padding-right:10px; color: #000000; font-family: 'Poppins', sans-serif;">${param.cart.totalAmount}</span></td>
                            </tr>`
                            if(param.cart.totalPaid != '$0'){
                                content += `<tr>
                                <td><span style="font-weight: 500; font-size: 13px; padding-right:10px; color: #000000; font-family: 'Poppins', sans-serif;">Total Paid:</span></td>
                                <td><span style="font-weight: 500; font-size: 13px; padding-right:10px; color: #000000; font-family: 'Poppins', sans-serif;">${param.cart.totalPaid}</span></td>
                            </tr>
                            <tr>
                                <td><span style="font-weight: 700; font-size: 13px; padding-right:10px; color: #000000;  font-family: 'Poppins', sans-serif;">Blance Due:</span></td>
                                <td><span style="font-weight: 700; font-size: 13px; padding-right:10px; color: #000000;  font-family: 'Poppins', sans-serif;">${param.cart.rememberAmount}</span></td>
                            </tr>`
                            }
                            content +=`
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table border="1" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #dddddd; font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;"
                            id="templateColumns">
                            <tr>`
                            if(param.paymentDetail.length)
                            {
                                content += ` <td colspan="4"
                                    style="padding: 10px 0; background-color: #ecf1ff; color: #000000; font-weight: 800; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 15px;">
                                        <span>Payment details</span>
                                    </div>
                                </td>
                            </tr>`
                            }
                            if(param.paymentDetail.length)
                            {

                            
                            content += `<tr>
                                <th align="center" valign="center" cellpadding="10" cellspacing="0"
                                    width="15%" class="header_txt"
                                    style="padding: 10px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
                                    ID
                                </th>
                                <th align="center" valign="center" cellpadding="10" cellspacing="0"
                                    width="25%" class="header_txt"
                                    style="padding: 10px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
                                    Amount
                                </th>
                                <th align="center" valign="center" cellpadding="10" cellspacing="0"
                                    width="25%" class="header_txt"
                                    style="padding: 10px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
                                    Date
                                </th>
                                <th align="center" valign="center" cellpadding="10" cellspacing="0"
                                    width="35%" class="header_txt"
                                    style="padding: 10px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
                                    status
                                </th>
                            </tr>`
                            for (let index = 0; index < param.paymentDetail.length; index++) {
                                const payment = param.paymentDetail[index];
                                
                            
                            
                            content += `<tr>
                                <td class="templateColumnContainer" width="15%">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="leftColumnContent">
                                                <span style="display: block;">${index+1}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td class="templateColumnContainer" width="25%">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">${payment.amount}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td class="templateColumnContainer" width="25%">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">${DateTime.convertDateFormat(payment.date, 'YYYY-MM-DD', 'MMM DD, YYYY')}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td class="templateColumnContainer" width="35%">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">${payment.status}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>`
                            }
                        }
                        content +=`</table>
                    </td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 14px; line-height: 20px; color: #707070;padding: 20px 0; text-align: left;">
                        You can contact us any time at<span
                        style="color: #f725c5;"> customerservice@laytrip.com</span>. We hope you have a great trip!
                    </td>
                </tr>
            </tbody>
        </table>
    </td>
</tr>`
    return LaytripHeader + content + LaytripFooter;
  }