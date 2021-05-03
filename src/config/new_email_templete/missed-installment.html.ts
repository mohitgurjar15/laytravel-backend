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
    <td align="center" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
            <tbody>
                <tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #000000; text-align: left; font-weight: 600;"> Hi ${param.userName},</td>
                </tr>
                `;
  if (param.try == 3) {
    content += `<tr>
                    <td aalign="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">2nd Notice!`;
  }
  if (param.try == 4) {
    content += `<tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">3rd and final missed payment notice!</td>
                     </tr>`;
  }
  content += `
                <tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">We’re ${
                                            param.try > 2 ? "still" : ""
                                        } having trouble processing your installment payment for ${
      param.amount
  }, originally scheduled for ${param.date} for Booking ID ${
      param.bookingId
  }.</td>
                </tr>`;
  if (param.try < 4) {
    content += `<tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">${
                                            param.try == 2
                                                ? "we understand things happen so we will automatically attempt to process it again on " +
                                                  param.nextDate
                                                : "we will automatically make a final attempt to process it again on " +
                                                  param.nextDate
                                        }.</td>
                </tr>`;
  }

  content += `<tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                        If you believe this happened in error please contact us at <a href = 'mailto:customerservice@laytrip.com'
                    style="color: #0C7BFF;">customerservice@laytrip.com</a>. We will make every effort to avoid booking cancellation without refund per our 
                    <a href="${TermsConditonLink}" style="color: #0C7BFF;">Terms</a> which occurs after multiple missed payments and the delivery of 
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
                <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 0px; display: block; line-height: 27px; color: #707070; text-align: left;">Sincerely,</td>
            </tr>
            <tr>
                <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 10px; display: block; line-height: 27px; color: #0043FF; text-align: left;"><a href = 'mailto:customerservice@laytrip.com'>Laytrip Customer Service</a></td>
            </tr>
        </tbody>
    </table>
</td>
</tr>
`;
  return LaytripHeader + content + LaytripFooter;
}
