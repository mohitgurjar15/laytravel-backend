import { EmailHeader } from "./header.html";
import {  EmailFooter} from "./footer.html";
import { BaseUrl } from "../base-url";

export function PaymentInstallmentMail(param:{
    date: string,
    userName: string,
    cardHolderName: string,
    cardNo: string,
    orderId : string,
    amount: number,
    installmentId : number,
    complitedAmount : number,
    totalAmount: number
})
{
const content = `<!-- header Text section start -->
<table width="100%" border="0" cellspacing="0" cellpadding="0"  style="background: #f2f2f2;" class="full-wrap">
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
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 22px; line-height: 24px; color: #444; font-weight:700; padding-top: 15px; text-align: left;">Installment Received</td>
                                                </tr>

                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">
                                                        Hi <span>${param.userName}</span>,<br/> 
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: left;">
                                                        We have received your payment of ${param.amount} With each and every installment made - you are closer to your dream trip! 
                                                    </td>
                                                </tr>



                                                <tr>
                                                    <td align="center" valine="top" style="padding: 30px 0px 0; background: #ffffff;">	
                                                        <table width="570" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 570px;" class="oc_wrapper">
                                                            <tbody>
                                                                <tr>
                                                                    <td align="left" valign="top" style="padding: 0 0 15px 0;">
                                                                        <table border="0" cellspacing="0" cellpadding="0" align="left" width="180px;" style="width: 180px;" class="oc_wrapper">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td align="left" valign="top">
                                                                                        <table border="0" cellspacing="0" cellpadding="0" style="width: 100%;">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 0; text-align: left;">
                                                                                                        <span style="font-weight:bold;">Billed To:</span><br/>
                                                                                                            ${param.userName} <br/><span style="font-weight:bold;">Order Id :</span>${param.orderId}
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                        <table border="0" cellspacing="0" cellpadding="0" align="right" width="370px;" style="width: 370px;" class="oc_wrapper">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td class="oc_ptop" align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 0; text-align: left;">
                                                                                        <span style="font-weight:bold;">Invoice ID:</span> ${param.installmentId}
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td class="oc_ptop" align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 0; text-align: left;">
                                                                                        <span style="font-weight:bold;">payment Date:</span>${param.date}
                                                                                    </td>
                                                                                </tr>
                                                                                <!-- <tr>
                                                                                    <td class="oc_ptop" align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 0; text-align: left;">
                                                                                        <span style="font-weight:bold;">Payment method:</span> American Express ending in 2004
                                                                                    </td>
                                                                                </tr> -->
                                                                                <tr>
                                                                                    <td class="oc_ptop" align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 0; text-align: left;">
                                                                                        <span style="font-weight:bold;">Account:</span> <a style="color: #1943FF; text-decoration: underline;" href="">${param.cardNo}</a>
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

                                                <tr>
                                                    <td align="left" valign="top" style="border-bottom: 1px solid #000; padding-top: 10px;">
                                                        <table border="0" cellspacing="0" cellpadding="0" style="width: 100%;">
                                                            <tbody>
                                                                <tr>
                                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;font-weight: 500; padding-bottom: 3px;">Service </td>
                                                                    <td align="right" valign="top" style="width:100px; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;font-weight: 500; padding-bottom: 3px;">Price (USD)</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td align="left" valign="top" style="padding-top: 10px;">
                                                        <table border="0" cellspacing="0" cellpadding="0" style="width: 100%;">
                                                            <tbody>
                                                                <tr>
                                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;font-weight: 600; padding-top: 3px;">Laytrip Installment Amount</td>
                                                                    <td align="right" valign="top" style="width:100px;font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;font-weight:600; padding-top: 3px;">${param.amount}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td align="right" valign="top" style="padding-top: 10px;">
                                                        <table align="right" border="0" cellspacing="0" cellpadding="0" style="">
                                                            <tbody>
                                                                <tr>
                                                                    <td align="right" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;font-weight:500; padding-top: 10px; ">Installment amount: ${param.amount}</td>
                                                                    
                                                                </tr>
                                                                <tr>
                                                                    <td align="right" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;font-weight:500; padding-top: 5px; ">Completed amount: ${param.complitedAmount}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="right" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;font-weight:500; padding-top: 5px; ">Total price: ${param.totalAmount}</td>
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