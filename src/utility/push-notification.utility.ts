var FCM = require('fcm-node');
import * as config from "config";
import { UserDeviceDetail } from "src/entity/user-device-detail.entity";
import { getConnection } from "typeorm";
import { Notification } from "../entity/notification.entity";
const fcmServerKey = config.get("fcmServerKey");



export class PushNotification {

	static sendPushNotification(tokens, data, pushData, deviceType) {
		try {
			var fcm = new FCM(fcmServerKey);

			let message = {

				registration_ids: tokens,
				data: data,
				notification: pushData,
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

	static async sendNotificationTouser(userId, data, pushData, fromUser) {
		const devices = await getConnection()
			.createQueryBuilder(UserDeviceDetail, "userDeviceDetails")
			.where(`"userDeviceDetails"."user_id" = '${userId}'`)
			.getMany()
		
		if (devices.length) {
			var iosTokens = []
			var androidTokens = []

			for await (const device of devices) {
				if (device.deviceToken) {
					if (device.deviceType == 1) {
						androidTokens.push(device.deviceToken)
					}
					else {
						iosTokens.push(device.deviceToken)
					}

				}
			}
			try {
				var fcm = new FCM(fcmServerKey);

				if (iosTokens.length) {
					let message = {

						registration_ids: iosTokens,
						data: data,
						notification: pushData,
						priority: 'high',
					};
					fcm.send(message, function (err, response) {
						if (err) {
							console.log(err);
						} else {
							console.log("Successfully sent with response: ", response);
						}
					});


				}

				if (androidTokens.length) {
					let message = {
						registration_ids: androidTokens,
						data: {
							data: data,
							notification: pushData,
							priority: 'high',
							to: "ffEseX6vwcM:APA91bF8m7wOF MY FCM ID 07j1aPUb"
						}
					};
					fcm.send(message, function (err, response) {
						if (err) {
							console.log(err);
						} else {
							console.log("Successfully sent with response: ", response);
						}
					});
				}



				const notification = new Notification

				notification.moduleId = data.module_id || null
				notification.fromUser = fromUser
				notification.type = data.task || ''
				notification.toUser = userId
				notification.resourceId = data.bookingId || data.instalmentId || '';
				notification.message = pushData.title
				notification.createdDate = new Date();

				notification.save();
			} catch (error) {
				console.log(error);
			}
		}
	}

}