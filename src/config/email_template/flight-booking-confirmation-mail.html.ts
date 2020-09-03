import { EmailHeader } from "./header.html";
import { EmailFooter } from "./footer.html";
import { BaseUrl } from "../base-url";
import { FlightBookingEmailParameterModel } from "./model/flight-booking-email-parameter.model";

export function FlightBookingConfirmtionMail(
	param: FlightBookingEmailParameterModel
) {
	var content = `<!-- header Text section start -->
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f2f2f2;" class="full-wrap">
    <tr>
        <td align="center" valign="top">
            <table align="center" style="width:600px; max-width:600px; table-layout:fixed;" class="oc_wrapper" width="600" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" valine="top" style="background-color: #ffffff;">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 600px;" class="oc_wrapper">
                            <tbody>
                                <tr>
                                    <td style="font-family: 'Open Sans', sans-serif;font-size: 20px; line-height: 24px; color: #444; font-weight:700; padding: 15px; text-align: center;" valign="top" align="left">Flight Booking Confirmation</td>
                                </tr>
                                <tr>
                                    <td align="center" valign="top">
                                        <img src="Images/banner_img.jpg" border="0" alt="Banner" style="width: 100%; max-width: 600px;" class="oc_img100">
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" valine="top" style="padding: 10px 15px 30px; background: #ffffff;">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                            <tbody>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 16px; line-height: 20px; color: #000000;padding-top: 20px; text-align: left;">Dear<span style="font-weight: 700;">${param.user_name}</span></td>
                                                </tr>
                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 15px 0 10px; text-align: left;">The total cost of your reservation is <span style="font-weight: 700;">${param.amount}</span></td>
                                                </tr>
                                                
                                                
                                                <tr>
                                                    <td align="center" valign="top">
                                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                                                            <tbody>
                                                                <tr>
                                                                    <td align="left" valign="top" style="background: #526ad5; font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #fff;padding: 10px; text-align: left; font-weight: 700;">
                                                                        Flight
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left; font-weight: 700;">Reservation Information</td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding:10px 10px 0; text-align: left;"><span style="font-weight: 700; padding-right:10px;">Traveler(s):</span>${param.travelers}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding:10px 10px 0; text-align: left;"><span style="font-weight: 700; padding-right:10px;">Reservation:</span>${param.reservation_no}</td>
                                                                </tr>`;
if (param.airline) {
content += `
    <tr>
        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left;"><span style="font-weight: 700; padding-right:10px;">Booking Confirmation (Airline Name): </span> ${param.airline}</td>
    </tr>`;
}
if (param.pnr_no) {
content += `
    <tr>
        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left;"><span style="font-weight: 700; padding-right:10px;">PNR No.: </span>${param.pnr_no}</td>
    </tr>`;
}
content += `<tr>
                <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px; text-align: left;"><span style="font-weight: 700; padding-right:10px;">Ticket #: </span> ${param.ticket_no}</td>
            </tr>
        </tbody>
    </table>
</td>
</tr>`
if(param.flight_name || param.class || param.rout || param.duration)
{content += `
<tr>
<td align="center" valign="top">
<table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
<tbody>
    <tr>
        <td align="left" valign="top" style="background: #526ad5; font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #fff;padding: 10px; text-align: left; font-weight: 700;">
            Flight Information
        </td>
    </tr>`
    if(param.flight_name)
    {content += `    
    <tr>
        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left;"><span style="font-weight: 700; padding-right:10px;">Flight Name:</span>${param.flight_name}</td>
    </tr>`
    }
    if(param.class)
    {content += ` 
    <tr>
        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left;"><span style="font-weight: 700; padding-right:10px;">Class:</span> ${param.class}</td>
    </tr>`}
    if(param.rout)
    {content += ` 
    <tr>
        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left;"><span style="font-weight: 700; padding-right:10px;">Route:</span> ${param.rout}</td>
    </tr>
    `}
    if(param.duration)
    {content += ` 
    <tr>
        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px; text-align: left;"><span style="font-weight: 700; padding-right:10px;">Duration: </span> ${param.duration}</td>
    </tr>`
    }
}
if(param.flight_name || param.class || param.rout || param.duration)
{content += `      
        </tbody>
    </table>
</td>
</tr>`
}
content += `   <tr>
    <td align="center" valign="top">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tbody>
                <tr>
                    <td align="left" valign="top" style="background: #526ad5; font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #fff;padding: 10px; text-align: left; font-weight: 700;">
                        Billing Information
                    </td>
                </tr>`
if(param.cardholder_name)
{content +=  `<tr>
    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left;"><span style="font-weight: 700;padding-right:10px;">Cardholder Name:</span> ${param.cardholder_name}</td>
</tr>`
}
content +=  ` <tr>
        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left;"><span style="font-weight: 700;padding-right:10px;">Travel Credits:</span> ${param.laytrip_points}</td>
    </tr>
    <tr>
        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left;"><span style="font-weight: 700;padding-right:10px;">Visa ending in</span> ${param.visa_ending_in}</td>
    </tr>
    <tr>
        <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px; text-align: left;"><span style="font-weight: 700;padding-right:10px;">Amount:</span> ${param.amount}</td>
    </tr>
</tbody>
</table>
</td>
</tr>

<tr>
<td align="center" valign="top">
<table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
<tbody>
    <tr>
        <td style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #fff;padding: 10px; background:#526ad5; text-align: left; " valign="top" align="left"><span style="font-weight: 700;">Payment Details</span></td>
    </tr>
    <tr>
        <td style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left; " valign="top" align="left"><span style="font-weight: 700;padding-right:10px;">Base fare: </span> ${param.base_fare}</td>
    </tr>
    <tr>
        <td style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left; " valign="top" align="left"><span style="font-weight: 700;padding-right:10px;">Tax: </span> ${param.tax}</td>
    </tr>
    <tr>
        <td style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px;text-align: left; " valign="top" align="left"><span style="font-weight: 700;padding-right:10px;">Total Cost: </span> ${param.amount}</td>
    </tr>
</tbody>
</table>
</td>
</tr>

<tr>
<td align="center" valign="top">
<table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
<tbody>
    <tr>
        <td align="left" valign="top" style="border-top:1px solid #ddd; border-bottom:1px solid #ddd; font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: red;padding: 10px 0 10px; text-align: left;"><span style="font-weight: 700;">*Ticket ${param.status}</span></td>
    </tr>
    <tr>
        <td style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: red;padding: 10px 10px 0; text-align: left; " valign="top" align="left">* We will send you a separate email within 3-24 hours, once the ticket is confirmed. If you are travelling within 24 hrs, please contact us immediately.</td>
    </tr>
    <tr>
        <td style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left; " valign="top" align="left">
            <ul style="margin:0; padding:0 0 0 15px;">
                <li style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-bottom:5px;">Refer your eTicket for detailed flight itinerary, fare rules & baggage policy.</li>
                <li style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-bottom:5px;">All timings mentioned above are local timings for that particular city/country.</li>
            </ul>
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
	return EmailHeader + content + EmailFooter;
}
