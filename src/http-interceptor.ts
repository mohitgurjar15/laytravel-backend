import { Injectable, NestMiddleware, Logger } from "@nestjs/common";

import { Request, Response, NextFunction } from "express";
import { Activity } from "./utility/activity.utility";

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
    private logger = new Logger("HTTP");

    use(request: Request, response: Response, next: NextFunction): void {
        const { ip, method, path: url , body , headers } = request;
        const userAgent = request.get("user-agent") || "";

        response.on("close", () => {
            const { statusCode, statusMessage } = response;
            const contentLength = response.get("content-length");

             let logData = {};
                logData["request"] = { ip, method, path: url, body, headers };
                logData["response"] = { statusCode, statusMessage };
                let responceTime = `${new Date()}`;
                logData["responceTime"] = responceTime;
                
                let fileName = `${new Date().getTime()}`;
                
                Activity.createlogFile(fileName, logData, "internal-close");

            
        });

        response.on("finish", () => {
            const { statusCode, statusMessage } = response;
            const contentLength = response.get("content-length");

            let logData = {};
            logData["request"] = { ip, method, path: url, body, headers };
            logData["response"] = { statusCode,statusMessage };
            let responceTime = `${new Date()}`;
            logData["responceTime"] = responceTime;

            let fileName = `${new Date().getTime()}`;

            Activity.createlogFile(fileName, logData, "internal-finish");

        });

        response.on("error", () => {
            const { statusCode,statusMessage } = response;
            const contentLength = response.get("content-length");

            let logData = {};
            logData["request"] = { ip, method, path: url, body, headers };
            logData["response"] = { statusCode, statusMessage };
            let responceTime = `${new Date()}`;
            logData["responceTime"] = responceTime;

            let fileName = `${new Date().getTime()}`;

            Activity.createlogFile(fileName, logData, "internal-error");

        });

        next();
    }
}
