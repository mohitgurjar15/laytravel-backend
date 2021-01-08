import { EmailHeader } from "./header.html";
import { EmailFooter } from "./footer.html";
import { BaseUrl } from "../base-url";
import { HotelBookingParam } from "./model/hotel-booking-param.model";

export function HotelBookingConfirmationMail(details: HotelBookingParam) {
    
    let lay_credit_block = ``;

    if (details.lay_credits) {
        lay_credit_block = `<tr>
            <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;">
                <span style="font-weight: 600;">Laytrip Points:</span> ${details.lay_credits}
            </td>
        </tr>`;
    }

    const content = `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f2f2f2;" class="full-wrap">
		<tr>
			<td align="center" valign="top">
				<table align="center" style="width:600px; max-width:600px; table-layout:fixed;" class="oc_wrapper" width="600" border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td align="center" valine="top" style="background-color: #ffffff;">
							<table width="600" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 600px;" class="oc_wrapper">
								<tbody>
									<tr>
										<td style="font-family: 'Poppins', sans-serif;font-size: 20px; line-height: 24px; color: #444; font-weight:700; padding: 15px; text-align: center;" valign="top" align="left">Hotel Booking Confirmation</td>
									</tr>
									<!--<tr>
										<td align="center" valign="top">
											<img src="Images/banner_img.jpg" border="0" alt="Banner" style="width: 100%; max-width: 600px;" class="oc_img100">
										</td>
									</tr>-->
									<tr>
										<td align="center" valine="top" style="padding: 10px 15px 10px; background: #ffffff;">
											<table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="width: 100%">
												<tbody>
													<tr>
														<td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 22px; line-height: 24px; color: #000000;padding-top: 20px; text-align: left;">Hello <span style="font-weight: 700;">${details.full_name}</span>
														</td>
													</tr>
													<tr>
														<td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 15px 0; text-align: left;">The total cost of your reservation is <span style="font-weight: 700;">${details.amount}</span>
														</td>
													</tr>
													<tr>
														<td align="center" valign="top" style="padding-bottom: 10px;">
															<table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
																<tbody>
																	<tr>
																		<td align="left" valign="top" style="background: #526ad5; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #fff;padding: 10px; text-align: left; font-weight: 700;">Hotel</td>
																	</tr>
																	<tr>
                                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;">
                                                                            <span style="font-weight: 600;">${details.hotel.name}</span>
																			<a href="https://www.google.com/maps/place/${details.hotel.latitude},${details.hotel.longitude}" target="_blank" style="text-decoration: none; color: #1943ff;">View Map & Directions</a>
                                                                            <br />${details.hotel.full_address}
                                                                        </td>
																	</tr>
																	<tr>
                                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;">
                                                                            <span style="font-weight: 600;">Check-in:</span> ${details.check_in}
                                                                        </td>
																	</tr>
																	<tr>
                                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;">
                                                                            <span style="font-weight: 600;">Check-Out:</span> ${details.check_out}
                                                                        </td>
																	</tr>
																	<tr>
                                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;">
                                                                            <span style="font-weight: 600;">Room Details:</span> ${details.room.name} x ${details.rooms} 
                                                                        </td>
																	</tr>
																	<tr>
                                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;">	
                                                                            <span style="font-weight: 600;">Adults:</span> ${details.adults}
                                                                            <span style="font-weight: 600;">Child:</span> ${details.child}
                                                                            <span style="font-weight: 600;">Rooms:</span> ${details.rooms}
                                                                        </td>
																	</tr>
																	<tr>
                                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;">
                                                                            <span style="font-weight: 600;">Guest Name(s):</span> ${details.guest_names.join(', ')}
                                                                        </td>
																	</tr>
																	<tr>
                                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;">Reservation
                                                                            <span style="font-weight: 600;">${details.book_id}</span>
																		</td>
																	</tr>
																</tbody>
															</table>
														</td>
													</tr>
													<tr>
														<td align="center" valign="top" style="padding-bottom: 10px;">
															<table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                                                                <tbody>
																	<tr>
																		<td align="left" valign="top" style="background: #526ad5; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #fff;padding: 10px; text-align: left; font-weight: 700;">Billing Information</td>
                                                                    </tr>
                                                                    ${lay_credit_block}
																	<tr>
                                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;">
                                                                            <span style="font-weight: 600;">Cardholder Name:</span> ${details.card.holder_name}
                                                                        </td>
																	</tr>
																	
																	<tr>
                                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;">
                                                                            <span style="font-weight: 600;">Visa ending in</span> ${details.card.digits}
                                                                        </td>
																	</tr>
																	<tr>
                                                                        <td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #000000;padding: 5px 10px; text-align: left;">
                                                                        <span style="font-weight: 600;">Amount:</span> ${details.amount} </td>
																	</tr>
																</tbody>
															</table>
														</td>
													</tr>
													<!--<tr>
														<td align="center" valign="top" style="padding-bottom: 10px;">
															<table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
																<tbody>
																	<tr>
																		<td align="left" valign="top" style="background: #526ad5; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #fff;padding: 10px; text-align: left; font-weight: 700;">Terms and Conditions</td>
																	</tr>
																	<tr>
																		<td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 12px; line-height: 16px; color: #000000;padding-top: 10px; text-align: left;">Unless otherwise specified in the Cancellation Policy below, this purchase is non-refundable. By proceeding with this reservation, you agree to all Terms and Conditions, which include the Cancellation Policy and all terms and conditions contained in the Laytrip Member Agreement.
																			<br />
																			<br />You agree to pay the cost of your reservation. If you do not pay this debt and it is collected through the use of a collection agency, an attorney, or through other legal proceedings, you agree to pay all reasonable costs or fees, including attorney fees and court costs, incurred in connection with such collection effort.
																			<br />
																			<br />* Generally, hotel check-in times begin after 14:00 hours (2:00pm local time), and the latest check-out time on date of departure is 12:00 hours (12:00pm local time) but may vary depending on accommodations.
																			<br />
																			<br />* Must have two forms of identification at time of check-in. A valid driver's license, Military ID or Passport and a major credit card for security deposit. Security deposit may vary. Guest understands that the payment shall be automatically debited on the day of the initiation of their order.
																			<br />
																			<br />*Although bed types may be specified at the time of booking, Laytrip cannot guarantee that rooms with the indicated bed type will be available at check-in. Laytrip will make every effort to confirm this, however, available bed types are at the discretion of the property.
																			<br />
																			<br />* During periods of high occupancy, it is possible that a room may not be available upon arrival. Rooms will be made available for check-in as soon as possible. Luggage storage is available for early arrivals depending on availability and accommodations.
																			<br />
																			<br />* The accommodations shall provide guests with complete access and use of the hotel's services, amenities and recreational facilities except any services, amenities and facilities that require additional charges or fees.
																			<br />
																			<br />* The hotel reserves the right to refuse check-in to any party arriving at a hotel with more than the maximum number of guests allowed for the specific reserved room types.
																			<br />
																			<br />* In the event Laytrip is informed by the hotel/ resort developer that your selected travel dates are unavailable, Laytrip reserves the right to offer substitute accommodations of equal or greater value if available or you will receive a full refund for the total monies paid to Laytrip excluding additional fees incurred for previous reservation modifications.
																			<br />
																			<br />* All Travelers, including children must have current and valid personal and family documentation, such as passports, visas or national identifying documents, as required for the applicable destination of your vacation.
																			<br />
																			<br />* Travelers luggage and belongings must be clearly labeled with name and destination address. Travelers are solely responsible for their belongings at all times during the vacation. All luggage and personal belongings are carried at Traveler's own risk.
																			<br />
																			<br />* Customers should review and comply with any additional requirements referenced on any tickets or related documentation during the vacation. The Traveler must make any claims for the loss or damage of luggage or personal belongings directly with the applicable resort or travel service company.
																			<br />
																			<br />* All purchased services are specified in the reservation confirmation, with the exception of those accommodation providers for which the inclusion of other services is specifically indicated. The price may not include extra accommodations charges or fees, service fees, handling fees, destinations surcharges, duties and taxes or incidentals, such as, but not limited to, telephone calls, insurance, laundry service, minibar, parking, etc. which is the responsibility of the Traveler shall be paid directly by the Traveler to the accommodations or service provider. Some countries have a local tax known as 'stay tax' or 'tourist tax' (eco-tax) which must be paid directly at the establishment and/or the country airport by the Traveler. The Russian tourist tax must be paid directly by the Traveler at the first hotel the Traveler stays at in the country.
																			<br />
																			<br />* Travelers must make special requests at the time the reservation is placed regarding additional requirements for children such as a crib or child care. Availability of specially requested items is subject to availability and at the discretion of the accommodating property.
																			<br />
																			<br />* Most accommodation providers will treat a reservation with three people as a double room with an extra bed, which additional costs may apply. Any additional fees must be paid by the Traveler directly to the accommodations unless specifically designated in the reservation confirmation and paid for prior to arrival.
																			<br />
																			<br />* No Refunds will be given for No Shows, Unused Nights, or Early Checkouts.
																			<br />
																			<br />* Laytrip is not responsible for any acts and/or omissions of accommodations, their employees, agents, or representatives. All certificates and other travel documents for services issues by Laytrip are subject to the terms and conditions specified by the supplier and the laws of the countries in which the services are supplied. Laytrip, its agents, officers and/or suppliers of services pursuant to, or in connection with these itineraries, does not assume any liability whatsoever for any injury, damage, death, loss, accident or delay to person or property due to an act of negligence or default of others, including any hotel, carrier, restaurant, company or person rendering any of the services included in the tour, or by act of God. Further, no responsibilities are accepted for any damage or delay due to sickness, pilferage, labor disputes, machinery breakdown, quarantine, government restraints, weather or other causes beyond Laytrip control. No responsibility is accepted for any additional expense, omissions, delays, re-routing or acts of any government or authority.
																			<br />
																			<br />*Laytrip does not guarantee the accuracy of, and disclaim all liability for any errors or inaccuracies relating to the information or descriptions of any travel service or product offer displayed on this Website (including, without limitation pricing, photos, amenities, product descriptions, inclusions, terms and conditions, and similar) In the event that an offer is listed at an incorrect price or with incorrect information, including hotel name or location, we reserve the right to update pricing at any time, before or after a reservation is booked, without liability, including direct or indirect losses to customer as a result. In such event, we will offer the opportunity to keep reservation at the corrected pricing, or cancel the reservation without penalties or fees.
																			<br />
																			<br />* Travel suppliers may change their rates at any time without notice and at their sole discretion. The total paid for a reservation may vary from the cost in effect at the time of actual use of the travel service
																			<br />
																			<br />By booking with Laytrip’s online payment platform, you agree to the Terms and Conditions, Cancellation Policy and our Privacy Policy, along with this Chargeback Policy.
																			<br />
																			<br />Chargebacks occur when your credit card provider requests that Laytrip returns monies on a transaction which you dispute or claim is fraudulent. Laytrip recognizes that chargebacks can happen for a variety of valid reasons. However, if you make a credit card payment through Laytrip in respect to a booking, and you later dispute this legitimate charge by raising a chargeback without merit (in our sole discretion), whether fraudulently or otherwise, we may take steps to recover any charges resulting from such an unmerited chargeback from you directly. Unmerited chargebacks include but are not limited to: disputing a charge made in accordance with the Cancellation policy; disputing a charge made in respect of the rental in which you fail to make reasonable efforts to work with the Laytrip or rental provider to resolve any issues; or requesting a chargeback without a legitimate reason and/or failing to provide any supporting information in respect of the chargeback to allow those parties from which the chargeback is requested to assess the basis of the chargeback request.
																			<br />
																			<br />Laytrip takes a zero tolerance approach to chargeback fraud. Furthermore, in the event of any unmerited chargeback requests, we reserve the right to recover monies by any legitimate means available to us, including using a third-party debt collection agency, or any other lawful means to recover funds successfully charged back to you in such cirumstances.</td>
																	</tr>
																</tbody>
															</table>
														</td>
													</tr>
													<tr>
														<td align="center" valign="top" style="padding-bottom: 10px;">
															<table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
																<tbody>
																	<tr>
																		<td align="left" valign="top" style="background: #526ad5; font-family: 'Poppins', sans-serif;font-size: 14px; line-height: 18px; color: #fff;padding: 10px; text-align: left; font-weight: 700;">Hotel Cancellation Policy</td>
																	</tr>
																	<tr>
																		<td align="left" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 12px; line-height: 16px; color: #000000;padding-top: 10px; text-align: left;">Unless otherwise specified in the Cancellation Policy below, this purchase is non-refundable. By proceeding with this reservation, you agree to all Terms and Conditions, which include the Cancellation Policy and all terms and conditions contained in the Laytrip Member Agreement.</td>
																	</tr>
																</tbody>
															</table>
														</td>
													</tr> -->
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
