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
            where = `"faq"."is_deleted" = false AND "category"."is_deleted" = false AND "faqMetas"."language_id" = 1 
            AND(("category"."name" ILIKE '%${keyword}%') or ("faqMetas"."question" ILIKE '%${keyword}%') or ("faqMetas"."answer" ILIKE '%${keyword}%'))`
        }
        else {
            where = `"faq"."is_deleted" = false AND "category"."is_deleted" = false AND "faqMetas"."language_id" = 1`
        }
        const query = getManager()
            .createQueryBuilder(Faq, "faq")
            .leftJoinAndSelect("faq.category_id", "category")
            .leftJoinAndSelect("faq.faqMetas", "faqMetas")
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


    async listFaqforUser() {

        let where = `"category"."is_deleted" = false AND "faq"."is_deleted" = false AND "faq"."status" = true`

        const query = getManager()
            .createQueryBuilder(Faq, "faq")
            .leftJoinAndSelect("faq.category_id", "category")
            .leftJoinAndSelect("faq.faqMetas", "faqMetas")
            .leftJoinAndSelect("faqMetas.language", "language")
            .where(where)
            .orderBy(`faq.id`)
        const [result, total] = await query.getManyAndCount();
        if (!result.length) {
            throw new NotFoundException(`No faq found.`)
        }
        return { data: result, TotalReseult: total };
    }
}