import { EntityRepository, Repository } from "typeorm";
import { LayCreditEarn } from "src/entity/lay-credit-earn.entity";
import { ListEarnRewordDto } from "./dto/list-earn-reword.dto";
import { NotFoundException } from "@nestjs/common";

@EntityRepository(LayCreditEarn)
export class RewordPointEarnRepository extends Repository<LayCreditEarn> {

    async listEarnReword(paginationOption:ListEarnRewordDto,id:string): Promise<{ data: LayCreditEarn[] ,TotalResult: number}> {
        
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10
        const skip = (page_no-1) * limit || 0
        const keyword = search || ''
        
        let where;
        if(keyword){
            where =`("user_id" = '${id}') AND (("credit_mode" ILIKE '%${keyword}%') or ("description" ILIKE '%${keyword}%'))`
        }
        else{
            where = `("user_id" = '${id}') AND 1=1`
        }
        const [result, total] = await this.findAndCount({
            where:where,
            order: { id : "DESC"},
            skip:skip,
            take:take
        });
        if (!result.length) {
            throw new NotFoundException(`Rewords Are Not Available.`)
        }
        return { data: result , TotalResult: total};
    }
}
