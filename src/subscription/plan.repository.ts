import { EntityRepository, Repository } from "typeorm";
import { Plan } from "src/entity/plan.entity";
import { NotFoundException } from "@nestjs/common";

@EntityRepository(Plan)
export class PlanRepository extends Repository<Plan> {
	async planList(): Promise<{ data: Plan[] }> {
		const [result, total] = await this.findAndCount({
			cache: {
				id: "plan",
				milliseconds: 604800000,
			},
		});

		if (!result.length) {
			throw new NotFoundException(`Subscriptions plan not founded.`);
		}
		return { data: result };
	}
}
