import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl, reviewLink } from "../base-url";

export function HowDidWeDoMail(
    param: { username: string; bookingId: string },
    referral_id: string = ""
) {
    const content = `
                                <tr>
                                    <td align="center" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
                                        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #000000; text-align: left; font-weight: 600;">Hi ${
                                            param.username
                                        },</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                      Thank you for booking your travel with us! Please let us know how we did by providing a quick review: 
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                    <a href = '${reviewLink +
                                                        param.bookingId}${
        referral_id
            ? "?utm_source=" + referral_id + "&utm_medium=landingpage"
            : ""
    }'style="color: #F826C1;">Review</a>
                                                    </td>
                                                </tr>
                                                

                                                        
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                        Want to share your travel experience with other Laytrippers? Click the social icons below, and tag #laytrip.
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
