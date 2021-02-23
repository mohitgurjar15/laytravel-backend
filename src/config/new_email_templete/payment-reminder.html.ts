import { Generic } from "src/utility/generic.utility";
import { LaytripFooter } from "./laytrip_footer.html";
import { LaytripHeader } from "./laytrip_header.html";

export function LaytripPaymentReminderTemplete(param: { userName: string, amount: string, date: string , bookingId:string }
    ) {
    const content = `<tr>
    <td align="center" valine="top" style="padding: 20px 25px 10px; background: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
            <tbody>
                <tr>
                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070; text-align: left;"> Hi ${param.userName},</td>
                </tr>
                <tr>
                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding: 20px 0; text-align: left;">This is a reminder that your installment payment for ${param.amount} will be processed on ${param.date} for Booking ID ${param.bookingId} </td>
                </tr>
                <tr>
                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding-top:10px; text-align: left;">Please contact <a href = 'mailto:customerservice@laytrip.com'
                    style="color: #f725c5;"><u>customerservice@laytrip.com</u></a> if you have any questions.</td>
                </tr>
                
            </tbody>
        </table>
    </td>
</tr>
`;
    return LaytripHeader + content + LaytripFooter;
}