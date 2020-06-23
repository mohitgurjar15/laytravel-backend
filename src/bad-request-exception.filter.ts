import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
	catch(exception: BadRequestException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();
		const errors = this.filterResponse(exception.getResponse()["message"]);

		response
			.status(422)
			// you can manipulate the response here
			.json({
				message: errors[0].display_error,
				developer_errors: errors,
			});
	}
	filterResponse(message) {
		console.log(message);

		if (!Array.isArray(message)) {
			message = [message];
		}

		// if (message == "Only Images are allowed&&&") {
		// 	message = [message];
		// }
		// message = [message];
		if (message.length) {
			let result = [];
			for (let i = 0; i < message.length; i++) {
				let errors = message[i].split("&&&");
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
