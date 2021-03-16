import {
  FacebookSocialLink,
  InstagramSocialLink,
  LinkedInSocialLink,
  NewEmailAssets,
  PintrestSocialLink,
  TermsConditonLink,
  TwitterSocialLink,
} from "../base-url";

export const LaytripFooter = `
<tr>
<td align="center" valign="top" style="padding: 20px 0;">
    <table  border="0" cellspacing="0" cellpadding="0" align="center">
        <tbody>
            <tr>
                <td align="left" valign="middle">
                    <a href="${InstagramSocialLink}" target="_blank" style="text-decoration: none;">
                        <img src="${NewEmailAssets}/instagram.png" alt="instagram" width="40" height="40" border="0" style="display: block; max-width:40px; font-size: 18px; line-height: 40px; color: #ffffff; " />
                    </a>
                </td>
                <td width="24" style="width: 24px;">&nbsp;</td>
                <td align="left" valign="middle">
                    <a href="${TwitterSocialLink}" target="_blank" style="text-decoration: none;">
                        <img src="${NewEmailAssets}/twitter.png" alt="twitter" width="40" height="40" border="0" style="display: block; max-width:40px; font-size: 18px; line-height: 40px; color: #ffffff; " />
                    </a>
                </td>
                <td width="24" style="width: 24px;">&nbsp;</td>
                <td align="left" valign="middle">
                    <a href="${FacebookSocialLink}" target="_blank" style="text-decoration: none;">
                        <img src="${NewEmailAssets}/facebook.png" alt="facebook" width="40" height="40" border="0" style="display: block; max-width:40px;font-size: 18px; line-height: 40px; color: #ffffff; " />
                    </a>
                </td>
                <td width="24" style="width: 24px;">&nbsp;</td>
                <td align="left" valign="middle">
                    <a href="${PintrestSocialLink}" target="_blank" style="text-decoration: none;">
                        <img src="${NewEmailAssets}/pintrest.png" alt="pintrest" width="40" height="40" border="0" style="display: block; max-width:40px; font-size: 18px; line-height: 40px; color: #ffffff; " />
                    </a>
                </td>
                <td width="24" style="width: 24px;">&nbsp;</td>
                <td align="left" valign="middle">
                    <a href="${LinkedInSocialLink}" target="_blank" style="text-decoration: none;">
                        <img src="${NewEmailAssets}/linked-in.png" alt="linked-in" width="40" height="40" border="0" style="display: block; max-width:40px; font-size: 18px; line-height: 40px; color: #ffffff; " />
                    </a>
                </td>
            </tr>
        </tbody>
    </table>
</td>
</tr>
<tr>
<td align="center" style="padding: 0px 15px 30px;">
    <table align="center" style="width:100%;" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 12px; line-height: 16px; color: #707070; font-weight: 400;">Need help? Go to our home page Customer Service chat or <a href="mailto:contactus@laytrip.com" target="_blank" style="text-decoration: none; color: #0043ff;">Contact Us</a>.</td>
        </tr>
        <tr>
            <td align="center" valign="top" style="font-family: 'Poppins', sans-serif;font-size: 12px; line-height: 16px; font-weight: 400; color: #707070; padding-top: 20px; ">We have sent you this email because as a Laytrip account holder you agreed to our <a href="${TermsConditonLink}" target="_blank" style="text-decoration: none; color: #0043ff;">Terms</a>. To Change your preferences, sign in and go to your My Account menu.</td>
        </tr>
    </table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>

</html>`;
