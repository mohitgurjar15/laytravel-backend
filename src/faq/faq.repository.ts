import { Faq } from "src/entity/faq.entity";
import { EntityRepository, getConnection, getManager, Repository } from "typeorm";
import { ListFaqDto } from "./dto/list-faq.dto";
import { NotFoundException } from "@nestjs/common";
import { FaqCategory } from "src/entity/faq-category.entity";
import { FaqMeta } from "src/entity/faq-meta.entity";

@EntityRepository(Faq)
export class FaqRepository extends Repository<Faq> {

    async listFaq(paginationOption: ListFaqDto): Promise<{ data: Faq[], TotalReseult: number }> {
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10
        const skip = (page_no - 1) * limit || 0
        const keyword = search || ''

        let where;
        if (keyword) {
            where = `"faq"."is_deleted" = false AND "category"."is_deleted" = false AND "faq_meta"."language_id" = 1 
            AND(("category"."name" ILIKE '%${keyword}%') or ("faq_meta"."question" ILIKE '%${keyword}%') or ("faq_meta"."answer" ILIKE '%${keyword}%'))`
        }
        else {
            where = `"faq"."is_deleted" = false AND "category"."is_deleted" = false AND "faq_meta"."language_id" = 1`
        }
        const query = getManager()
            .createQueryBuilder(Faq, "faq")
            .leftJoinAndSelect("faq.category_id", "category")
            .leftJoinAndSelect("faq.faq_meta","faq_meta")
            .where(where)
            .take(take)
            .skip(skip)
            .orderBy(`faq.id`)
        // var res = await query.getOne();
        // console.log(' my res', res)
        // const faq = getManager()
            // .createQueryBuilder(FaqMeta, "faq_meta")
            // AND "faq"."question" ILIKE '%${keyword}%') or ("faq"."answer" ILIKE '%${keyword}%'))
            // .where(`(("faq_meta"."faq_id"= '${res.id}'))`)
        // var response = await faq.getMany();
        // console.log('response', response)
        const [result, total] = await query.getManyAndCount();
        console.log('result**', result)
        if (!result.length) {
            throw new NotFoundException(`No faq found.`)
        }
        return { data: result, TotalReseult: total };
    }


    async listFaqforUser(): Promise<{ data: FaqCategory[], TotalReseult: number }> {

        let where = `"category"."is_deleted" = false AND "faq"."is_deleted" = false AND "faq"."status" = true`

        const query = getConnection()
            .createQueryBuilder(FaqCategory, "category")
            .leftJoinAndSelect("category.faqs", "faq")
            .select([
                "category.id",
                "category.name",
                "faq.id",
                "faq.question",
                "faq.answer",
            ])
            .orderBy(`faq.id`, "ASC")
            .where(where);
        const [result, total] = await query.getManyAndCount();
        if (!result.length) {
            throw new NotFoundException(`No faq found.`)
        }
        return { data: result, TotalReseult: total };
    }
}