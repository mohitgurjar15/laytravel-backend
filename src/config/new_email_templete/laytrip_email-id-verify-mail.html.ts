import { LaytripHeader } from "./laytrip_header.html";
import {  LaytripFooter} from "./laytrip_footer.html";
import { BaseUrl } from "../base-url";

export function LaytripVerifyEmailIdTemplete(param:{ username:string , otp:number })
{
const content = `
                                <tr>
                                    <td align="center" valine="top" style="padding: 20px 25px 10px; background: #ffffff;">
                                        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                                                        To complete your Sign Up, please verify below otp with your email address. 
                                                    </td>
                                                </tr>
                                                
                                                <tr>
                                                    <td align="center" valign="top" style="padding-top: 20px;">
                                                        <table class="oc_wrapper" border="0" cellspacing="0" cellpadding="0" align="center">
                                                            <tr>
                                                                <td mc:edit="text4" align="center" valign="middle" height="50" style="background-color: #1943FF;  font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: bold; color: #ffffff; border-radius: 4px;"><a style="display: block; text-decoration: none; padding: 0px 20px;  line-height: 48px; color: #ffffff;">Your OTP - ${param.otp}</a></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                                                    If you have any questions, please contact us at <a href = 'mailto:customerservice@laytrip.com'
                                                    style="color: #f725c5;"><u>customerservice@laytrip.com</u></a>.
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