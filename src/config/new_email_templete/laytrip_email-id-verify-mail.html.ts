import { LaytripHeader } from "./laytrip_header.html";
import {  LaytripFooter} from "./laytrip_footer.html";
import { BaseUrl } from "../base-url";

export function LaytripVerifyEmailIdTemplete(
           param: { username: string; otp: number },
           referral_id: string = ""
       ) {
           const content = `
                                <tr>
                                    <td align="center" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
                                        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                        To complete your Sign Up, please enter the following one-time-pin into your Sign Up form. 
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #000000; font-weight: 600;; text-align: left;">
                                                        <b>ONE TIME PIN : ${param.otp}</b>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                    If you have any questions, please contact us at <a href = 'mailto:customerservice@laytrip.com'
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