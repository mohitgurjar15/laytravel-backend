import { EntityRepository, Repository } from "typeorm";
import { Language } from "src/entity/language.entity";
import { NotFoundException } from "@nestjs/common";
import { Currency } from "src/entity/currency.entity";
import { ListCurrencyDto } from "./dto/list-currency.dto";

@EntityRepository(Currency)
export class CurrencyRepository extends Repository<Currency>
{

    async listCurrency(): Promise<{ data: Currency[] }> {
        // const { page_no, search, limit } = paginationOption;

        // const take = limit || 10
        // const skip = (page_no-1) * limit || 0
        // const keyword = search || ''
        
        let where;
        // if(keyword){
        //      where =`(("is_deleted"=false) and ("country" ILIKE '%${keyword}%') or ("code" ILIKE '%${keyword}%')`
        // }
        // else{
        //      where = `("is_deleted"=false) and 1=1`
        // }
        where = `("is_deleted"=false) and 1=1`
        const [result, total] = await this.findAndCount({
            where:where,
            cache : {
                id:'Currency',
                milliseconds:46399000
            }
        });
        if (!result.length) {
            throw new NotFoundException(`No currency found.`)
        }
        return { data: result};
    }
}
