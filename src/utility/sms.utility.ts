import { Injectable } from "@nestjs/common";
import { InjectTwilio, TwilioClient } from "nestjs-twilio";
import * as config from "config";

const twilio = config.get("twilio");
var client = require('twilio')(
    twilio.accountSid,
    twilio.authToken
);

export class TwilioSMS {

    static sendSMS({ toSMS, message }) {
        client.messages.create({
            body: message,
            from: twilio.smsNumber,
            to: toSMS,
        }).then((res)=>{
            console.log("res",res);
        }).catch((error)=>{
            console.log("err",error)
        })
    }
}


// console.log(toSMS);
// try {
//      return client.messages.create({
//         body: message,
//         from: twilio.smsNumber,
//         to: toSMS,
//     });
// } catch (e) {
//    console.log("sms error",e);
//    return e;
// }