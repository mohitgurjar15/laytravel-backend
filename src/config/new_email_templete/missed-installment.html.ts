import { Generic } from "src/utility/generic.utility";
import { TermsConditonLink } from "../base-url";
import { LaytripFooter } from "./laytrip_footer.html";
import { LaytripHeader } from "./laytrip_header.html";

export function LaytripMissedPaymentTemplete(param: {
  userName: string;
  amount: string;
  date: string;
  bookingId: string;
  try: number;
  nextDate: string;
}) {
  let content = `<tr>
    <td align="center" valine="top" style="padding: 20px 25px 10px; background: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
            <tbody>
                <tr>
                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 20px; color: #000000;padding:0 0 20px 0; text-align: left;"> Hi ${param.userName},</td>
                </tr>
                `;
  if (param.try == 2) {
    content += `<tr>
                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 20px; color: #707070;padding:0 0 20px 0; text-align: left;">2nd Notice!`;
  }
  if (param.try == 3) {
    content += `<tr>
                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 20px; color: #707070;padding:0 0 20px 0; text-align: left;">3rd and final missed payment notice!</td>
                     </tr>`;
  }
  content += `
                <tr>
                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 20px; color: #707070;padding:0 0 20px 0; text-align: left;">We’re ${
                      param.try > 1 ? "still" : ""
                    } having trouble processing your installment payment for ${
    param.amount
  }, originally scheduled for ${param.date} for Booking ID ${
    param.bookingId
  }.</td>
                </tr>`;
  if (param.try < 3) {
    content += `<tr>
                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 20px; color: #707070;padding:0 0 20px 0; text-align: left;">${
                      param.try == 1 ? "We understand things happen so." : ""
                    } We will automatically attempt to process it again on ${
      param.nextDate
    }.</td>
                </tr>`;
  }

  content += `<tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 14px; line-height: 20px; color: #707070;padding:0 0 20px 0; text-align: left;">
                        If you believe this happened in error please contact us at <a href = 'mailto:customerservice@laytrip.com'
                    style="color: #0c7bff;"><u>customerservice@laytrip.com</u></a>. We will make every effort to avoid booking cancellation without refund per our 
                    <a href="${TermsConditonLink}" style="color: #0c7bff;"><u>Terms</u></a> which occurs after multiple missed payments and the delivery of 
                    a default and cancellation notice.
                    </td>               
                </tr>
            </tbody>
        </table>
    </td>
</tr>
<tr>
<td align="center" valine="top" style="padding: 5px 25px 10px; background: #ffffff;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
        <tbody> 
            <tr>
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top:0px; text-align: left;">Sincerely</td>
            </tr>
            <tr>
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #0043ff;padding-top:5px; text-align: left;"><a href = 'mailto:customerservice@laytrip.com'>Laytrip Customer Service</a></td>
            </tr>
        </tbody>
    </table>
</td>
</tr>
`;
  return LaytripHeader + content + LaytripFooter;
}
