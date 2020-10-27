import { Faq } from "src/entity/faq.entity";
import { EntityRepository, getManager, Repository } from "typeorm";
import { ListFaqDto } from "./dto/list-faq.dto";
import { NotFoundException } from "@nestjs/common";
import { FaqCategory } from "src/entity/faq-category.entity";

@EntityRepository(Faq)
export class FaqRepository extends Repository<Faq> {

    async listFaq(paginationOption: ListFaqDto): Promise<{ data: Faq[], TotalReseult: number }> {
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10
        const skip = (page_no - 1) * limit || 0
        const keyword = search || ''

        let where;
        if (keyword) {
            where = `"faq"."is_deleted" = false AND "category"."is_deleted" = false AND(("category"."name" ILIKE '%${keyword}%') or ("faq"."question" ILIKE '%${keyword}%') or ("faq"."answer" ILIKE '%${keyword}%'))`
        }
        else {
            where = `"faq"."is_deleted" = false AND "category"."is_deleted" = false`
        }
        const query = getManager()
            .createQueryBuilder(Faq, "faq")
            .leftJoinAndSelect("faq.category_id", "category")
            .where(where)
            .take(take)
            .skip(skip)
            .orderBy(`faq.id`, 'DESC')
        const [result, total] = await query.getManyAndCount();
        if (!result.length) {
            throw new NotFoundException(`No faq found.`)
        }
        return { data: result, TotalReseult: total };
    }


    async listFaqforUser(): Promise<{ data: FaqCategory[], TotalReseult: number }> {
        
        let where = `"category"."is_deleted" = false AND "faq"."is_deleted" = false`
        
        const query = getManager()
            .createQueryBuilder(FaqCategory, "category")
            .leftJoinAndSelect("category.faqs", "faq")
            .select (["category.id","category.name","faq.id","faq.question","faq.answer"])
            .orderBy(`category.id`, 'ASC')
            .where(where)
        const [result, total] = await query.getManyAndCount();
        if (!result.length) {
            throw new NotFoundException(`No faq found.`)
        }
        return { data: result, TotalReseult: total };
    }
}