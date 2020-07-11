import { ActivityLog } from "src/entity/activity-log.entity";
import { getConnection } from "typeorm";

export class  Activity{

    static logActivity(userId:string,moduleName:string,activityName:string){

        const activity = new ActivityLog();
        activity.userId = userId;
        activity.moduleName=moduleName;
        activity.activityName=activityName;
        activity.createdDate= new Date();
        getConnection()
            .createQueryBuilder()
            .insert()
            .into(ActivityLog)
            .values(activity)
            .execute();
    }
}