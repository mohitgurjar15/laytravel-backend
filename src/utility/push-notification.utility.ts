var FCM = require('fcm-node');
import * as config from "config";
const fcmServerKey = config.get("fcmServerKey");

export class PushNotification {

	static sendPushNotification(tokens, data, pushData, deviceType) {
		try {
			var fcm = new FCM(fcmServerKey);
			let message = {

				registration_ids: tokens,
				data: data,
				notification : pushData,
				priority: 'high',
			};

			fcm.send(message, function (err, response) {
				if (err) {
					console.log(err);
				} else {
					console.log("Successfully sent with response: ", response);
				}
			});
		} catch (error) {
			console.log(error);
		}
	}
}