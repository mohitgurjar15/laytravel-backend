import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl, reviewLink } from "../base-url";

export function HowDidWeDoMail(param: { username: string; bookingId: string }) {
    const content = `
                                <tr>
                                    <td align="center" valine="top" style="padding: 20px 25px 10px; background: #ffffff;">
                                        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding-top: 15px; text-align: left;">Hi ${
                                                        param.username
                                                    },</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                                                      Thank you for booking your travel with us! Please let us know how we did by providing a quick review: 
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" valign="top" style="padding-top: 20px;">
                                                        <table class="oc_wrapper" border="0" cellspacing="0" cellpadding="0" align="center">
                                                            <tr>
                                                                <td align="center" valign="middle" style="font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: bold; " height="48">
                                        <a class="" style="color: #0c7bff;" href = '${reviewLink +
                                            param.bookingId}'>REVIEW</a>
                                    </td>

                                                            </tr>

                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                                                        Want to share your travel experience with other Laytrippers? Click the social icons below, and tag #laytrip.
                                                    </td>
                                                </tr>													
                                            </tbody>
                                        </table>
                                    </td>
                                </tr><tr>
<td align="center" valine="top" style="padding: 5px 25px 10px; background: #ffffff;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
        <tbody> 
            <tr>
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top:0px; text-align: left;">Sincerely</td>
            </tr>
            <tr>
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #0043ff;padding-top:5px; text-align: left;"><a href = 'mailto:customerservice@laytrip.com'>Laytrip Customer Service</a></td>
            </tr>
        </tbody>
    </table>
</td>
</tr>
`;
    return LaytripHeader + content + LaytripFooter;
}
