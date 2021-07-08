import { BookingType } from "src/enum/booking-type.enum";
import { ModulesName } from "src/enum/module.enum";
import { DateTime } from "src/utility/datetime.utility";
import { BookingLink } from "../base-url";
import { CartBookingEmailParameterModel } from "../email_template/model/cart-booking-email.model";
import { LaytripFooter } from "./laytrip_footer.html";
import { LaytripHeader } from "./laytrip_header.html";

export async function CartFailedInventryMail(
    param: { user_name: string, totalAmount: string, totalPaid: string, rememberAmount: string,paymentDetail : {
        amount: string;
        date: string;
        status: string;
    }[],FailedBooking: {
            moduleId: number,
            name: number,
            price: string
        }[]
 }, referral_id: string = ''
) {
    let content = `<tr>
    <td align="center" valine="top" style="padding: 38px 25px 10px; background: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center"
            style="width: 100%; font-family: 'Poppins', sans-serif; ">
            <tbody>
                <tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #000000; font-weight: 600;; text-align: left; font-weight: 600;">
                        Hi ${param.user_name ? param.user_name : ""},</td>
                </tr>
                <tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                        We are sorry, but due to a technical issue, one of the items in your cart has become unavailable while we were processing your payment. You will be issued a refund for the following:
                    </td>
                </tr>
                
            <tr>
                <td
                    align="left" valign="top"bold;
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 5px; display: block; line-height: 27px; color: #707070; text-align: left;">
                    Our customer service department has already been notified and you should see the refund appear on your payment method within 3-5 business days.

                </td>
            </tr>
            <tr>
                <td
                    align="left" valign="top"bold;
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 5px; display: block; line-height: 27px; color: #707070; text-align: left;">
                    In addition, your installment plan will be adjusted to the following:
                </td>
            </tr>
             `;
    if (param.paymentDetail.length) {
        content += `<tr>
                <td
                    align="left" valign="top"bold;
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 5px; display: block; line-height: 27px; color: #707070; text-align: left;">
                    <span  style="color: #000000; font-weight: 600;">Installments</span> 
                </td>
            </tr> `;
        for (let index = 0; index < param.paymentDetail.length; index++) {
            const payment = param.paymentDetail[index];
            //   console.log(payment.amount);
            if (index > 0) {
                content += `
                <tr>
                <td
                    align="left" valign="top"bold;
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 0px 25px 5px; display: block; line-height: 27px; color: #707070; text-align: left;" >
                    #${index} ${payment.amount} ${payment.status
                    } ${DateTime.convertDateFormat(
                        payment.date,
                        "YYYY-MM-DD",
                        "MMMM DD, YYYY"
                    )}
                </td>
            </tr>`;
            }
        }
    }
    content += `
                <tr>
                    <td align="left" valign="top"
                                        style="font-family: 'Poppins', sans-serif; font-weight: 300;font-size: 18px; padding: 20px 25px 10px; display: block; line-height: 27px; color: #707070; text-align: left;">
                        Please contact <a href = 'mailto:customerservice@laytrip.com'
                        style="color: #0C7BFF;">customerservice@laytrip.com</a> if you have any additional questions.
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
</tr>`;
    return LaytripHeader + content + LaytripFooter(referral_id);
}
