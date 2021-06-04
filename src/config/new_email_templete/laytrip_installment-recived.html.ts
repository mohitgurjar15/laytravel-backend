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
    pastDue: boolean;
}) {
    let content = `<tr>
    <td align="center" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
        <table  width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
            <tbody>
                <tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #000000; text-align: left; font-weight: 600;"> Hi ${
                                            param.userName
                                        },</td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">We have successfully processed your ${
                                            param.pastDue == true
                                                ? "past due"
                                                : ""
                                        } payment for ${param.currencySymbol}${
        param.amount
    } on ${param.date}, thank you!`;
    if (param.pastDue == false && param.nextDate) {
        content += `
                    Your next ${param.currencySymbol}${param.amount} payment will be processed on ${param.nextDate}.`;
    }
    content += `</td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                        Please contact <a href = 'mailto:customerservice@laytrip.com'
                        style="color: #0C7BFF;">customerservice@laytrip.com</a> if you have any questions.
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
