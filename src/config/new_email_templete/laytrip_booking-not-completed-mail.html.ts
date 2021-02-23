import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl } from "../base-url";

export function BookingNotCompletedMail(param:{ userName:string })
{
const content = `
                                <tr>
                                    <td align="center" valine="top" style="padding: 10px 15px 30px; background: #ffffff;">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 24px; color: #000; padding-top: 15px; text-align: left;">Hi ${param.userName}</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" style="font-family: 'Open Sans', sans-serif;font-size: 22px; line-height: 24px; color: #444; font-weight:700; padding-top: 15px; text-align: center;">Hi ${param.userName}</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                        Unfortunately we were unable to process your booking. You will not be charged for this attempt. Please return to Laytrip.com and try again or if you have questions, contact us at customerservice@laytrip.com.
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
`;
return LaytripHeader + content + LaytripFooter;
}