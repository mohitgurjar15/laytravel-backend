import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl } from "../base-url";

export function LaytripPaymentMethodChangeMail(
           param: {
               username: string;
           },
           referral_id: string = ""
       ) {
           const content = `
                                <tr>
                                    <td align="center" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
                                        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #000000; text-align: left; font-weight: 600;">Hi ${param.username},</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                        Your payment method change has been updated on your Laytrip account.
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                        If you did not request this change please contact <a href = 'mailto:customerservice@laytrip.com'
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
</tr>
`;
           return LaytripHeader + content + LaytripFooter(referral_id);
       }
