import { EmailNotificationModel } from "../email_template/model/notification.model";
import { notificationHeader } from "./notification-header.html";
import { notificationFooter } from "./notification-footer.html";
import { bookingDetailUrl, NewEmailAssets } from "../base-url";
import { Generic } from "src/utility/generic.utility";

export async function AdminNewBookingMail(param: EmailNotificationModel) {
let content = `
<tr>
    <td align="left" valign="top"
        style="font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; display: block; line-height: 20px; color: #000000; text-align: left;">
        BOOKING #${param.laytripBookingId}
    </td>
</tr>
<tr>
    <table align="center"
        style="width:100%; max-width:100%; table-layout:fixed; background: #ffffff;"
        class="oc_wrapper" width="600" border="0" cellspacing="0" cellpadding="0">
        <tbody>
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
                    Sale Price to Customer at Booking:</td>
                <td align="left" valign="top"
                    style="width:70%; font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                   ${param.currencySymbol}${Generic.formatPriceDecimal(param.sellingPrice)}</td>
            </tr>
            <tr>
                <td align="left" valign="top"
                    style="width:30%; font-family: 'Poppins', sans-serif; font-weight: 600;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    Supplier Cost at Customer Booking:</td>
                <td align="left" valign="top"
                    style="width:70%; font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                   ${param.currencySymbol}${Generic.formatPriceDecimal(param.netRate)} </td>
            </tr>
            <tr>
                <td align="left" valign="top"
                    style="width:30%; font-family: 'Poppins', sans-serif; font-weight: 600;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    Supplier Cost Today:</td>
                <td align="left" valign="top"
                    style="width:70%; font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                   ${param.currencySymbol}${Generic.formatPriceDecimal(param.todayNetPrice)} (${
    param.todayNetpriceVarient
}% <img src="${
    param.todayNetpriceVarient > 0
        ? NewEmailAssets + "/up.svg"
        : NewEmailAssets + "/down.svg"
}">)</td>
            </tr>
            <tr>
                <td align="left" valign="top"
                    style="width:30%; font-family: 'Poppins', sans-serif; font-weight: 600;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                    Total Received from Customer:</td>
                <td align="left" valign="top"
                    style="width:70%; font-family: 'Poppins', sans-serif; font-weight: 100;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #000000; text-align: left;">
                   ${param.currencySymbol}${Generic.formatPriceDecimal(param.totalRecivedFromCustomer)} (${
    param.totalRecivedFromCustomerPercentage
}%)</td>
            </tr>
        </tbody>
    </table>
</tr>
<tr>
    <td align="left" valign="top"
        style=" display: block; font-family: 'Poppins', sans-serif; font-weight: 600;font-size: 18px; padding: 0 25px 10px; line-height: 20px; color: #0026fc; text-align: left; margin-left:20%">
        <a href="${bookingDetailUrl}${
    param.laytripBookingId
}">Go to reservation</a>
    </td>
</tr>`;
return notificationHeader + content + notificationFooter
}