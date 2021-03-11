import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl } from "../base-url";

export function LaytripInquiryAutoReplayMail(param:{ username:string })
{
const content = `
<tr>
    <td align="center" valine="top" style="padding: 10px 15px 30px; background: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
            <tbody>
                <tr>
                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                        Thank you for contacting Laytrip Customer Service. A member of our team will get back to you within 24 hours.
                    </td>
                </tr>
            </tbody>
        </table>
    </td>
</tr>
`;
return LaytripHeader + content + LaytripFooter;
}