import { Faq } from "src/entity/faq.entity";
import { EntityRepository, getManager, Repository } from "typeorm";
import { ListFaqDto } from "./dto/list-faq.dto";
import { NotFoundException } from "@nestjs/common";

@EntityRepository(Faq)
export class FaqRepository extends Repository<Faq> {

    async listFaq(paginationOption: ListFaqDto): Promise<{ data: Faq[], TotalReseult: number }> {
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10
        const skip = (page_no - 1) * limit || 0
        const keyword = search || ''

        let where;
        if (keyword) {
            where = `"faq"."is_deleted" = false AND (("faq"."category" ILIKE '%${keyword}%') or ("faq"."question" ILIKE '%${keyword}%') or ("faq"."answer" ILIKE '%${keyword}%'))`
        }
        else {
            where = `"faq"."is_deleted" = false`
        }
        // const [result, total] = await this.findAndCount({
        //     where:where,
        //     order: { createdDate : "DESC"},
        //     skip:skip,
        //     take:take
        // });


        const query = getManager()
            .createQueryBuilder(Faq, "faq")
            .leftJoinAndSelect("faq.category_id", "category")
            .where(where)
            .take(take)
            .offset(skip)
            //.orderBy(`"faq_created_date"`, 'DESC')
        const [result, total] = await query.getManyAndCount();
        if (!result.length) {
            throw new NotFoundException(`No faq found.`)
        }
        return { data: result, TotalReseult: total };
    }

}