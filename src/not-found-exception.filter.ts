import { NotFoundException, Catch, ExceptionFilter, ArgumentsHost } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
	catch(exception: NotFoundException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();
		console.log("exception----------------------------- here", exception.getResponse());
		const errors = this.filterResponse(exception.getResponse()["message"]);
		response
			.status(404)
			// you can manipulate the response here
			.json({
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
