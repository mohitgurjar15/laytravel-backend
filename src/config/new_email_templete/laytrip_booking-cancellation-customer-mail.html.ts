import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl } from "../base-url";

export function LaytripBookingCancellationCustomerMail(param: { username: string, bookingId }) {
    const content = `
<tr>
    <td align="left" valine="top" style="padding: 10px 15px 15px; background: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
            <tbody>
                <tr>
                    <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">Hi ${param.username},</td>
                </tr>
                <tr>
                    <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">
                    Booking ID ${param.bookingId} Cancellation Confirmation!  
                    </td>
                </tr>  
                <tr>
                    <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">
                        Your payment method will be refunded in accordance with our Laytrip Policy.   
                    </td>
                </tr>
                <tr>
                    <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">
                         If you have any questions, please contact us at customerservice@laytrip.com. We hope you will try booking with us again in the future.                                              
                    </td>
                </tr>													
            </tbody>
        </table>
    </td>
</tr>
`;

    return LaytripHeader + content + LaytripFooter;
}