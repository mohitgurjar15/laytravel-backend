import { LaytripHeader } from "./laytrip_header.html";
import { LaytripFooter } from "./laytrip_footer.html";

export function EnquiryNotificationHTML(
           param: { name: string; message: any; id: string }
           
       ) {
           const content = `
<!-- header Text section start -->
<table width="100%" border="0" cellspacing="0" cellpadding="0"  style="background: #f2f2f2;" class="full-wrap">
    <tr>
        <td align="center" valign="top">
            <table align="center" style="width:600px; max-width:600px; table-layout:fixed;" class="oc_wrapper" width="600" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" valine="top" style="background-color: #707070;">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 600px;" class="oc_wrapper">
                            <tbody>
                                <tr>
                                    <td align="center" valine="top" style="padding: 10px 15px 30px; background: #ffffff;">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 22px; line-height: 24px; color: #444; font-weight:700; padding-top: 15px; text-align: center;">New Enquiry Found</td>
                                                </tr>

                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 18px; color: #707070;padding-top: 15px; text-align: center;">
                                                        <span style="text-decoration: none; color: #707070;">${param.name}</span> is add new enquiry
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 18px; color: #707070;padding-top: 15px; text-align: center;"><b>Enquiry ID: </b>${param.id}</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 18px; line-height: 18px; color: #707070;padding-top: 15px; text-align: center;"><b>Message: </b>${param.message}</td>
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