import { EmailHeader } from "./header.html";
import {  EmailFooter} from "./footer.html";
import { BaseUrl } from "../base-url";

export function missedPaymentInstallmentMail(param:{ username:string })
{
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
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 22px; line-height: 24px; color: #444; font-weight:700; padding-top: 15px; text-align: center;">Missed Partial Payment</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">We couldn’t process your payment</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                        <img src="Images/Failure.png" alt="Laytrip" width="100%" height="auto" border="0" style="display: inline-block; max-width: 100px; font-family: 'Open Sans', sans-serif;font-size: 18px; color: #fff; ">
                                                    </td>
                                                </tr>
                                                
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">Unfortunately, we couldn’t collect the payment from you. Some possible reasons might be:</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">
                                                        <ul style="margin:0; padding:0 0 0 15px;">
                                                            <li style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-bottom:5px;">A recent change in billing address</li>
                                                            <li style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-bottom:5px;">A billing error caused by your bank</li>
                                                            <li style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-bottom:5px;">Insufficient credit on your account </li>
                                                            <li style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-bottom:5px;">Expired credit card</li>
                                                        </ul>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding: 15px 0; text-align: left;">We understand it might be difficult to spot the problem at first, so we grant you 2 business days (5 business days) to resolve the issue</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding:25px; text-align: center; background: #fc7e66;">
                                                        <a href="javascrip:void(0);" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #fff; font-weight:bold; text-decoration:underline;">Update Payment Information</a>
                                                    </td>
                                                </tr>
                                                <!-- <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">
                                                        <a href="" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #1943ff; font-weight:bold;">Update Payment Information</a>
                                                    </td>
                                                </tr> -->
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">If after the granted period has passed and we still cannot successfully bill your credit card then your account might be suspended. We won’t be able to give you a refund, if booking has already been confirmed. However, if booking hasn’t been yet confirmed - your deposits will be converted to Laytrip points that you can use to book your future trips or use as discounts.</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">If you have any questions, please contact us at @@ with the “Partial Payment Failure” subject line.</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">Thank you for your attention to this matter!</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">Safe travels, <span style="display: block;">The Laytrip Team</span></td>
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
<!-- header text section End -->`;
return EmailHeader + content + EmailFooter;
}