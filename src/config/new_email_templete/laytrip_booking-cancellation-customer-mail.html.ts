import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl, TermsConditonLink } from "../base-url";

export function LaytripBookingCancellationCustomerMail(param: {
  username: string;
  bookingId;
}) {
  const content = `
<tr>
    <td align="left" valine="top" style="padding: 25px 25px 10px; background: #ffffff;">
        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
            <tbody>
                <tr>
                    <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color:#000000;padding-top: 15px; text-align: left;">Hi ${param.username},</td>
                </tr><br>
                <tr>
                    <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding-top: 15px; text-align: left;">
                    Booking ID ${param.bookingId} Cancellation Confirmation!  
                    </td>
                </tr><br>
                <tr>
                    <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding-top: 15px; text-align: left;">
                        If any refund is applicable per our <a href = '${TermsConditonLink}'
                         style="color: #0C7BFF;">Terms</a> your original payment method will be refunded. 
                    </td>
                </tr><br>
                <tr>
                    <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding-top: 15px; text-align: left;">
                         If you have any questions, please contact us at <a href = 'mailto:customerservice@laytrip.com'
                         style="color: #0C7BFF;">customerservice@laytrip.com</a>. We hope you will try booking with us again in the future.                                              
                    </td>
                </tr><br>													
            </tbody>
        </table>
    </td>
</tr>
<tr>
<td align="center" valine="top" style="padding: 10px 25px 10px; background: #ffffff;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
        <tbody> 
            <tr>
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding-top:15px; text-align: left;">Sincerely,</td>
            </tr>
            <tr>
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #0043FF;padding-top:5px; text-align: left;"><a href = 'mailto:customerservice@laytrip.com' style:"color:#0043FF">Laytrip Customer Service</a></td>
            </tr>
        </tbody>
    </table>
</td>
</tr>
`;

  return LaytripHeader + content + LaytripFooter;
}
