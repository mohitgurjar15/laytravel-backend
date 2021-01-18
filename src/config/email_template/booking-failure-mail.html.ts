import { EmailHeader } from "./header.html";
import { EmailFooter } from "./footer.html";
import { BaseUrl } from "../base-url";

export function BookingFailerMail(param: { error: string } , bookingId = null) {
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
                                            </tr>`
    if (param.error) {
        content += `<tr>
            <td align="left" valign = "top" style = "font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;" >
                The reason for booking failure:${param.error}
                    </td>
                    </tr>`
                        

    }
    if(bookingId)
    {
        content += `< tr >
                        <td align="left" valign = "top" style = "font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;" >
                            Booking ID : ${bookingId}
        </td></tr>
         `
    }
    content += `<tr>
        <td align="left" valign = "top" style = "font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;" >
            Please, proceed to our website to try again(or “We are sorry to let you know that the reservation is no longer available.Please choose a different option for your next trip.”)

    </td></tr></tr></table>
            `;
return EmailHeader + content + EmailFooter;
}