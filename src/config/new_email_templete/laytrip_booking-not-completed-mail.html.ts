import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl, FrontEndUrl } from "../base-url";

export function BookingNotCompletedMail(param: { userName: string }) {
  const content = `
                                <tr>
                                    <td align="left" valine="top" style="padding: 20px 25px 10px; background: #ffffff;">
                                        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="left" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 24px; color: #000000; padding-top: 15px; text-align: left;">Hi ${param.userName},</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                                                        Unfortunately we were unable to process your booking. You will not be charged for this attempt. Please return to <a href = '${FrontEndUrl}'
                                                        style="color: #0c7bff;"><u>Laytrip.com</u></a> and try again or if you have questions, contact us at <a href = 'mailto:customerservice@laytrip.com'
                                                        style="color: #0c7bff;"><u>customerservice@laytrip.com</u></a>.
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
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top:0px; text-align: left;">Sincerely,</td>
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
