import { EmailNotificationModel } from "../email_template/model/notification.model";
import { notificationHeader } from "./notification-header.html";
import { notificationFooter } from "./notification-footer.html";
import { bookingDetailUrl, NewEmailAssets } from "../base-url";

export async function BookingRunoutNotificationMail(param: EmailNotificationModel) {
    let content = `
<tr>
    <td align="left" valign="top"
        style="font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; display: block; line-height: 20px; color: #000000; text-align: left;">
        BOOKING #${param.laytripBookingId}
    </td>
</tr>
<tr>
    <td align="center" valign="top"
        style="font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; display: block; line-height: 20px; color: #000000; text-align: left;">
       A <span style="font-weight: 600; color: #000000; ">${param.routeType ||
           "null"} route</span> (${
        param.flightRoute
    }) that was supposed to depart on ${param.depatureDate} ran out of seats.
    </td>
</tr>

<tr>
    <table align="left"
        style="width:100%; max-width100%; table-layout:fixed; background: #ffffff;"
        class="oc_wrapper" width="600" border="0" cellspacing="0" cellpadding="0">
        <tbody>
            
            <tr>
                <td align="left" valign="top"
                    style="width:30%; font-family: 'Poppins', sans-serif; font-weight: 600;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    Departure date:</td>
                <td align="left" valign="top"
                    style="width:70%; font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    in ${param.remainDays} days (${param.depatureDate})</td>
            </tr>
            <tr>
                <td align="left" valign="top"
                    style="width:30%; font-family: 'Poppins', sans-serif; font-weight: 600;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    Reservation Deadline:</td>
                <td align="left" valign="top"
                    style="width:70%; font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    ${param.reservationDeadline}</td>
            </tr>
            <tr>
                <td align="left" valign="top"
                    style="width:30%; font-family: 'Poppins', sans-serif; font-weight: 600;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    Route: </td>
                <td align="left" valign="top"
                    style="width:70%; font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    ${param.flightRoute} (${param.routeType})</td>
            </tr>
            <tr>
                <td align="left" valign="top"
                    style="width:30%; font-family: 'Poppins', sans-serif; font-weight: 600;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    Sale Price to Customer at Booking:</td>
                <td align="left" valign="top"
                    style="width:70%; font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                   ${param.currencySymbol}${param.sellingPrice}</td>
            </tr>
            <tr>
                <td align="left" valign="top"
                    style="width:30%; font-family: 'Poppins', sans-serif; font-weight: 600;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    Supplier Cost at Customer Booking:</td>
                <td align="left" valign="top"
                    style="width:70%; font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                   ${param.currencySymbol}${param.netRate} </td>
            </tr>
            `;

            if(param.lastPrice){
                content +=`
            <tr>
                <td align="left" valign="top"
                    style="width:30%; font-family: 'Poppins', sans-serif; font-weight: 600;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    Last Available Supplier Cost:</td>
                <td align="left" valign="top"
                    style="width:70%; font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                   ${param.currencySymbol}${param.lastPrice} </td>
            </tr>`

            }

            content += `<tr>
                <td align="left" valign="top"
                    style="width:30%; font-family: 'Poppins', sans-serif; font-weight: 600;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    Total Received:</td>
                <td align="left" valign="top"
                    style="width:70%; font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                   ${param.currencySymbol}${param.totalRecivedFromCustomer} (${
                param.totalRecivedFromCustomerPercentage
            }%)</td>
            </tr>
        </tbody>
    </table>
</tr>
<tr>
    <td align="center" valign="top"
        style="font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; display: block; line-height: 20px; color: #000000; text-align: left;">
       Please contact customer service to ensure the customer gets notified of this event.
    </td>
</tr>

<tr>
    <td align="left" valign="top"
        style=" display: block; font-family: 'Poppins', sans-serif; font-weight: 600;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #0026fc; text-align: left; margin-left:20%">
        <a href="${bookingDetailUrl}${
                param.laytripBookingId
            }">Go to reservation</a>
    </td>
</tr>`;
    return notificationHeader + content + notificationFooter;
}
