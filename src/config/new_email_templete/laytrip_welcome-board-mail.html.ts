import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { FrontEndUrl } from "../base-url";

export function LaytripWelcomeBoardMail() {
  const content = `<tr>
                                        <td align="center" valine="top" style="padding: 10px 15px 30px; background: #ffffff;">
                                            <table class="oc_wrapper" width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                                <tbody>
                                                    <tr>
                                                        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">
                                                          Welcome to the Laytrip Community! On our one-stop travel platform, you can search and book any combination of countless real-time flights, hotels, home, and car rentals then pay with our flexible installment plans.
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                         <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">
                                                            We provide <b style="font-family: 'bold'; font-weight:800; font-size: 14px; "> real-time access </b> to <b style="font-family: 'bold'; font-weight:800;font-size: 14px; ">  industry-best pricing </b> so you no longer have to shop countless sites, and we offer <b style="font-family: 'bold'; font-weight:800;font-size: 14px; "> customizable layaway installment plans, with no interest and no credit check </b> to make all your travel now affordable. 
                                                         </td>
                                                    </tr>
                                                    <tr>
                                                         <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">
                                                            We're looking forward to serving you as your one-stop travel LTA (Layaway Travel Agency).      
                                                         </td>
                                                    </tr>
                                                    <tr>
                                                         <td align="center" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                            <a href = '${FrontEndUrl}'
                                                            style="color: #f725c5;"><u>SEARCH TRAVEL</u></a>.              
                                                         </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>                               
 `;
  return LaytripHeader + content + LaytripFooter;
}
