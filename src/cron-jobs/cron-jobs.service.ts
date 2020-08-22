import { Injectable } from "@nestjs/common";
import { UserRepository } from "src/auth/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { MailerService } from "@nestjs-modules/mailer";
import { Role } from "src/enum/role.enum";
import { Activity } from "src/utility/activity.utility";
import * as config from "config";
import { ConvertCustomerMail } from "src/config/email_template/convert-user-mail.html";
const mailConfig = config.get("email");

@Injectable()
export class CronJobsService {
	constructor(
		@InjectRepository(UserRepository)
		private userRepository: UserRepository,

		private readonly mailerService: MailerService
	) {}

	async convertCustomer() {
		try {
			var toDate = new Date();

			var todayDate = toDate.toISOString();
			todayDate = todayDate
				.replace(/T/, " ") // replace T with a space
				.replace(/\..+/, "");

			const result = await this.userRepository.query(
				`SELECT "User"."user_id","User"."next_subscription_date","User"."email","User"."first_name","User"."last_name"  FROM "user" "User" WHERE "User"."role_id" = ${Role.PAID_USER} AND DATE("User"."next_subscription_date") < '${todayDate}'`
			);
			console.log(result);
			const updateQuery = await this.userRepository.query(
				`UPDATE "user" 
                SET "role_id"=6 , updated_date='${todayDate}',updated_by = '1c17cd17-9432-40c8-a256-10db77b95bca'  WHERE "role_id" = ${Role.PAID_USER} AND DATE("next_subscription_date") < '${todayDate}'`
			);
			for (let index = 0; index < result.length; index++) {
				const data = result[index];
				
				this.mailerService
					.sendMail({
						to: data.email,
						from: mailConfig.from,
						subject: `Subscription Expired`,
						html: ConvertCustomerMail({
							username: data.first_name + " " + data.last_name,
							date: data.next_subscription_date,
						}),
					})
					.then((res) => {
						console.log("res", res);
					})
					.catch((err) => {
						console.log("err", err);
					});
				Activity.logActivity(
					"1c17cd17-9432-40c8-a256-10db77b95bca",
					"cron",
					`${data.email} is Convert customer to free user because subscription plan is not done by customer`
				);
			}

			console.log(updateQuery);
		} catch (error) {
			console.log(error);
		}
	}
}
