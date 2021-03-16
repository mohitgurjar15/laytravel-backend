import { FrontEndUrl } from "../base-url";
import { LaytripFooter } from "./laytrip_footer.html";
import { LaytripHeader } from "./laytrip_header.html";

export function NewsLetterMail() {
const content = `<tr>
 <td align="center" valine="top" style="padding: 20px 25px 0px; background: #ffffff;">
     <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
         <tbody>
             <tr>
                 <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 20px; color: #707070;padding: 0 0 20px 0; text-align: left;">Welcome to the Laytrip Community! </td>
             </tr>
             <tr>
                 <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 20px; color: #707070;padding: 0 0 20px 0; text-align: left;">We provide <span style = "color: #000000">Real-time access to Industry-Best Pricing</span> so you would no longer have to shop countless sites and we offer Flexible Layaway Payment Plans to make all your travel now affordable. Choose from <span style = "color: #000000">customizable installment pay options with no-interest and no credit check</span> at Checkout!</td>
             </tr>
             <tr>
                 <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 20px; color: #707070;padding: 0 0 20px 0; text-align: left;">We will be providing you email information about our launch soon, stay tuned. </td>
             </tr>
         </tbody>
     </table>
 </td>
</tr>`;
    return LaytripHeader + content + LaytripFooter;
}