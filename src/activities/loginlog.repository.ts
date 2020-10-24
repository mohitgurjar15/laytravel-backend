import { EntityRepository, Repository, getManager } from "typeorm";
import { LoginLog } from "src/entity/login-log.entity";
import { ListActivityDto } from "./dto/list-activities.dto";
import { NotFoundException } from "@nestjs/common";

@EntityRepository(LoginLog)
export class LoginLogRepository extends Repository<LoginLog> {
	async loginLogList(
		paginationOption: ListActivityDto
	): Promise<{ data: LoginLog[]; TotalReseult: any }> {
		const { page_no, search, limit, searchDate, userId } = paginationOption;

		const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;
		const keyword = search || "";

		let where;
		where = `1=1 `;
		if (searchDate) {
			where += `AND (DATE("log"."login_date") = '${searchDate}') `;
		}
		if (userId) {
			where += `AND ("log"."user_id" = '${userId}') `;
		}
		if (keyword) {
			where += `AND (("log"."ip_address" ILIKE '${keyword}') or ("log"."login_agent" ILIKE '%${keyword}%') or("user"."first_name" ILIKE '%${keyword}%')or("user"."email" ILIKE '%${keyword}%')or("user"."last_name" ILIKE '%${keyword}%'))`;
		}
		// const [result, total] = await this.findAndCount({
		// 	select:['user',],
		// 	where: where,
		// 	skip: skip,
		// 	take: take,
		// });

		const result = await getManager()
			.createQueryBuilder(LoginLog, "log")
			.leftJoinAndSelect("log.user", "user")
			.select([
				"user.userId",
				"user.firstName",
				"user.lastName",
				"user.email",
				"log.ipAddress",
				"log.loginVia",
				"log.loginAgent",
				"log.id",
				"log.loginDate",
			])
			.where(where)
			.skip(skip)
			.take(take)
			.orderBy("log.id","DESC")
			.getMany();
		var total = await getManager()
			.createQueryBuilder(LoginLog, "log")
			.leftJoinAndSelect("log.user", "user")
			.where(where)
			.getCount();
		if (!result.length) {
			throw new NotFoundException(`No Log found.`);
		}
		return { data: result, TotalReseult: total };
	}
}
