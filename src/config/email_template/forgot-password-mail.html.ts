import { EmailHeader } from "./header.html";
import {  EmailFooter} from "./footer.html";
import { BaseUrl } from "../base-url";

export function forgotPasswordMail(param:{ username:string , link:string })
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
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 22px; line-height: 24px; color: #444; font-weight:700; padding-top: 15px; text-align: center;">Password Reset</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">You're receiving this email because you requested a password reset for your user account at Laytrip.</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                        If you didn't request this change, you can disregard this email - we have not yet reset your password.
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" valign="top" style="padding-top: 20px;">
                                                        <table border="0" cellspacing="0" cellpadding="0" align="center">
                                                            <tr>
                                                                <td mc:edit="text4" align="center" valign="middle" height="50" style="background-color: #1943FF;  font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: bold; color: #ffffff; border-radius: 4px;"><a href="{{loginLink}}" target="_blank" style="display: block; text-decoration: none; padding: 0px 20px;  line-height: 48px; color: #ffffff;">Change Password</a></td>
                                                            </tr>
                                                        </table>
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