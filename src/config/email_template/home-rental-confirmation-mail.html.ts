import { EmailHeader } from "./header.html";
import { EmailFooter } from "./footer.html";
import { BaseUrl } from "../base-url";
import { HomeRentalBookingParameterModel } from "./model/home-rental-booking-email-parameter.model";

export function HomeRentalBookingConfirmationMail(param: HomeRentalBookingParameterModel) {
    var basicContaint = `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f2f2f2;" class="full-wrap">
        <tr>
          <td align="center" valign="top">
            <table align="center" style="width:600px; max-width:600px; table-layout:fixed;" class="oc_wrapper" width="600" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" valine="top" style="background-color: #ffffff;"><table width="600" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 600px;" class="oc_wrapper">
                    <tbody>
                      <!-- <tr>
                                              <td style="font-family: 'Poppins', sans-serif;font-size: 20px; line-height: 24px; color: #444; font-weight:700; padding: 15px; text-align: center;" valign="top" align="left">Home Rental Booking Confirmation</td>
                                          </tr> -->
                      <tr>
                        <td align="center" valine="top" style="padding: 10px 15px 30px; background: #ffffff;"><table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
                            <tbody>
                              <tr>
                                <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #000000;padding: 20px 0; text-align: left;"> Hello <span style="font-weight: 700;"> ${param.user_name}</span></td>
                              </tr>`;

    var home_rental_info = `<tr>
                              <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 16px; line-height: 20px; color: #000000;padding: 0 0 5px; text-align: left; font-weight: 700;"> Home Rental Information </td>
                              </tr>
                              <tr>
                              <td align="center" valign="top" style="border: 1px solid #D9D9D9;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                                  <tbody>
                                  <tr>
                                      <td align="center" valign="top" class="oc_none"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                                          <tbody>
                                          <tr>
                                          <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;"><span style="font-weight: 700;"><span">Home Rental Name:</span>${param.hotelData.property_name}</span> <a href="javascrip:void(0);" target="_blank" style="text-decoration: none; color: #1943ff;"> <br /> </td>
                                      </tr>
                                      <tr>
                                          <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;"><span"><span style="font-weight: 700;">City:</span>${param.hotelData.city}</span> <a href="javascrip:void(0);" target="_blank" style="text-decoration: none; color: #1943ff;"></a> <br /> </td>
                                      </tr>
                                      <tr>
                                          <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;"><span style="font-weight: 700;"><span style="font-weight: 700;">Country:</span>${param.hotelData.country}</span> <a href="javascrip:void(0);" target="_blank" style="text-decoration: none; color: #1943ff;"></a> <br /> </td>
                                     </tr>
                                      <tr>
                                          <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;"><span style="font-weight: 700;">Check-in:</span> ${param.hotelData.check_in_date}</td>
                                      </tr>
                                      <tr>
                                          <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;"><span style="font-weight: 700;">Check-Out:</span> ${param.hotelData.check_out_date}</td>
                                      </tr>
                                      <tr>
                                          <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;"><span style="font-weight: 700;">Room Details:</span> Standard King Room x 2 | Room only x 2</td>
                                      </tr>
                                      <tr>
                                          <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;"><span style="font-weight: 700;">Adults:</span> 4 <span style="font-weight: 700;">Child:</span> 0 <span style="font-weight: 700;">Rooms:</span> 2 </td>
                                      </tr>
                                  
                                      <tr>
                                          <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;"><span style="font-weight: 700;">Guest Name(s):</span> Ahoutou Valerie KOKO</td>
                                      </tr>
                                      <tr>
                                          <td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;">Reservation <span style="font-weight: 700;">165078</span></td>
                                      </tr>
                                          </tbody>
                                      </td>`;

    home_rental_info += `    </tbody>
    </table></td>
    </tr>`;
    var oderId = `<tr>
    <td align="center" valign="top" style="padding-top: 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize; padding-bottom: 15px;">Order id : <span style="font-weight: 700;">${param.orderId}</span></td>
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
                          <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize;font-weight: 400; text-align: center; ">${element.amount}</td>
                          <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${element.date}</td>
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
                        <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 55px; padding: 14px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${index + 1}</td>
                        <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 14px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${element.name}</td>
                        <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 14px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${element.email}</td>
                        <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 14px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${element.type}</td>
                      </tr>
                    </tbody>
                  </table></td>
              </tr>`

    }

    var cancellation_policy = `<tr>
        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; color: #000000; text-transform: capitalize; background: #D0D0D0; padding: 10px 15px; font-weight: 700;">Cancellation Policy Details</td>
        </tr>
        <tr>
        <td align="left" valign="top" style="padding-top: 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #DCDCDC; border-bottom: 0px;">
            <tbody>
              <tr>
                <td align="center" valign="top" style="border-bottom: 1px solid #DCDCDC;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 55px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 700; color: #000000; text-transform: capitalize; text-align: center;">No</td>
                        <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 7px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 700; color: #000000; text-transform: capitalize; text-align: center;">Cancel policy</td>
                      </tr>
                    </tbody>
                  </table></td>
              </tr>`;

    for (let index = 0; index < param.hotelData.cancellation_policy.penalty_info.length; index++) {
        const element = param.hotelData.cancellation_policy.penalty_info[index];

        cancellation_policy += `  <tr>
                <td align="center" valign="top" style="border-bottom: 1px solid #DCDCDC;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 55px; padding: 14px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${index + 1}</td>
                        <td align="center" class="oc_w85 oc_f12" valign="top" style="width: 110px; padding: 14px 0; border-right: 1px solid #DCDCDC; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 16px; font-weight: 400; color: #000000; text-transform: capitalize; text-align: center;">${element}</td>
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


    ExstraDetail += `<tr>
                    <td align="left" valign="top" style="border-top:1px solid #ddd; border-bottom:1px solid #ddd; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: blue;padding: 10px 0 10px; text-align: left;"><span style="font-weight: 700;">*Ticket</span></td>
                  </tr>`
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
    const content = basicContaint + home_rental_info + oderId + paymentDetail + cancellation_policy + travelerDetail + ExstraDetail;

    return EmailHeader + content + EmailFooter;
}