import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl } from "../base-url";

export function LaytripCompletedTripReminderMail(param: { username: string }) {
    const content = `
                                <tr>
                                    <td align="center" valine="top" style="padding: 10px 15px 15px; background: #ffffff;">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">Hi ${param.username},</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                                                      Thank you for booking your travel with us! Please let us know how we did by providing a quick review: 
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" valign="top" style="padding-top: 20px;">
                                                        <table border="0" cellspacing="0" cellpadding="0" align="center">
                                                            <tr>
                                                                <td mc:edit="text4" align="center" valign="middle" height="50" style="background-color: #1943FF;  font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: bold; color: #ffffff; border-radius: 4px;"><a style="display: block; text-decoration: none; padding: 0px 20px;  line-height: 48px; color: #ffffff;">Review</a></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                                                        Want to share your trip with other Laytripers? Click the social icons below, and don’t forget to tag #laytrip.
                                                    </td>
                                                </tr>													
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
`;
    return LaytripHeader + content + LaytripFooter;
}