import { Injectable, NestMiddleware, Logger } from "@nestjs/common";

import { Request, Response, NextFunction } from "express";
import { Activity } from "./utility/activity.utility";

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
    private logger = new Logger("HTTP");

    use(request: Request, response: Response, next: NextFunction): void {
        //console.log(request);

        let restrictedPath = ["/v1/auth/signup", "/v1/auth/signin"];
        const { ip, method, url, body, headers, baseUrl } = request;

        const req = JSON.stringify(request, this.replacerFunc());

        const userAgent = request.get("user-agent") || "";

        console.log(baseUrl);

        if (restrictedPath.indexOf(baseUrl) == -1) {
            response.on("close", () => {
                const { statusCode, statusMessage } = response;
                const contentLength = response.get("content-length");

                let logData = {};
                logData["request"] = {
                    ip,
                    method,
                    path: baseUrl,
                    body,
                    headers,
                };
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
                logData["request"] = {
                    ip,
                    method,
                    path: baseUrl,
                    body,
                    headers,
                };
                logData["req"] = req;
                logData["response"] = { statusCode, statusMessage };
                let responceTime = `${new Date()}`;
                logData["responceTime"] = responceTime;

                let fileName = `${new Date().getTime()}`;

                Activity.createlogFile(fileName, logData, "internal-finish");
            });

            response.on("error", () => {
                const { statusCode, statusMessage } = response;
                const contentLength = response.get("content-length");

                let logData = {};
                logData["request"] = {
                    ip,
                    method,
                    path: baseUrl,
                    body,
                    headers,
                };
                logData["response"] = { statusCode, statusMessage };
                let responceTime = `${new Date()}`;
                logData["responceTime"] = responceTime;

                let fileName = `${new Date().getTime()}`;

                Activity.createlogFile(fileName, logData, "internal-error");
            });
        }

        next();
    }

    replacerFunc = () => {
        const visited = new WeakSet();
        return (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (visited.has(value)) {
                    return;
                }
                visited.add(value);
            }
            return value;
        };
    };
}
