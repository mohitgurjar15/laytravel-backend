import { EntityRepository, Repository } from "typeorm";
import { Language } from "src/entity/language.entity";
import { NotFoundException } from "@nestjs/common";

@EntityRepository(Language)
export class LanguageRepository extends Repository<Language>
{

    async listLanguage(): Promise<{ data: Language[] }> {
        // const { search } = paginationOption;

       
        
         let where;
        // console.log(keyword);
        
        // if(keyword){
        //      where =`"is_deleted"=false and (("iso_1_code" ILIKE '%${keyword}%') or ("iso_1_code" ILIKE '%${keyword}%') or ("name" ILIKE '%${keyword}%'))`
        // }
        // else{
        //   where = `("is_deleted"=false) and 1=1`
        // }
        where = `("is_deleted"=false) and 1=1`
        const [result,total] = await this.findAndCount({
            where:where,
            cache : {
                id:'languages',
                milliseconds:604800000
            }
        });

        // const result = this.query(`select * from "language",(select count(*) from "language") as cnt`);
        // const total = result[0].cnt;

        if (!result.length) {
            throw new NotFoundException(`No lenguage found.`)
        }
        return { data: result};
    }
}
