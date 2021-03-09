import { BookingType } from "src/enum/booking-type.enum";
import { FlightBookingEmailParameterModel } from "../email_template/model/flight-booking-email-parameter.model";
import { LaytripFooter } from "./laytrip_footer.html";
import { LaytripHeader } from "./laytrip_header.html";

export async function TravelProviderConfiramationMail(
  param: FlightBookingEmailParameterModel
) {
  let content = `<tr>
    <td align="center" valine="top" style="padding: 20px 25px 10px; background: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center"
            style="width: 100%; font-family: 'Poppins', sans-serif; ">
            <tbody>
                <tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 14px; line-height: 20px; color: #000000; text-align: left;">
                        Hi ${param.user_name ? param.user_name : ""},</td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 14px; line-height: 20px; color: #707070;padding: 20px 0; text-align: left;">
                        Booking ID ${param.cart.cartId} Change Confirmation! 
                    </td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 14px;  line-height: 20px; color: #707070;padding: 15px 0; text-align: left;">
                        Your reservation has been changed by the Travel Provider. Please review these changes below:
                        </td>
                </tr>`;

  content += `
                
                <tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070; padding-top:10px; padding-bottom:10px; text-align: left;">
                        <span style="font-weight: 700; padding-right:10px; color: #000000;">Itinerary </span>
                    </td>
                </tr>
                <tr>
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
                            </tr>`;
  for await (const flight of param.flight) {
    content += `<tr>
                                <td colspan="3"
                                    style="padding: 20px 0; background-color: #ecf1ff; color: #000000; font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 15px;">
                                        <span>${flight.rout}</span>
                                        <span>status: ${flight.status}</span>
                                    </div>
                                </td>
                            </tr>`;
    for await (const droup of flight.droups) {
      content += `<tr>
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
                                                <span style="display: block;"> Date :- ${droup.depature.date}</span>
                                                <span style="display: block;">time :- ${droup.depature.time}</span>
                                                <span style="display: block;">Pnr No :- ${droup.depature.pnr_no}</span>
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
                                                <span style="display: block;"> Date :- ${droup.arrival.date}</span>
                                                <span style="display: block;">time :- ${droup.arrival.time}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>`;
    }
  }

  // content +=`</table>
  //     </td>
  // </tr>
  // <tr>
  //     <td>
  //         <table border="1" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #dddddd; font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;"
  //             id="templateColumns">
  //             <tr>
  //                 <td colspan="4"
  //                     style="padding: 10px 0; background-color: #ecf1ff; color: #000000; font-weight: 800; font-size: 11px; font-family: 'Poppins', sans-serif;">
  //                     <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 15px;">
  //                         <span>Payment details</span>
  //                     </div>
  //                 </td>
  //             </tr>
  //             <tr>
  //                 <th align="center" valign="center" cellpadding="10" cellspacing="0"
  //                     width="15%" class="header_txt"
  //                     style="padding: 10px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
  //                     ID
  //                 </th>
  //                 <th align="center" valign="center" cellpadding="10" cellspacing="0"
  //                     width="25%" class="header_txt"
  //                     style="padding: 10px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
  //                     Amount
  //                 </th>
  //                 <th align="center" valign="center" cellpadding="10" cellspacing="0"
  //                     width="25%" class="header_txt"
  //                     style="padding: 10px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
  //                     Date
  //                 </th>
  //                 <th align="center" valign="center" cellpadding="10" cellspacing="0"
  //                     width="35%" class="header_txt"
  //                     style="padding: 10px 0; font-weight: 300; text-transform: uppercase; background-color: #0043ff; border: 1px solid #ffffff; color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; line-height: 20px;">
  //                     status
  //                 </th>
  //             </tr>
  //             <tr>
  //                 <td class="templateColumnContainer" width="15%">
  //                     <table border="0" cellpadding="5" cellspacing="0" width="100%">
  //                         <tr>
  //                             <td valign="top" class="leftColumnContent">
  //                                 <span style="display: block;">1</span>
  //                             </td>
  //                         </tr>
  //                     </table>
  //                 </td>
  //                 <td class="templateColumnContainer" width="25%">
  //                     <table border="0" cellpadding="5" cellspacing="0" width="100%">
  //                         <tr>
  //                             <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
  //                                 <span style="display: block;">${param.paymentDetail.amount}</span>
  //                             </td>
  //                         </tr>
  //                     </table>
  //                 </td>
  //                 <td class="templateColumnContainer" width="25%">
  //                     <table border="0" cellpadding="5" cellspacing="0" width="100%">
  //                         <tr>
  //                             <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
  //                                 <span style="display: block;">${param.paymentDetail.date}</span>
  //                             </td>
  //                         </tr>
  //                     </table>
  //                 </td>
  //                 <td class="templateColumnContainer" width="35%">
  //                     <table border="0" cellpadding="5" cellspacing="0" width="100%">
  //                         <tr>
  //                             <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
  //                                 <span style="display: block;">${param.paymentDetail.status}</span>
  //                             </td>
  //                         </tr>
  //                     </table>
  //                 </td>
  //             </tr>
  //         </table>
  //     </td>
  // </tr>`

  content += `<tr>
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
                            </tr>`;
  for (let index = 0; index < param.traveler.length; index++) {
    const traveler = param.traveler[index];
    content += `<tr>
                                <td class="templateColumnContainer" width="15%">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="leftColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">1</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td class="templateColumnContainer" width="25%">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">viral mithani</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td class="templateColumnContainer" width="25%">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">viral@gmail.com</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td class="templateColumnContainer" width="35%">
                                    <table border="0" cellpadding="5" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" class="rightColumnContent" style="font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;">
                                                <span style="display: block;">adult</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>`;
  }

  content += `    
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table border="1" cellpadding="3" cellspacing="0" width="600" style="border: 1px solid #dddddd; margin-top: 15px; font-weight: 300; font-size: 12px; font-family: 'Poppins', sans-serif;"
                            id="templateColumns">
                            <tr>
                                <td><span style="font-weight: 500; font-size: 13px; padding-right:10px; color: #000000; font-family: 'Poppins', sans-serif;">Booking ID:</span></td>
                                <td><span style="font-weight: 500; font-size: 13px; padding-right:10px; color: #000000; font-family: 'Poppins', sans-serif;">${param.cart.cartId}</span></td>
                            </tr>
                            <tr>
                                <td><span style="font-weight: 500; font-size: 13px; padding-right:10px; color: #000000; font-family: 'Poppins', sans-serif;">Total Price:</span></td>
                                <td><span style="font-weight: 500; font-size: 13px; padding-right:10px; color: #000000; font-family: 'Poppins', sans-serif;">${param.cart.totalAmount}</span></td>
                            </tr>`;
  if (param.cart.totalPaid) {
    content += `<tr>
                                <td><span style="font-weight: 500; font-size: 13px; padding-right:10px; color: #000000; font-family: 'Poppins', sans-serif;">Total Paid:</span></td>
                                <td><span style="font-weight: 500; font-size: 13px; padding-right:10px; color: #000000; font-family: 'Poppins', sans-serif;">${param.cart.totalPaid}</span></td>
                            </tr>
                            <tr>
                                <td><span style="font-weight: 700; font-size: 13px; padding-right:10px; color: #000000;  font-family: 'Poppins', sans-serif;">Blance Due:</span></td>
                                <td><span style="font-weight: 700; font-size: 13px; padding-right:10px; color: #000000;  font-family: 'Poppins', sans-serif;">${param.cart.rememberAmount}</span></td>
                            </tr>`;
  }
  content += `
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table border="1" cellpadding="3" cellspacing="0" width="600" style="border: 1px solid #dddddd; font-weight: 300; font-size: 11px; font-family: 'Poppins', sans-serif;"
                            id="templateColumns">
                            <tr>
                                <td>Refer your eTicket for detailed flight itinerary, fare rules & baggage policy.</td>
                                If you have any questions please contact <a href = 'mailto:customerservice@laytrip.com'
                        style="color: #f725c5;"><u>customerservice@laytrip.com</u></a>
                                </tr>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </td>
</tr>`;
  return LaytripHeader + content + LaytripFooter;
}
