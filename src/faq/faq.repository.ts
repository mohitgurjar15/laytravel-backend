import { Faq } from "src/entity/faq.entity";
import { EntityRepository, Repository } from "typeorm";
import { ListFaqDto } from "./dto/list-faq.dto";
import { NotFoundException } from "@nestjs/common";

@EntityRepository(Faq)
export class FaqRepository extends Repository<Faq> {

    async listFaq(paginationOption:ListFaqDto): Promise<{ data: Faq[] ,TotalReseult: number}> {
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10
        const skip = (page_no-1) * limit || 0
        const keyword = search || ''
        
        let where;
        if(keyword){
             where =`("is_deleted" = false) AND (("category" ILIKE '%${keyword}%') or ("question" ILIKE '%${keyword}%') or ("answer" ILIKE '%${keyword}%'))`
        }
        else{
             where = `("is_deleted" = false) AND 1=1`
        }
        const [result, total] = await this.findAndCount({
            where:where,
            order: { createdDate : "DESC"},
            skip:skip,
            take:take
        });
        if (!result.length) {
            throw new NotFoundException(`No faq found.`)
        }
        return { data: result , TotalReseult: total};
    }

}