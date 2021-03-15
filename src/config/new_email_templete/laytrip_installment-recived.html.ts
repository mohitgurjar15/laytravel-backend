import { Generic } from "src/utility/generic.utility";
import { LaytripFooter } from "./laytrip_footer.html";
import { LaytripHeader } from "./laytrip_header.html";

export function LaytripInstallmentRecevied(param: {
  date: string;
  userName: string;
  orderId: string;
  amount: number;
  installmentId: number;
  complitedAmount: number;
  totalAmount: number;
  currencySymbol: string;
  nextDate: string;
}) {
  let content = `<tr>
    <td align="center" valine="top" style="padding: 20px 25px 10px; background: #ffffff;">
        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
            <tbody>
                <tr>
                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 20px; color: #000000; padding:0 0 20px 0; text-align: left;"> Hi ${param.userName},</td>
                </tr>
                <tr>
                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 20px; color: #707070;padding:0 0 20px 0; text-align: left;">We have successfully processed your payment for ${param.currencySymbol}${param.amount} on ${param.date}, thank you!
                    Your next ${param.currencySymbol}${param.amount} payment will be processed on ${param.nextDate}</td>
                </tr>`;
  // <tr>
  //     <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding-top:10px; text-align: left;"><span style="font-weight: 700; padding-right:10px; color: #000000;">Billed to:</span>${param.cardHolderName}</td>
  // </tr>
  // <tr>
  //     <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding-top:10px; text-align: left;"><span style="font-weight: 700; padding-right:10px; color: #000000;">Payment:</span>${param.currencySymbol}${Generic.formatPriceDecimal(param.amount)} Installment #${param.installmentId} for Booking ID ${param.orderId}}</td>
  // </tr>
  // <tr>
  //     <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding-top:10px; text-align: left;"><span style="font-weight: 700; padding-right:10px; color: #000000;">Total Price:</span>${param.currencySymbol}${Generic.formatPriceDecimal(param.totalAmount)}</td>
  // </tr>
  // <tr>
  //     <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding-top:10px; text-align: left;"><span style="font-weight: 700; padding-right:10px; color: #000000;">Total Paid:</span>${param.currencySymbol}${Generic.formatPriceDecimal(param.complitedAmount)}</td>
  // </tr>
  // <tr>
  //     <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding-top:10px; text-align: left;"><span style="font-weight: 700; padding-right:10px; color: #000000;">Blance Due:</span>${param.currencySymbol}${Generic.formatPriceDecimal(param.totalAmount - param.complitedAmount)}</td>
  // </tr>
  content += `<tr>
                    <td align="left" valign="top"
                        style="font-family: 'Poppins', sans-serif; font-weight: 100; font-size: 14px; line-height: 20px; color: #707070;padding: 0 0 20px 0; text-align: left;">
                        Please contact <a href = 'mailto:customerservice@laytrip.com'
                        style="color: #0c7bff;"><u>customerservice@laytrip.com</u></a>. if you have any questions.
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
                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #707070;padding-top:0px; text-align: left;">Sincerely,</td>
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
