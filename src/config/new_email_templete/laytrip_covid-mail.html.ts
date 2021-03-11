import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl, covidLink } from "../base-url";

export function LaytripCovidUpdateMail(param: { username: string }) {
  const content = `
                                <tr>
                                    <td align="center" valine="top" style="padding: 10px 15px 30px; background: #ffffff;">
                                        <table class="oc_wrapper" width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 24px; color: #707070; padding-top: 15px; text-align: left;">Hi ${param.username},</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                                                            Covid-19 Update! 
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top: 15px; text-align: left;">
                                                        Please review our new Covid Update at <a href = '${covidLink}'
                    style="color: #f725c5;"><u>laytrip.com/covid-19</u></a>. Also, visit your Travel Provider directly for additional Covid-19 information prior to your trip departure.
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
`;
  return LaytripHeader + content + LaytripFooter;
}
