import { EmailHeader } from './header.html';
import {  EmailFooter} from './footer.html';

export function subscribeForNewsUpdates()
{
const content = `
<table width='100%' border='0' cellspacing='0' cellpadding='0'  style='background: #f2f2f2;' class='full-wrap'>
<tr>
    <td align='center' valign='top'>
        <table align='center' style='width:600px; max-width:600px; table-layout:fixed;' class='oc_wrapper' width='600' border='0' cellspacing='0' cellpadding='0'>
            <tr>
                <td align='center' valine='top' style='background-color: #ffffff;'>
                    <table width='600' border='0' cellspacing='0' cellpadding='0' align='center' style='width: 600px;' class='oc_wrapper'>
                        <tbody>
                            <tr>
                                <td align='center' valine='top' style='padding: 10px 15px 30px; background: #ffffff;'>
                                    <table width='100%' border='0' cellspacing='1px' cellpadding='10px' align='center' style='width: 100%'>
                                        <tr><td align='left' valign='top' style='font-family: 'Open Sans'>
                Hi There,
                </td></tr><tr><tr></tr><td align='left' valign='top' style='font-family: 'Open Sans'>
                Welcome to the world of stress-free travel – both your mind and wallet are going to enjoy this journey just like we are thrilled to have you on board.
                </td></tr><tr><tr></tr><td align='left' valign='top' style='font-family: 'Open Sans'>
                Be a part of a global community, where inspiring experiences await.
                </td></tr><tr><td align='left' valign='top' style='font-family: 'Open Sans'>
                If you are planning to travel, we are your Gateway!
                </td></tr><tr><tr></tr><td align='left' valign='top' style='font-family: 'Open Sans'>
                <b> Enjoy the best deals: </b>Forget comparing prices on multiple portals. Our website is updated in real-time with the changes in prices. And as our esteemed member, we keep you informed about the drops/peaks.
                </td></tr><tr><tr></tr><td align='left' valign='top' style='font-family: 'Open Sans'>
                <b>Partial payments:</b> Only a travel enthusiast can understand how worrisome it is to pay the large booking price at once. This is why we bring you no-interest payment options with NO hidden charges. How’s that?
                </td></tr><tr><tr></tr><td align='left' valign='top' style='font-family: 'Open Sans'>
                <b>Get inspired or inspire others:</b> Explore travel through our lens – from blogs and travelogues to a community of like-minded travelers. Share your stories to inspire others or try a new adventure based on our recommendations.
                </td></tr><tr><tr></tr><td align='left' valign='top' style='font-family: 'Open Sans'>
                Get a little extra from every vacation as a member!
                </td></tr><tr><tr></tr><td align='left' valign='top' style='font-family: 'Open Sans'>
                <b>Our subscribed members enjoy these benefits:</b>
                </td></tr><tr><tr></tr><td align='left' valign='top' style='font-family: 'Open Sans'>
                <p>- Partial payment option on all bookings</p>
                </td></tr><tr><tr></tr><td align='left' valign='top' style='font-family: 'Open Sans'>
                <p>- Laytrip reward points with unlimited validity</p>
                </td></tr><tr><tr></tr><td align='left' valign='top' style='font-family: 'Open Sans'>
                <p>- Special discounts up to 30% on flights, hotels, and accommodations</p>
                </td></tr>
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