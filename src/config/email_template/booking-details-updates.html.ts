import { EmailHeader } from "./header.html";
import {  EmailFooter} from "./footer.html";
import { BaseUrl } from "../base-url";

export function BookingDetailsUpdateMail(param:{ username:string  })
{
const content = `<!-- header Text section start -->
<table width="100%" border="0" cellspacing="0" cellpadding="0"  style="background: #f2f2f2;" class="full-wrap">
    <tr>
        <td align="center" valign="top">
            <table align="center" style="width:600px; max-width:600px; table-layout:fixed;" class="oc_wrapper" width="600" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" valine="top" style="background-color: #ffffff;">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 600px;" class="oc_wrapper">
                            <tbody>
                                <tr>
                                    <td align="center" valine="top" style="padding: 10px 15px 30px; background: #ffffff;">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 22px; line-height: 24px; color: #444; font-weight:700; padding-top: 15px; text-align: center;">Booking Details Updates</td>
                                                </tr>

                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                        <span style="text-decoration: none; color: #000;">${param.username ? param.username : '' }</span> it looks like your reservation details have been updated. Please review the following information:
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">*updated booking details with updates highlighted**</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">If you are not satisfied with the updates or would like to cancel your booking, please visit our booking & cancellation policy page. If you have any additional questions, please contact us at @@ with the “Booking Details Updates” subject line.</td>
                                                </tr>

                                                <tr>
                                                    <td style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #808080;padding-top: 20px; text-align: center;" valign="top" align="left">
                                                        <span style="font-weight: bold; font-size: 18px; line-height: 21px; color: #444444;">Thank you,</span> <br>
                                                        The Laytrip Team
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
<!-- header text section End -->

`;
return EmailHeader + content + EmailFooter;
}