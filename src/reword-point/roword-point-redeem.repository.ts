import { LayCreditRedeem } from "src/entity/lay-credit-redeem.entity";
import { EntityRepository, Repository } from "typeorm";
import {ListRedeemRewordDto} from "./dto/list-redeem-reword.dto"
import { NotFoundException } from "@nestjs/common";

@EntityRepository(LayCreditRedeem)
export class RewordPointRedeemRepository extends Repository<LayCreditRedeem> {

    async listRedeemReword(paginationOption:ListRedeemRewordDto,id:string): Promise<{ data: LayCreditRedeem[] ,TotalResult: number}> {
        
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10
        const skip = (page_no-1) * limit || 0
        const keyword = search || ''
        
        let where;
        if(keyword){
            where =`("user_id" = '${id}') AND (("redeem_mode" ILIKE '%${keyword}%') or ("description" ILIKE '%${keyword}%'))`
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