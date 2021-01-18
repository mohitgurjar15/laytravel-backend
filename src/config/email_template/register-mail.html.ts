import { EmailHeader } from "./header.html";
import {  EmailFooter} from "./footer.html";
import { BaseUrl } from "../base-url";

export function RagisterMail(param:{ username:string},password= null)
{
var content = `<!-- header Text section start -->
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
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 22px; line-height: 24px; color: #444444;padding-top: 20px; text-align: center; font-weight: 700;">Welcome to Laytrip</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                        You’re the newest member of an inspirational worldwide community of travelers.
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                        <span style="font-weight:bold;">Explore endless possibilities now:</span>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td align="center" valign="top" style="padding-top: 15px;">
                                                        <table border="0" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td>
                                                                    <a href="javascrip:void(0);" target="_blank" style="text-decoration:none;">
                                                                    <img style="width:40px; height:40px;" src="${BaseUrl}/images/flight.png" alt="Flight">
                                                                </a>
                                                                </td>
                                                                <td width="15" style="width:15px;"></td>
                                                                <td>
                                                                    <a href="javascrip:void(0);" target="_blank" style="text-decoration:none;">
                                                                    <img style="width:40px; height:40px;" src="${BaseUrl}/images/hotel.png" alt="Flight">
                                                                </a>
                                                                </td>
                                                                <td width="15" style="width:15px;"></td>
                                                                <td>
                                                                    <a href="javascrip:void(0);" target="_blank" style="text-decoration:none;">
                                                                    <img style="width:40px; height:40px;" src="${BaseUrl}/images/vacation-rental.png" alt="Flight">
                                                                </a>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                        <span style="font-weight:bold;">Check out our member options:</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding: 15px 0; text-align: center;">
                                                        Guest, subscribed user, Tripfluencer
                                                    </td>
                                                </tr>`
                                                if(password){

                                                
                                                content += `
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding:25px; text-align: center; background: #fc7e66;">
															<a href="javascrip:void(0);" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #fff; font-weight:bold; text-decoration:underline;">Your Password is ${password}</a>
													</td>
		
                                                </tr>`

                                                }
                                                content += `
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                        <span style="font-style: italic;">Discover your next destination without stressing your wallet!</span>
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
</table>`;
return EmailHeader + content + EmailFooter;
}