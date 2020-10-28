import { EmailHeader } from "./flight-booking-header.html";
import { EmailFooter } from "./booking-footer.html";
import { BaseUrl } from "../base-url";

export function missedPaymentInstallmentMail(param: {
    message: string,
    cardHolderName: string,
    cardNo: string,
    orderId: string,
    amount: string,
}) {
    const content = `<table width="100%" border="0" cellspacing="0" cellpadding="0"  style="background: #f2f2f2;" class="full-wrap">
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
                                                    <img src="${BaseUrl}/images/Failure.png" alt="Laytrip" width="100%" height="auto" border="0" style="display: inline-block; max-width: 100px; font-family: 'Poppins', sans-serif;font-size: 18px; color: #fff; ">
                                                </td>
                                            </tr>
                                            
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">Unfortunately, we couldn’t collect the payment from you. Some possible reasons might be:</td>
                                            </tr>
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">
                                                    <ul style="margin:0; padding:0 0 0 15px;">
                                                        <li style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-bottom:5px;">${param.message}</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                            <tr>
										    			<td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize; background: #D0D0D0; padding: 10px 15px; font-weight: 700;">Payment details</td>
										    		</tr>
										    		<tr>
										    		<td align="left" valign="top" style="padding-top: 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #DCDCDC; border-bottom: 0px;">
										        	<tbody>
										          		<tr>
										            		<td align="center" valign="top" style="border-bottom: 1px solid #DCDCDC;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
										                		<tbody>
										                  		<tr>
										                    		<td align="center" class="oc_w85 oc_f12" valign="top" style="width: 80px; padding: 14px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;"><b>Order Id</b></td>
										                   				<td align="center" class="oc_w85 oc_f12" valign="top" style="width: 200px; padding: 10px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${param.orderId}</td>
										                 
										                  		</tr>
										                  		<tr>
										                    		<td align="center" class="oc_w85 oc_f12" valign="top" style="width: 80px; padding: 14px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;"><b>Card Holder</b></td>
										                   				<td align="center" class="oc_w85 oc_f12" valign="top" style="width: 200px; padding: 10px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${param.cardHolderName}</td>
										                 
										                  		</tr>
										                  		<tr>
										                    		<td align="center" class="oc_w85 oc_f12" valign="top" style="width: 80px; padding: 14px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;"><b>Card No</b></td>
										                   				<td align="center" class="oc_w85 oc_f12" valign="top" style="width: 200px; padding: 10px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${param.cardNo}</td>
										                 
										                  		</tr>
										                  		<tr>
										                    		<td align="center" class="oc_w85 oc_f12" valign="top" style="width: 80px; padding: 14px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;"><b>Amount</b></td>
										                   				<td align="center" class="oc_w85 oc_f12" valign="top" style="width: 200px; padding: 10px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${param.amount}</td>
										                 
										                  		</tr>
										                		</tbody>
										              		</table>
										          			</td>
										          		</tr>
										          	</tbody>
										          </table>
										      </td>
										    </tr>
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding: 15px 0; text-align: left;">We understand it might be difficult to spot the problem at first, so we grant you 2 business days (5 business days) to resolve the issue</td>
                                            </tr>
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding:25px; text-align: center; background: #fc7e66;">
                                                    <a href="javascrip:void(0);" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #fff; font-weight:bold; text-decoration:underline;">Update Payment Information</a>
                                                </td>
                                            </tr>
                                            <!-- <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">
                                                    <a href="https://staging.laytrip.com/account/account-card-list" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #1943ff; font-weight:bold;">Update Payment Information</a>
                                                </td>
                                            </tr> -->
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">If after the granted period has passed and we still cannot successfully bill your credit card then your account might be suspended. We won’t be able to give you a refund, if booking has already been confirmed. However, if booking hasn’t been yet confirmed - your deposits will be converted to Laytrip points that you can use to book your future trips or use as discounts.</td>
                                            </tr>
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">If you have any questions, please contact us at @@ with the “Partial Payment Failure” subject line.</td>
                                            </tr>
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">Thank you for your attention to this matter!</td>
                                            </tr>
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">Safe travels, <span style="display: block;">The Laytrip Team</span></td>
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
</table>`;
    return EmailHeader + content + EmailFooter;
}