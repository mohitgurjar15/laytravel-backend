import { Catch, ExceptionFilter, ArgumentsHost, ForbiddenException } from "@nestjs/common";
import { Response } from "express";

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
	catch(exception: ForbiddenException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const errors = this.filterResponse(exception.getResponse()["message"]);

		response
			.status(500)
			// you can manipulate the response here
			.json({
				statusCode: 403,
				message: errors[0].display_error,
				developer_errors: errors,
			});
	}

	filterResponse(message) {
		let msg = [];
		msg.push(message);

		if (msg.length) {
			let result = [];
			for (let i = 0; i < msg.length; i++) {
				let errors = msg[i].split("&&&");
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
