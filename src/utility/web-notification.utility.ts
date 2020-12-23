import { Notification } from "../entity/notification.entity";
import { WebPushNotifications } from "src/entity/web-push-notification.entity";
import { getConnection } from "typeorm";
import * as config from "config";
const webNotificationKeys = config.get("webNotificationkeys");



export class WebNotification {

    static async sendNotificationTouser(userId, data, pushData, fromUser = null, action: object[] = []) {
        const tokens = await getConnection()
            .createQueryBuilder(WebPushNotifications, "notification")
            .where(`"notification"."user_id" = '${userId}'`)
            .getMany()
        console.log(tokens);

        if (tokens.length) {
            try {


                for await (const token of tokens) {
                    const webpush = require('web-push');

                    webpush.setVapidDetails(
                        webNotificationKeys.mailTo,
                        webNotificationKeys.publicKey,
                        webNotificationKeys.privateKey
                    );
                    const pushSubscription = {
                        endpoint: token.endPoint,
                        keys: {
                            auth: token.authKeys,
                            p256dh: token.P256dhKeys
                        }
                    };
                    data['dateOfArrival'] = Date.now()
                    data['primaryKey'] = 1
                    const notificationPayload = {
                        "notification": {
                            "title": pushData.title,
                            "body": pushData.body,
                            "icon": webNotificationKeys.icon,
                            "vibrate": [100, 50, 100],
                            "data": data,
                            "actions": []
                        }
                    };

                    if (action.length) {
                        notificationPayload['notification']['actions'] = action
                    }
                    webpush.sendNotification(pushSubscription, JSON.stringify(notificationPayload));
                }

                // const record = new Notification

                // record.moduleId = data.module_id || null
                // record.fromUser = fromUser
                // record.type = data.task || ''
                // record.toUser = userId
                // record.resourceId = data.bookingId || data.instalmentId || '';
                // record.message = pushData.title
                // record.createdDate = new Date();

                // record.save();
            } catch (error) {
                console.log(error);
            }
        }
    }

}