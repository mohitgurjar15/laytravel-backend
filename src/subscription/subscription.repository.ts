import { EntityRepository, Repository } from "typeorm";
import { PlanSubscription } from "src/entity/plan-subscription.entity";

@EntityRepository(PlanSubscription)
export class SubscriptionRepository extends Repository<PlanSubscription> {

}