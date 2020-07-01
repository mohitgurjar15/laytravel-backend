import { InternalServerErrorException, Catch, ExceptionFilter, ArgumentsHost } from "@nestjs/common";
import { Response } from "express";

@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionFilter implements ExceptionFilter {
	catch(exception: InternalServerErrorException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const errors = this.filterResponse(exception.getResponse()["message"]);

		response
			.status(500)
			// you can manipulate the response here
			.json({
				statusCode: 500,
				message: errors[0].display_error,
				developer_errors: errors,
			});
	}

	filterResponse(message) {
		console.log(message);
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
