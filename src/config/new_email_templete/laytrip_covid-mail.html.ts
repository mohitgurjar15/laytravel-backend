import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl, covidLink } from "../base-url";

export function LaytripCovidUpdateMail(
           param: { username: string },
           referral_id: string = ""
       ) {
           const content = `
                                <tr>
                                    <td align="center" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
                                        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #000000; font-weight: 600;; text-align: left; font-weight: 600;">Hi ${
                                            param.username
                                        },</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                            Covid-19 Update! 
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                        Please review our new Covid Update at <a href = '${covidLink}${
               referral_id
                   ? "?utm_source=" + referral_id + "&utm_medium=landingpage"
                   : ""
           }'
                    style="color: #0C7BFF;">laytrip.com/covid-19</a>. Also, visit your Travel Provider directly for additional Covid-19 information prior to your trip departure.
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
