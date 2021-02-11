import { EmailHeader } from "./header.html";
import { EmailFooter } from "./footer.html";
import { BaseUrl } from "../base-url";

export function missedPaymentInstallmentMail(param: {
    date: string,
    amount: number,
    available_try: string,
    payment_dates: string,
    currency:string
}) {
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
                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 22px; line-height: 24px; color: #444; font-weight:700; padding-top: 15px; text-align: center;">Missed Partial Payment</td>
                                                    </tr>
                                                    <tr>
                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">We couldn’t process your payment</td>
                                                    </tr>
                                                    <tr>
                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                            <img src="Images/Failure.png" alt="Laytrip" width="100%" height="auto" border="0" style="display: inline-block; max-width: 100px; font-family: 'Poppins', sans-serif;font-size: 18px; color: #fff; ">
                                                        </td>
                                                    </tr>
                                                    
                                                    <tr>
                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">We were not able to successfully collect your ${param.currency}${param.amount} installment payment from your credit card on file that was scheduled for ${param.date}. If you do not know why this charge was rejected, please contact your credit card provider immediately and try to resolve the issue.</td>
                                                    </tr>
                                                    <tr>
                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding: 15px 0; text-align: left;">We understand that sometimes things happen so we will make ${param.available_try} more attempts to a date ${param.payment_dates}. If you have resolved the issue we will know so on the 2nd or 3rd try when the charge goes through. If we are not able to complete the charge after the 3rd attempt we will have to cancel your booking and we will not be able to issue a refund per our Refund Policy.</td>
                                                    </tr>
                                                    
                                                    <tr>
                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">We hope you are able to get this settled so you can continue to plan to make your trip. If it is necessary to discuss, please contact Customer Support through our chat function or email us at support@laytrip.com. Please include your name and booking number so we can best try to help you fix the issue, thanks!</td>
                                                    </tr>
                                                    <tr>
                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 10px; color: #000;padding-top: 5px; text-align: left;"><span style="display: block;">Sincerely,</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 10px; color: #000;padding-top: 5px; text-align: left;"><span style="display: block;">Laytrip Support</span></td>
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