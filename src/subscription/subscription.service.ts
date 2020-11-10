import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
	ConflictException,
	UnauthorizedException,
	BadRequestException,
	NotAcceptableException,
	ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SubscriptionRepository } from "./subscription.repository";
import { PlanRepository } from "./plan.repository";
import { Plan } from "src/entity/plan.entity";
import { SubscribePlan } from "./dto/subscribe-plan.dto";
import { User } from "src/entity/user.entity";
import { v4 as uuidv4 } from "uuid";
import { PlanSubscription } from "src/entity/plan-subscription.entity";
import { getManager } from "typeorm";
import { UserRepository } from "src/auth/user.repository";
import { Role } from "src/enum/role.enum";
import { PaymentStatus } from "src/enum/payment-status.enum";
import * as config from "config";
import { ConvertCustomerMail } from "src/config/email_template/convert-user-mail.html";
import { MailerService } from "@nestjs-modules/mailer";
import { Activity } from "src/utility/activity.utility";
import { LayCreditEarn } from "src/entity/lay-credit-earn.entity";
import { RewordMode } from "src/enum/reword-mode.enum";
import { RewordStatus } from "src/enum/reword-status.enum";
const mailConfig = config.get("email");

@Injectable()
export class SubscriptionService {
	constructor(
		@InjectRepository(SubscriptionRepository)
		private subscriptionRepository: SubscriptionRepository,

		@InjectRepository(PlanRepository)
		private planRepository: PlanRepository,

		@InjectRepository(UserRepository)
		private userRepository: UserRepository,

		private readonly mailerService: MailerService
	) { }

	async planList(): Promise<{ data: Plan[] }> {
		try {
			return await this.planRepository.planList();
		} catch (error) {
			switch (error.response.statusCode) {
				case 404:
					throw new NotFoundException(error.response.message);
				case 409:
					throw new ConflictException(error.response.message);
				case 422:
					throw new BadRequestException(error.response.message);
				case 403:
					throw new ForbiddenException(error.response.message);
				case 500:
					throw new InternalServerErrorException(error.response.message);
				case 406:
					throw new NotAcceptableException(error.response.message);
				case 404:
					throw new NotFoundException(error.response.message);
				case 401:
					throw new UnauthorizedException(error.response.message);
				default:
					throw new InternalServerErrorException(
						`${error.message}&&&id&&&${error.Message}`
					);
			}
		}
	}

	async subscribePlan(
		subscribePlan: SubscribePlan,
		userId: string,
		updateBy: string
	) {
		try {
			const { plan_id, currency_id, card_token } = subscribePlan;

			const todayDate = new Date();
			const userdata = await this.userRepository.getUserData(userId);
			const expiryPlanDate = userdata.nextSubscriptionDate;

			if (userdata.nextSubscriptionDate) {
				var userNextSubscriptionDate = new Date(userdata.nextSubscriptionDate);

				if (userNextSubscriptionDate > todayDate)
					throw new ConflictException(
						`You have alredy subscribed a plan&&&plan&&&You have alredy subscribed a plan`
					);
			}

			const planData = await this.getPlan(plan_id, currency_id);

			const amount = planData.amount * planData.currency.liveRate;

			// Authorised the card

			//payment process

			const info = {};
			const subscribe = new PlanSubscription();
			subscribe.id = uuidv4();
			subscribe.planId = plan_id;
			subscribe.currencyId = currency_id;
			subscribe.amount = amount;
			subscribe.paymentStatus = PaymentStatus.CONFIRM;
			subscribe.paymentInfo = info;
			subscribe.userId = userId;
			subscribe.subscriptionDate = new Date();

			const validityDays = new Date();
			validityDays.setDate(validityDays.getDate() + planData.validityDays);

			userdata.roleId = Role.PAID_USER;
			userdata.nextSubscriptionDate = validityDays;
			userdata.updatedDate = new Date();
			userdata.updatedBy = updateBy;

			await subscribe.save();
			await userdata.save();
			Activity.logActivity(
				userdata.userId,
				"subscription",
				`${userdata.email} is subscriped a ${planData.name} plan`
			);
			console.log(expiryPlanDate);
			if (expiryPlanDate != null) {
				await this.addLaytripPoint(planData.amount, userdata.userId);
			}
			return {
				message: `Your new plan subscribed successfully`,
			};
		} catch (error) {
			switch (error.response.statusCode) {
				case 404:
					throw new NotFoundException(error.response.message);
				case 409:
					throw new ConflictException(error.response.message);
				case 422:
					throw new BadRequestException(error.response.message);
				case 403:
					throw new ForbiddenException(error.response.message);
				case 500:
					throw new InternalServerErrorException(error.response.message);
				case 406:
					throw new NotAcceptableException(error.response.message);
				case 404:
					throw new NotFoundException(error.response.message);
				case 401:
					throw new UnauthorizedException(error.response.message);
				default:
					throw new InternalServerErrorException(
						`${error.message}&&&id&&&${error.Message}`
					);
			}
		}
	}

	async getPlanDetail(user: User) {
		try {
			const userdata = await this.userRepository.getUserData(user.userId);

			const todayDate = new Date();

			var userNextSubscriptionDate = new Date(userdata.nextSubscriptionDate);

			let msg;
			if (
				!userdata.nextSubscriptionDate ||
				userNextSubscriptionDate < todayDate
			) {
				msg = {
					is_expired: true,
					plan: "not found",
				};
			} else {
				var toDate = new Date();

				var date = toDate.toISOString();
				date = date
					.replace(/T/, " ") // replace T with a space
					.replace(/\..+/, "");

				const firstDate = new Date(userNextSubscriptionDate);
				const secondDate = new Date(todayDate);
				const diffDays = firstDate.valueOf() - secondDate.valueOf();
				const day = Math.ceil(diffDays / (1000 * 3600 * 24));

				const result = await this.getSubscribeData(user.userId);

				console.log(result);
				msg = {
					is_expired: "false",
					plan: result,
					remaining_days: day,
				};
			}

			// await getConnection().queryResultCache!.remove(["modules"]);
			return msg;
		} catch (error) {
			switch (error.response.statusCode) {
				case 404:
					throw new NotFoundException(error.response.message);
				case 409:
					throw new ConflictException(error.response.message);
				case 422:
					throw new BadRequestException(error.response.message);
				case 403:
					throw new ForbiddenException(error.response.message);
				case 500:
					throw new InternalServerErrorException(error.response.message);
				case 406:
					throw new NotAcceptableException(error.response.message);
				case 404:
					throw new NotFoundException(error.response.message);
				case 401:
					throw new UnauthorizedException(error.response.message);
				default:
					throw new InternalServerErrorException(
						`${error.message}&&&id&&&${error.Message}`
					);
			}
		}
	}

	async getPlan(planId: string, currency_id: number) {
		const where = `"plan"."id" = '${planId}'`;
		const result: any = await getManager()
			.createQueryBuilder(Plan, "plan")
			.leftJoinAndSelect("plan.currency", "currency")
			.select([
				"plan.id",
				"plan.name",
				"plan.description",
				"plan.validityDays",
				"plan.amount",
				"currency.liveRate",
			])
			.where(where)
			.getOne();
		if (!result) {
			throw new NotFoundException(`Plan not found&&&id&&&Plan not found`);
		}
		result.payble_amount = result.amount * result.currency.liveRate
		return result;
	}

	async getSubscribeData(userId: string) {
		const where = `"subscribe"."user_id" = '${userId}'`;
		const result = await getManager()
			.createQueryBuilder(PlanSubscription, "subscribe")
			.leftJoinAndSelect("subscribe.plan", "plan")
			.select([
				"subscribe.id" as "subscription_id",
				"subscribe.subscriptionDate",
				"plan.id",
				"plan.name",
				"plan.description",
				"plan.validityDays",
			])
			.where(where)
			.orderBy(`Date("subscribe"."subscription_date")`, `DESC`)
			.getOne();
		return result;
	}

	async getSubscriptionPayment(
		userId: string,
		amount: number,
		currency_id: number,
		card_token: string
	) { }

	async convertUser(userId: string) {
		var toDate = new Date();

		var todayDate = toDate.toISOString();
		todayDate = todayDate
			.replace(/T/, " ") // replace T with a space
			.replace(/\..+/, "");
		const userdata = await this.userRepository.getUserData(userId);

		const updateQuery = await this.userRepository.query(
			`UPDATE "user" 
			SET "role_id"=6 , updated_date='${todayDate}',updated_by = '${userId}'  WHERE "role_id" = ${Role.PAID_USER} AND "user_id"= '${userId}'`
		);

		this.mailerService
			.sendMail({
				to: userdata.email,
				from: mailConfig.from,
				subject: `Subscription Expired`,
				cc: mailConfig.BCC,
				html: ConvertCustomerMail({
					username: userdata.firstName + " " + userdata.lastName,
					date: userdata.nextSubscriptionDate,
				}),
			})
			.then((res) => {
				console.log("res", res);
			})
			.catch((err) => {
				console.log("err", err);
			});
		Activity.logActivity(
			userdata.userId,
			"subscription",
			`${userdata.email} is convert customer to free user because subscription plan not subscribed`
		);
	}

	async addLaytripPoint(amount: number, userId: string) {
		const rewordEarn = new LayCreditEarn();
		rewordEarn.userId = userId;
		rewordEarn.points = amount;
		rewordEarn.earnDate = new Date();
		rewordEarn.creditMode = RewordMode.SUBSCRIPTION;
		rewordEarn.description = `this laytrip points for subscribed a plan`;
		rewordEarn.creditBy = userId;
		rewordEarn.status = RewordStatus.AVAILABLE
		await rewordEarn.save();
	}
}
