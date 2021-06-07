import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl, FrontEndUrl } from "../base-url";

export function BookingNotCompletedMail(
           param: { userName: string },
           referral_id: string = ""
       ) {
           const content = `
                                <tr>
                                    <td align="left" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
                                        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="left" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #000000; text-align: left; font-weight: 600;">Hi ${
                                            param.userName
                                        },</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                        Unfortunately we were unable to process your booking. You will not be charged for this attempt. Please return to <a href = '${FrontEndUrl}${
               referral_id
                   ? "?utm_source=" + referral_id + "&utm_medium=landingpage"
                   : ""
           }'
                                                        style="color: #0C7BFF;">Laytrip.com</a> and try again or if you have questions, contact us at <a href = 'mailto:customerservice@laytrip.com'
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
