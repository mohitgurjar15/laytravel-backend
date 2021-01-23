import { Injectable } from "@nestjs/common";
import { InjectTwilio, TwilioClient } from "nestjs-twilio";
import * as config from "config";

const twilio = config.get("twilio");

@Injectable()
export class TwilioSMS {

    constructor(
        @InjectTwilio() private readonly client: TwilioClient
    ) { }

     sendSMS({ toSMS, message }) {
        try {
            return this.client.messages.create({
                body: message,
                from: twilio.smsNumber,
                to: toSMS,
            });
        } catch (e) {
            return e;
        }
    }
}