import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { FrontEndUrl } from "../base-url";

export function LaytripWelcomeBoardMail() {
  const content = `<tr>
                                        <td align="center" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                                <tbody>
                                                    <tr>
                                                        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding-top: 15px; text-align: left;">
                                                          Welcome to the Laytrip Community! On our one-stop travel platform, you can search and book any combination of countless real-time flights, hotels, home, and car rentals then pay with our flexible installment plans.
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                         <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding-top: 15px; text-align: left;">
                                                            We provide <span  style="color: #000000">real-time access</span> to  <span  style="color: #000000">industry-best pricing</span> so you no longer have to shop countless sites, and we offer <span  style="color: #000000">customizable layaway installment plans, with no interest and no credit check</span> to make all your travel now affordable. 
                                                         </td>
                                                    </tr>
                                                    <tr>
                                                         <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding-top: 15px; text-align: left;">
                                                            We're looking forward to serving you as your one-stop travel LTA (Layaway Travel Agency)!   
                                                         </td>
                                                    </tr>
                                                    <tr>
                                                         <td align="center" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 18px; line-height: 25px; color: #707070;padding: 25px 0 25px 0; text-align: center;">
                                                            <a href = '${FrontEndUrl}'
                                                            style="color: #f725c5;">Search Travel</a>            
                                                         </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>                               
 `;
  return LaytripHeader + content + LaytripFooter;
}
