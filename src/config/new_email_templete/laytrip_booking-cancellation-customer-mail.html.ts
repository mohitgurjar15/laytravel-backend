import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl, TermsConditonLink } from "../base-url";

export function LaytripBookingCancellationCustomerMail(param: {
  username: string;
  bookingId;
}) {
  const content = `
<tr>
    <td align="left" valine="top" style="padding: 20px 25px 10px; background: #ffffff;">
        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
            <tbody>
                <tr>
                    <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color:#000000;padding-top: 15px; text-align: left;">Hi ${param.username},</td>
                </tr>
                <tr>
                    <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                    Booking ID ${param.bookingId} Cancellation Confirmation!  
                    </td>
                </tr>  
                <tr>
                    <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                        If any refund is applicable per our <a href = '${TermsConditonLink}'
                         style="color: #f725c5;"><u>Terms</u></a> your original payment method will be refunded. 
                    </td>
                </tr>
                <tr>
                    <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                         If you have any questions, please contact us at <a href = 'mailto:customerservice@laytrip.com'
                         style="color: #f725c5;"><u>customerservice@laytrip.com</u></a>. We hope you will try booking with us again in the future.                                              
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
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top:0px; text-align: left;">Sincerely</td>
            </tr>
            <tr>
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #0942ff;padding-top:5px; text-align: left;"><a href = 'mailto:customerservice@laytrip.com'>Laytrip Customer Service</a></td>
            </tr>
        </tbody>
    </table>
</td>
</tr>
`;

  return LaytripHeader + content + LaytripFooter;
}
