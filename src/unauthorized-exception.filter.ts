import { Catch, UnauthorizedException, ExceptionFilter, ArgumentsHost } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
	catch(exception: UnauthorizedException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		const errors = this.filterResponse(exception.getResponse()["message"]);

		response
			.status(401)
			// you can manipulate the response here
			.json({
				message: errors[0].display_error,
				developer_errors: errors,
			});
	}

	filterResponse(message) {
		let msg = [];
		let error;
		if (typeof message !== "undefined" && message == "Unauthorized") error = "Please login to continue";
		else error = message || "Unauthorized";

		msg.push(error);
		// return msg;

		if (msg.length) {
			let result = [];
			for (let i = 0; i < msg.length; i++) {
				let errors = msg[i].split("&&&");
				let error = {};
				if (errors.length > 2) {
					result.push({ key: errors[1], error_type: "system", actual_error: errors[0], display_error: errors[2] });
				} else {
					result.push({ key: errors[1], error_type: "ui", actual_error: errors[0], display_error: errors[0] });
				}
			}

			return result;
		}
	}
}
