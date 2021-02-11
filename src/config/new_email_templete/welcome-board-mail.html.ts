import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { BaseUrl } from "../base-url";

export function WelcomeBoardMail(param: { username: string }) {
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
                                                        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 22px; line-height: 24px; color: #444; font-weight:700; padding-top: 15px; text-align: center;">Welcome To Laytrip!</td>
                                                    </tr>
                                                    <tr>
                                                        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                          Welcome to the Laytrip Community! On our one-stop travel platform, you can search and book any combination of countless real-time flights, hotels, home, and car rentals then pay with our flexible installment plans.
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                         <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                            We provide real-time access to industry-best pricing so you no longer have to shop countless sites, and we offer customizable layaway installment plans, with no interest and no credit check to make all your travel now affordable! 
                                                         </td>
                                                    </tr>
                                                    <tr>
                                                         <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                            We're looking forward to serving you as your one-stop travel LTA (Layaway Travel Agency)!               
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
    return LaytripHeader + content + LaytripFooter;
}