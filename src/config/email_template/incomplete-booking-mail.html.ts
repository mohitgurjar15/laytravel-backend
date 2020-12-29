import { EmailHeader } from "./header.html";
import { EmailFooter } from "./footer.html";
import { BaseUrl } from "../base-url";

export function IncompleteBookingMail(param: { error: string , amount:string} , bookingId = null) {
    var content = `<table width="100%" border="0" cellspacing="0" cellpadding="0"  style="background: #f2f2f2;" class="full-wrap">
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
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 22px; line-height: 24px; color: #444; font-weight:700; padding-top: 15px; text-align: center;">Booking Failure</td>
                                            </tr>
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">You’re receiving this email because we couldn’t process your booking request.</td>
                                            </tr>
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                    <img src="${BaseUrl}/images/Failure.png" alt="Laytrip" width="100%" height="auto" border="0" style="display: inline-block; max-width: 100px; font-family: 'Open Sans', sans-serif;font-size: 18px; color: #fff; ">
                                                </td>
                                            </tr>
                                            <tr>
                                            <td align="left" valign = "top" style = "font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;" >
                                            We made 3 attempts to collect your ${param.amount} installment payment, plus we offered the option of an extended grace period, but we were unable to successfully collect your payment. Per our Refund Policy and Terms of Use we have unfortunately had to cancel your booking and we will not be able to issue any refund.
                                        </td></tr>`
    if (param.error) {
        content += `<tr>
            <td align="left" valign = "top" style = "font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;" >
                The reason for booking failure is ${param.error}
                    </td>
                    </br>
                    </tr>`
                        

    }
    if(bookingId)
    {
        content += `< tr >
                        <td align="left" valign = "top" style = "font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;" >
                            Booking Id : ${bookingId}
        </td>
         `
    }
    content += `<tr>
        <td align="left" valign = "top" style = "font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;" >
        If you have any reason to discuss your booking further, please contact us by our chat function or email us at support@laytrip.com. We hope to be able to try again with you on a future booking.
    </td></tr>
    <tr>
        <td align="left" valign = "top" style = "font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;" >
        Sincerely,
    </td></tr>
    <tr>
        <td align="left" valign = "top" style = "font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;" >
        Laytrip support
    </td></tr>
    </tr></table>
            `;
return EmailHeader + content + EmailFooter;
}