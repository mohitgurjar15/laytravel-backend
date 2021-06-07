import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";
import { FrontEndUrl } from "../base-url";

export function LaytripWelcomeBoardMail(referral_id:string = '') {
  const content = `<tr>
                                        <td align="center" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                                <tbody>
                                                    <tr>
                                                        <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                          Welcome to the Laytrip Community! On our one-stop travel platform, you can search and book any combination of countless real-time flights, hotels, home, and car rentals then pay with our flexible installment plans.
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                         <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                            We provide <span  style="color: #000000; font-weight: 600;">real-time access</span> to  <span  style="color: #000000; font-weight: 600;">industry-best pricing</span> so you no longer have to shop countless sites, and we offer <span  style="color: #000000; font-weight: 600;">customizable layaway installment plans, with no interest and no credit check</span> to make all your travel now affordable. 
                                                         </td>
                                                    </tr>
                                                    <tr>
                                                         <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                                            We're looking forward to serving you as your one-stop travel LTA (Layaway Travel Agency)!   
                                                         </td>
                                                    </tr>
                                                    <tr>
                                                         <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: center;">
                                                            <a href = '${FrontEndUrl}${
      referral_id
          ? "?utm_source=" + referral_id + "&utm_medium=landingpage"
          : ""
  }'
                                                            style="color: #f725c5;">Search Travel</a>            
                                                         </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>                               
 `;
  return LaytripHeader + content + LaytripFooter(referral_id);
}
