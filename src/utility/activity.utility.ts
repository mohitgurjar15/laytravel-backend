import { ActivityLog } from "src/entity/activity-log.entity";
import { getConnection } from "typeorm";
const fs = require('fs');

export class Activity {

    static logActivity(userId: string, moduleName: string, activityName: string) {

        const activity = new ActivityLog();
        activity.userId = userId;
        activity.moduleName = moduleName;
        activity.activityName = activityName;
        activity.createdDate = new Date();
        getConnection()
            .createQueryBuilder()
            .insert()
            .into(ActivityLog)
            .values(activity)
            .execute();
    }

    static createlogFile(filename, logData , folderName) {
        console.log(logData);
        
        const path = '/var/www/html/logs/' + folderName +'/'
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
        fs.promises.writeFile(path + filename,JSON.stringify(logData))
    }
}