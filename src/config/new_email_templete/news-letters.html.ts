import { FrontEndUrl } from "../base-url";
import { LaytripFooter } from "./laytrip_footer.html";
import { LaytripHeader } from "./laytrip_header.html";

export function NewsLetterMail() {
const content = `<tr>
 <td align="center" valine="top" style="padding: 20px 25px 10px; background: #ffffff;">
     <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
         <tbody>
             <tr>
                 <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding: 20px 0; text-align: left;">Welcome to the Laytrip Community! On our one-stop travel platform you can search and book any combination of countless of real-time flights, hotels, home, and car rentals then pay with our flexible installment plans.</td>
             </tr>
             <tr>
                 <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding: 20px 0; text-align: left;">We provide Real-time access to Industry-Best Pricing so you would no longer have to shop countless sites and we offer Flexible Layaway Payment Plans to make all your travel now affordable. Choose from customizable installment pay options with no-interest and no credit check at Checkout!</td>
             </tr>
             <tr>
                 <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding: 20px 0; text-align: left;"><a href="${FrontEndUrl}" target="_blank" style="font-family: 'Poppins', sans-serif; color: #0942ff;padding-top:5px; text-align: left;"><ul>Sign Up</ul></a> now with just your email address to start planning your travel now. We're looking forward to being your one-stop travel LTA (Layway Travel Agency)! </td>
             </tr>
         </tbody>
     </table>
 </td>
</tr>`
    return LaytripHeader + content + LaytripFooter;
}