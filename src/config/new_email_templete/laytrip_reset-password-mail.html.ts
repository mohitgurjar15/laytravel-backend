import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl } from "../base-url";

export function LaytripResetPasswordMail(param: { username: string }) {
  const content = `<tr>
                                    <td align="center" valine="top" style="padding: 10px 15px 30px; background: #ffffff;">
                                        <table class="oc_wrapper" width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 24px; color: #707070; padding-top: 15px; text-align: left;">Hi ${param.username},</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align:left;">
                                                        Your password has been reset. If you did not request this reset please contact <a href = 'mailto:customerservice@laytrip.com'
                                                        style="color: #f725c5;"><u>customerservice@laytrip.com</u></a>.
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
`;
  return LaytripHeader + content + LaytripFooter;
}
