import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
	ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SubscriptionRepository } from "./subscription.repository";
import { PlanRepository } from "./plan.repository";
import { Plan } from "src/entity/plan.entity";
import { SubscribePlan } from "./dto/subscribe-plan.dto";
import { User } from "src/entity/user.entity";
import { v4 as uuidv4 } from "uuid";
import { PlanSubscription } from "src/entity/plan-subscription.entity";
import { getConnection, getManager } from "typeorm";
import { UserRepository } from "src/auth/user.repository";

@Injectable()
export class SubscriptionService {
	constructor(
		@InjectRepository(SubscriptionRepository)
		private subscriptionRepository: SubscriptionRepository,

		@InjectRepository(PlanRepository)
		private planRepository: PlanRepository,

		@InjectRepository(UserRepository)
		private userRepository: UserRepository
	) {}

	async planList(): Promise<{ data: Plan[] }> {
		try {
			return await this.planRepository.planList();
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`Subscription Plan Not Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	async subscribePlan(subscribePlan: SubscribePlan, user: User) {
		const { planId, currencyId, amount, status, info } = subscribePlan;

		console.log(subscribePlan);

		const subscribe = new PlanSubscription();
		subscribe.id = uuidv4();
		subscribe.planId = planId;
		subscribe.currencyId = currencyId;
		subscribe.amount = amount;
		subscribe.paymentStatus = status;
		subscribe.paymentInfo = info;
		subscribe.userId = user.userId;
		subscribe.subscriptionDate = new Date();

		try {
			const todayDate = new Date();
			const userdata = await this.userRepository.findOne({
				userId: user.userId,
			});
			var userNextSubscriptionDate = new Date(userdata.nextSubscriptionDate);

			if (userNextSubscriptionDate > todayDate)
				throw new ConflictException(
					`You have alredy subscribed an plan&&&plan&&&You have alredy subscribed an plan`
				);

			const planData = await this.planRepository.findOne({
				id: planId,
			});
			const validityDays = new Date();
			validityDays.setDate(validityDays.getDate() + planData.validityDays);
			console.log(validityDays);
			userdata.nextSubscriptionDate = validityDays;
			console.log(subscribe);
			await subscribe.save();
			await userdata.save();
			// await getConnection().queryResultCache!.remove(["modules"]);
			return {
				message: `your new plan subscribed successfully`,
			};
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`Subscription Plan Not Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	async getPlanDetail(user: User) {
		try {
			const userdata = await this.userRepository.findOne({
				userId: user.userId,
			});

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
				const day = Math.ceil(diffDays/ (1000 * 3600 * 24))
				const where = `"subscribe"."user_id" = '${user.userId}'`;
				const result = await getManager()
					.createQueryBuilder(PlanSubscription, "subscribe")
					.leftJoinAndSelect("subscribe.plan", "plan")
					.select([
						"subscribe.id",
						"subscribe.subscriptionDate",
						"plan.id",
						"plan.name",
						"plan.description",
						"plan.validityDays",
					])
					.where(where)
					.orderBy(`Date("subscribe"."subscription_date")`,`DESC`)
					.getOne();
					console.log(result);
				msg = {
					"is_expired": "false",
					"plan": result,
					"remaining_days": day,
				};
			}

			// await getConnection().queryResultCache!.remove(["modules"]);
			return msg;
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No plan Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}
}
