import { EmailHeader } from "./header.html";
import {  EmailFooter} from "./footer.html";
import { BaseUrl } from "../base-url";

export function PaymentInstallmentMail(param:{
    date: string,
    userName: string,
    cardHolderName: string,
    cardNo: string,
    orderId : string,
    amount: string,
})
{
const content = `<table width="100%" border="0" cellspacing="0" cellpadding="0"  style="background: #f2f2f2;" class="full-wrap">
<tr>
    <td align="center" valign="top">
        <table align="center" style="width:600px; max-width:600px; table-layout:fixed;" class="oc_wrapper" width="600" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center" valine="top" style="background-color: #ffffff;">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 600px;" class="oc_wrapper">
                        <tbody>
                            <tr>
                                <td align="center" valine="top" style="padding: 10px 15px 15px; background: #ffffff;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                                        <tbody>
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 22px; line-height: 24px; color: #444; font-weight:700; padding-top: 15px; text-align: center;">Partial Payment Subscription</td>
                                            </tr>
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">Hi ${param.userName},</td>
                                            </tr>
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">
                                                    <img src="${BaseUrl}/images/Success.png" alt="Laytrip" width="100%" height="auto" border="0" style="display: inline-block; max-width: 100px; font-family: 'Poppins', sans-serif;font-size: 18px; color: #fff; ">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;">We have get your installment successfully,</td>
                                            </tr>
                                            <tr><br/>
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
                                                          <tr>
                                                            <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 80px; padding: 14px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;"><b>Instalment Date</b></td>
                                                                   <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 200px; padding: 10px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${param.date}</td>
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