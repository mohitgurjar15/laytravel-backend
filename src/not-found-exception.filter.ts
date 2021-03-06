import { NotFoundException, Catch, ExceptionFilter, ArgumentsHost } from "@nestjs/common";
import {  Response } from "express";
import { Translation } from "./utility/translation.utility";

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
	catch(exception: NotFoundException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const errors = this.filterResponse(exception.getResponse()["message"]);
		response
			.status(404)
			// you can manipulate the response here
			.json({
				message:errors[0].display_error,
				//message: await Translation.Translater('ES', 'responce', errors[0].display_error),
				developer_errors: errors,
			});
	}

	filterResponse(message) {
		let msg = [];
		msg.push(message);
		console.log(message)
		if (msg.length) {
			let result = [];
			for (let i = 0; i < msg.length; i++) {
				let errors = msg[i].split("&&&");
				console.log(errors)
				let error = {};
				if (errors.length > 2) {
					result.push({ key: errors[1], error_type: "system", actual_error: errors[0], display_error: errors[2] });
				} else {
					result.push({ key: errors[1], error_type: "ui", actual_error: errors[0], display_error: errors[0] });
				}
				console.log(result)
			}

			return result;
		}
	}
}
