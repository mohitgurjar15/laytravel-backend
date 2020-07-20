import { EntityRepository, Repository } from "typeorm";
import { Language } from "src/entity/language.entity";
import { ListLangugeDto } from "./dto/list-languge.dto";
import { NotFoundException } from "@nestjs/common";

@EntityRepository(Language)
export class LanguageRepository extends Repository<Language>
{

    async listLanguage(paginationOption: ListLangugeDto): Promise<{ data: Language[], TotalReseult: number }> {
        const { search } = paginationOption;

        const keyword = search || '';
        
        let where;
        if(keyword){
             where =`"is_deleted"=false and (("iso_1_code" ILIKE '%${keyword}%') or ("iso_1_code" ILIKE '%${keyword}%'))`
        }
        else{
             where = `("is_deleted"=false) and 1=1`
        }
        const [result, total] = await this.findAndCount({
            where : where,
            select: ["id","name","iso_1Code","iso_2Code"],
            cache : {
                id:'language',
                milliseconds:604800000
            }
        });
        if (!result[0]) {
            throw new NotFoundException(`No lenguage found.`)
        }
        return { data: result, TotalReseult: total };
    }
}
