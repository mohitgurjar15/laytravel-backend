import { EmailHeader } from "./header.html";
import {  EmailFooter} from "./footer.html";
import { BaseUrl } from "../base-url";

export function subscribeForNewsUpdates()
{
const content = `<table width="100%" border="0" cellspacing="0" cellpadding="0"  style="background: #f2f2f2;" class="full-wrap">
<tr>
<td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 22px; line-height: 24px; color: #444444;padding-top: 20px; text-align: center; font-weight: 700;">Hello</span></td>
</tr>
<tr>
<td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;"> This mail send because you have subscribe to a laytrip.com </td>
</tr>
<tr>
<td align="left" valign="top" style="font-family: 'Open Sans', sans-serif;font-size: 14px; line-height: 18px; color: #000;padding-top: 15px; text-align: center;"> If you not subscribe and not need to get updates than please unsubscribe your email from unsubscribe button</td></tr></table>`;
return EmailHeader + content + EmailFooter;
}