import { EntityRepository, Repository } from "typeorm";
import { LoginLog } from "src/entity/login-log.entity";
import { ListActivityDto } from "./dto/list-activities.dto";
import { isEmpty } from "rxjs/operators";
import { NotFoundException } from "@nestjs/common";

@EntityRepository(LoginLog)
export class LoginLogRepository extends Repository<LoginLog> {



    async loginLogList(
		paginationOption: ListActivityDto
	): Promise<{ data: LoginLog[]; TotalReseult: number }> {
		const { page_no, search, limit ,searchDate,userId} = paginationOption;

		const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;
		const keyword = search || "";

        let where;
        where = `1=1 AND`
        if(searchDate)
        {
            where += `(DATE("login_date") = '${searchDate}') AND`;
		}
		if(userId)
        {
            where += `("user_id" = '${userId}') AND`;
        }
		if (keyword) {
			where += `(("ip_address" ILIKE '${keyword}') or ("login_agent" ILIKE '%${keyword}%'))`;
		} else {
			where += ` 1=1`;
		}
		const [result, total] = await this.findAndCount({
			where: where,
			skip: skip,
			take: take,
		});

		if (!result || total <= skip) {
			throw new NotFoundException(`No Log found.`);
		}
		
		return { data: result, TotalReseult: total };
	}
}
