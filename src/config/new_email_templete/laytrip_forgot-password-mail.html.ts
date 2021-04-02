import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl } from "../base-url";

export function LaytripForgotPasswordMail(param: {
  username: string;
  otp: number;
}) {
  const content = `<tr>
<td align="center" valine="top" style="padding: 20px 25px 10px; background: #ffffff;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
        <tbody>
            <tr>
                <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding-top: 15px; text-align: left;">
                  Hi ${param.username},
                </td>
            </tr>
            <tr>
                 <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding-top: 15px; text-align: left;">
                    Per your request to reset your password, your One Time Pin is ${param.otp}. When prompted by the platform enter this OTP, which will be valid for the next 3 minutes. 
                 </td>
            </tr>
            <tr>
                 <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding-top: 15px; text-align: left;">
                    If you did not request a password reset, please ignore this email or contact us at  <a href = 'mailto:customerservice@laytrip.com'
                    style="color: #707070;">customerservice@laytrip.com</a>.               
                 </td>
            </tr>
        </tbody>
    </table>
</td>
</tr><br>
<tr>
<td align="center" valine="top" style="padding: 5px 25px 10px; background: #ffffff;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
        <tbody> 
            <tr>
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding-top:15px; text-align: left;">Sincerely,</td>
            </tr>
            <tr>
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding-top:5px; text-align: left;"><a href = 'mailto:customerservice@laytrip.com'>Laytrip Customer Service</a></td>
            </tr>
        </tbody>
    </table>
</td>
</tr>                              
`;
  return LaytripHeader + content + LaytripFooter;
}
