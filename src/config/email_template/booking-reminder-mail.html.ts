import { EmailHeader } from "./header.html";
import {  EmailFooter} from "./footer.html";
import { BaseUrl } from "../base-url";

export function BookingReminderMail(param:{ username:string  })
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
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 22px; line-height: 24px; color: #444; font-weight:700; padding-top: 15px; text-align: center;">Hi, <a style="text-decoration: none; color: #000;">{{name}}</a></td>
                                                </tr>

                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                        We’re as excited about your upcoming trip to *this city* as you are. As a friendly reminder, your trip details are as follows:
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">*booking details*</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding: 15px 0; text-align: center;">You can view this information in your personal profile on laytrip.com and print the confirmation vouchers or add them to your phone’s wallet.</td>
                                                </tr>

                                                <tr>
                                                    <td style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding:25px; text-align: center; background: #fc7e66;" valign="top" align="left">
                                                        <a href="javascrip:void(0);" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #fff; font-weight:bold; text-decoration:underline;">Visit Personal Profile</a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">Hope you have a safe and amazing trip!</td>
                                                </tr>

                                                <tr>
                                                    <td style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #808080;padding-top: 20px; text-align: center;" valign="top" align="left">
                                                        <span style="font-weight: bold; font-size: 18px; line-height: 21px; color: #444444;">Best Regards,</span> <br>
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