import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";

export function TripfluencerEnquiryHTML(
           param: { name: string;  email: any ,Tripfulencer : any}
           
       ) {
           const content = `
            <tr>
<td align="center" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
        <tbody>
            <tr>
                <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #000000; font-weight: 600;; text-align: left; font-weight: 600;">
                  Hi There,
                </td>
            </tr>
            <tr>
                 <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                                        New Inquiry from Tripfluencer
                 </td>
            </tr>
            
             <tr>
                 <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                    <span  style="color: #000000; font-weight: 600;">
                        Name:
                        </span>
                        <span style="font-size: 18px" >
                        ${param.name}
                        </span>
                 </td>
            </tr>
             <tr>
                 <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                  <span  style="color: #000000; font-weight: 600;">
                        Email:
                        </span>
                        <span style="font-size: 18px" >
                        ${param.email}
                        </span>
                 </td>
            </tr>
             <tr>
                 <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                    <span  style="color: #000000; font-weight: 600;">
                        Social Username:
                        </span>
                        <span style="font-size: 18px" >
                        ${param.Tripfulencer}
                        </span>
                 </td>
            </tr>
        </tbody>
    </table>
</td>
</tr>
`;
           return LaytripHeader + content + LaytripFooter('');
       }