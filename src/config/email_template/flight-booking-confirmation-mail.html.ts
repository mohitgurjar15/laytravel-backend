import { EmailHeader } from "./header.html";
// import { EmailFooter } from "./footer.html";
import { BaseUrl } from "../base-url";
import { FlightBookingEmailParameterModel } from "./model/flight-booking-email-parameter.model";
import { EmailFooter } from "./footer.html";
import { Generic } from "src/utility/generic.utility";
import { DateTime } from "src/utility/datetime.utility";

export async function FlightBookingConfirmtionMail(
  param: FlightBookingEmailParameterModel
) {


  var basicContaint = `
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f2f2f2;" class="full-wrap">
    <tr>
      <td align="center" valign="top">
        <table align="center" style="width:600px; max-width:600px; table-layout:fixed;" class="oc_wrapper" width="600" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" valine="top" style="background-color: #ffffff;"><table width="600" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 600px;" class="oc_wrapper">
                <tbody>
                  <!-- <tr>
                                          <td style="font-family: 'Poppins', sans-serif;font-size: 20px; line-height: 24px; color: #444; font-weight:700; padding: 15px; text-align: center;" valign="top" align="left">Flight Booking Confirmation</td>
                                      </tr> -->
                  <tr>
                    <td align="center" valine="top" style="padding: 10px 15px 30px; background: #ffffff;"><table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                        <tbody>
                          <tr>
                            <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #000000;padding: 20px 0; text-align: left;"> Hello <span style="font-weight: 700;"> ${param.user_name}</span></td>
                          </tr>`;

  var inventry = `<tr>
                          <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #000000;padding: 0 0 5px; text-align: left; font-weight: 700;"> Itinerary </td>
                          </tr>
                          <tr>
                          <td align="center" valign="top" style="border: 1px solid #D9D9D9;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tbody>
                              <tr>
                                  <td align="center" valign="top" class="oc_none" style="background: #012178"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                                      <tbody>
                                      <tr>
                                          <td align="left" valign="middle" style="padding: 7px; width: 100px; border-right: 1px solid #D7D7D7; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #FFFFFF; text-transform: capitalize;">Flight</td>
                                          <td align="left" valign="middle" style="padding: 7px; width: 200px; border-right: 1px solid #D7D7D7; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #FFFFFF; text-transform: capitalize;">Departure</td>
                                          <td align="left" valign="middle" style="padding: 7px; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #FFFFFF; text-transform: capitalize;">Arrival</td>
                                      </tr>
                                      </tbody>
                                  </table></td>`;
  for await (const data of param.flightData) {

    inventry += `
                                                    <tr>
                                                      <td align="left" valign="top" style="background: #D7D7D7; padding-top: 5px; padding-bottom: 10px" ><table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                                <tbody>
                                                                  <tr>
                                                                    <td align="left" valign="middle" style="padding: 7px;  font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #000000; text-transform: capitalize;">${data.rout}</td>
                                                                    <td align="right" valign="middle" style="width: 150px; padding: 7px;  font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #000000; text-transform: capitalize;">status: ${data.status}</td>
                                                                  </tr>
                                                                </tbody>
                                                              </table></td>
                                                          </tr>
                                                          `
    for await (const flight of data.droups) {

      inventry += ` 
                                                          <tr>
                                                            <td align="left" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                                <tbody>
                                                                  <tr>
                                                                    <td align="left" valign="top"><table width="114" align="left" border="0" cellspacing="0" cellpadding="0" class="oc_wrapper">
                                                                        <tbody>
                                                                          <tr>
                                                                            <td align="left" valign="top" style=""><table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                                                <tbody>
                                                                                  <tr>
                                                                                    <td align="left" class="oc_desknone oc_deskshow" valign="middle" style="background: #012178; padding: 7px;font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #FFFFFF; text-transform: capitalize;">Flight</td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; padding: 7px; line-height: 16px; color: #000000; text-transform: capitalize;" ><span style="font-weight: 600; font-size: 14px; line-height: 20px;">${flight.flight}</span> <br>${flight.airline}</td>
                                                                                  </tr>
                                                                                </tbody>
                                                                              </table></td>
                                                                          </tr>
                                                                        </tbody>
                                                                      </table>
                                                                      
                                                                      <!--[if gte mso 9]> </td><td valign="top"><![endif]--><table width="454" border="0" cellspacing="0" cellpadding="0" align="right" class="oc_wrapper oc_border_none" style="border-left: 1px solid #DCDCDC;">
                                                                        <tbody>
                                                                          <tr>
                                                                            <td valign="top" align="center"><table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
                                                                                <tbody>
                                                                                  <tr>
                                                                                    <td align="left" valign="top"><table width="453" border="0" cellspacing="0" cellpadding="0" align="center" class="oc_wrapper">
                                                                                        <tbody>
                                                                                          <tr>
                                                                                            <td align="left" valign="top"><table width="215" border="0" cellspacing="0" cellpadding="0" align="left" class="oc_wrapper">
                                                                                                <tbody>
                                                                                                  <tr>
                                                                                                    <td align="left" valign="top" style=""><table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                                                                        <tbody>
                                                                                                          <tr>
                                                                                                            <td align="left" class="oc_desknone oc_deskshow" valign="middle" style="background: #012178; padding: 7px;font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #FFFFFF; text-transform: capitalize;">Depature</td>
                                                                                                          </tr>
                                                                                                          <tr>
                                                                                                            <td align="left" valign="top" style="padding: 7px;font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize;" ><span style="font-weight: 600; font-size: 14px; line-height: 20px; display: block;">Airport :- ${flight.depature.code} (${flight.depature.name})</span>City :- ${flight.depature.city} <br> Country:- ${flight.depature.country} <br> Date :- ${DateTime.convertDateFormat(flight.depature.date, 'MM/DD/YYYY', 'MMMM Do YYYY')} <br> time :- ${flight.depature.time} </td> 
                                                                                                          </tr>
                                                                                                        </tbody>
                                                                                                      </table></td>
                                                                                                  </tr>
                                                                                                </tbody>
                                                                                              </table>
                                                                                              
                                                                                              <!--[if gte mso 9]> </td><td valign="top"><![endif]-->
                                                                                              
                                                                                              <table width="237" border="0" cellspacing="0" cellpadding="0" align="right" class="oc_wrapper oc_border_none" style="border-left: 1px solid #BFBEBE;" >
                                                                                                <tbody>
                                                                                                  <tr>
                                                                                                    <td align="left" valign="top" style=""><table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                                                                        <tbody>
                                                                                                          <tr>
                                                                                                            <td align="left" class="oc_desknone oc_deskshow" valign="middle" style="background: #012178; padding: 7px;font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #FFFFFF; text-transform: capitalize;">Arrival</td>
                                                                                                          </tr>
                                                                                                          <tr>
                                                                                                            <td align="left" valign="top" style="padding: 7px;font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize;" ><span style="font-weight: 600; font-size: 14px; line-height: 20px; display: block;">Airport :- ${flight.arrival.code} (${flight.arrival.name})</span>Airport :- ${flight.arrival.code}<br> City :- ${flight.arrival.city} <br> Country:- ${flight.arrival.country} <br> Date :- ${flight.arrival.date} <br> Time :- ${flight.arrival.time}
                                                                                                            </td>
                                                                                                          </tr>
                                                                                                        </tbody>
                                                                                                      </table></td>
                                                                                                  </tr>
                                                                                                </tbody>
                                                                                              </table></td>
                                                                                          </tr>
                                                                                        </tbody>
                                                                                      </table></td>
                                                                                  </tr>

       </tbody>
                                                  </table></td>
                                              </tr>
                                              </tbody>
                                          </table></td>
                                      </tr>`
    }
    inventry += `  </tbody>
                                  </table></td>
                              </tr>`

  }

  inventry += `    </tbody>
</table></td>
</tr>`;
  var oderId = `<tr>
<td align="center" valign="top" style="padding-top: 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tbody>
      <tr>
        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize; padding-bottom: 15px;">Booking id : <span style="font-weight: 700;">${param.orderId}</span></td>
      </tr>`;
  var paymentDetail = `<tr>
      <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize; background: #D0D0D0; padding: 10px 15px; font-weight: 700;">Payment details</td>
      </tr>
      <tr>
      <td align="left" valign="top" style="padding-top: 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #DCDCDC; border-bottom: 0px;">
          <tbody>
            <tr>
              <td align="center" valign="top" style="border-bottom: 1px solid #DCDCDC;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tbody>
                    <tr>
                      <td align="center" valign="top" class="oc_w40 oc_f12" style="width: 50px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize; font-weight: 700;">Id</td>
                      <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize;font-weight: 700; text-align: center; ">Amount</td>
                      <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 700; color: #000000; text-transform: capitalize; text-align: center;">Date</td>
                      <td align="center" valign="top" class="oc_f12" style="padding: 7px 0; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; font-weight: 700; text-transform: capitalize; text-align: center;">status</td>
                    </tr>
                  </tbody>
                </table></td>
            </tr>`;

  for (let index = 0; index < param.paymentDetail.length; index++) {
    const element = param.paymentDetail[index];

    paymentDetail += `  <tr>
              <td align="center" valign="top" style="border-bottom: 1px solid #DCDCDC;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tbody>
                    <tr>
                      <td align="center" valign="top" class="oc_w40 oc_f12" style="width: 50px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize; font-weight: 400;">${index + 1}</td>
                      <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize;font-weight: 400; text-align: center; ">${await Generic.formatPriceDecimal(parseFloat(element.amount)) }</td>
                      <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${DateTime.convertDateFormat(element.date, 'MM/DD/YYYY', 'MMMM Do YYYY')}</td>
                      <td align="center" valign="top" class="oc_f12" style="padding: 7px 0; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; font-weight: 400; text-transform: capitalize; text-align: center;">${element.status}</td>
                    </tr>
                  </tbody>
                </table></td>
            </tr>`

  }

  var travelerDetail = `<tr>
    <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize; background: #D0D0D0; padding: 10px 15px; font-weight: 700;">Traveler details</td>
    </tr>
    <tr>
    <td align="left" valign="top" style="padding-top: 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #DCDCDC; border-bottom: 0px;">
        <tbody>
          <tr>
            <td align="center" valign="top" style="border-bottom: 1px solid #DCDCDC;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tbody>
                  <tr>
                    <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 55px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 700; color: #000000; text-transform: capitalize; text-align: center;">No</td>
                    <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 700; color: #000000; text-transform: capitalize; text-align: center;">Name</td>
                    <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 700; color: #000000; text-transform: capitalize; text-align: center;">Email</td>
                    <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 700; color: #000000; text-transform: capitalize; text-align: center;">Type</td>
                  </tr>
                </tbody>
              </table></td>
          </tr>`;

  for (let index = 0; index < param.travelers.length; index++) {
    const element = param.travelers[index];

    travelerDetail += `  <tr>
            <td align="center" valign="top" style="border-bottom: 1px solid #DCDCDC;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tbody>
                  <tr>
                    <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 55px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${index + 1}</td>
                    <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${element.name}</td>
                    <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${element.email}</td>
                    <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${element.type}</td>
                  </tr>
                </tbody>
              </table></td>
          </tr>`

  }

  var ExstraDetail = `   </tbody>
        </table></td>
    
        </tr>
  </tbody>
</table></td>
</tr>
      <tr>
        <td align="center" valign="top" style="padding-top: 15px;"><table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tbody>
              `
  if (param.flightData[0].status != "Confirm") {
    ExstraDetail += `<tr>
              <td align="left" valign="top" style="border-top:1px solid #ddd; border-bottom:1px solid #ddd; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: red;padding: 10px 0 10px; text-align: left;"><span style="font-weight: 700;">*Ticket ${param.flightData[0].status}</span></td>
            </tr>`
              // <tr>
              //   <td style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: red;padding: 10px 10px 0; text-align: left; " valign="top" align="left">* We will send you a separate email within 3-24 hours, once the ticket is confirmed. If you are travelling within 24 hrs, please contact us immediately.</td>
              // </tr>
  }
  else {
    ExstraDetail += `<tr>
                <td align="left" valign="top" style="border-top:1px solid #ddd; border-bottom:1px solid #ddd; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: blue;padding: 10px 0 10px; text-align: left;"><span style="font-weight: 700;">*Ticket ${param.flightData[0].status}</span></td>
              </tr>`
  }
  ExstraDetail += `<tr>
                <td style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 10px 10px 0; text-align: left; " valign="top" align="left"><ul style="margin:0; padding:0 0 0 15px;">
                    <li style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-bottom:5px;">Refer your eTicket for detailed flight itinerary, fare rules & baggage policy.</li>
                    <li style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-bottom:5px;">All timings mentioned above are local timings for that particular city/country.</li>
                  </ul></td>
              </tr>
            </tbody>
          </table></td>
      </tr>
    </tbody>
  </table></td>
</tr>
</tbody>
</table></td>
</tr>
</table></td>
</tr>
</table>`;


  const content = basicContaint + inventry + oderId + paymentDetail + travelerDetail + ExstraDetail;

  return EmailHeader + content + EmailFooter;
}



