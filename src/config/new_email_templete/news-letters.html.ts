import { FrontEndUrl } from "../base-url";
import { LaytripFooter } from "./laytrip_footer.html";
import { LaytripHeader } from "./laytrip_header.html";

export function NewsLetterMail() {
const content = `<tr>
 <td align="center" valine="top" style="padding: 38px 25px 0px; background: #ffffff;">
     <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
         <tbody>
             <tr>
                 <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">Welcome to the Laytrip Community! </td>
             </tr>
             <tr>
                 <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">We provide <span  style="color: #000000; font-weight: 600;">real-time access to industry-best pricing</span> so you no longer have to shop countless sites. We offer layaway plans that you can choose from <span  style="color: #000000; font-weight: 600;">customizable installment options</span> with <span  style="color: #000000; font-weight: 600;">no interest and no credit check</span> at Checkout!</td>
             </tr>
             <tr>
                 <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">We will be providing you email information about our launch soon, stay tuned. </td>
             </tr>
         </tbody>
     </table>
 </td>
</tr>`;
    return LaytripHeader + content + LaytripFooter;
}