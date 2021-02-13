// import { Generic } from "src/utility/generic.utility";
// import { LaytripFooter } from "./laytrip_footer.html";
// import { LaytripHeader } from "./laytrip_header.html";

// export function BookingConfirmation(param: {
//     userName: string,
//     bookingId: string}
//     ) {
//     const content = `<tr>
//     <td align="center" valine="top" style="padding: 20px 25px 10px; background: #ffffff;">
//         <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
//             <tbody>
//                 <tr>
//                     <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #000000; text-align: left;"> Hi ${param.userName},</td>
//                 </tr>
//                 <tr>
//                     <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding: 20px 0; text-align: left;">Thanks for your payment of ${param.currencySymbol}${param.amount} on ${param.date} You are only <span style="color: #f725c5;">${param.pendingInstallment} installments</span> from completing your booking payments!</td>
//                 </tr>
//                 <tr>
//                     <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding-top:10px; text-align: left;"><span style="font-weight: 700; padding-right:10px; color: #000000;">Billed to:</span>${param.cardHolderName}</td>
//                 </tr>
//                 <tr>
//                     <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding-top:10px; text-align: left;"><span style="font-weight: 700; padding-right:10px; color: #000000;">Payment:</span>${param.currencySymbol}${param.amount} Installment #${param.installmentId} for Booking ID ${param.orderId}}</td>
//                 </tr>
//                 <tr>
//                     <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding-top:10px; text-align: left;"><span style="font-weight: 700; padding-right:10px; color: #000000;">Total Price:</span>${param.currencySymbol}${param.totalAmount}</td>
//                 </tr>
//                 <tr>
//                     <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding-top:10px; text-align: left;"><span style="font-weight: 700; padding-right:10px; color: #000000;">Total Paid:</span>${param.currencySymbol}${param.complitedAmount}</td>
//                 </tr>
//                 <tr>
//                     <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #707070;padding-top:10px; text-align: left;"><span style="font-weight: 700; padding-right:10px; color: #000000;">Blance Due:</span>${param.currencySymbol}${Generic.formatPriceDecimal(param.totalAmount - param.complitedAmount)}</td>
//                 </tr>
//             </tbody>
//         </table>
//     </td>
// </tr>
// `;
//     return LaytripHeader + content + LaytripFooter;
// }