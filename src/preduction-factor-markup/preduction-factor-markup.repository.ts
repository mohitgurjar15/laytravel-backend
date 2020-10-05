import { NotFoundException } from "@nestjs/common";
import { PreductionFactorMarkup } from "src/entity/preduction-factor-markup.entity";
import { EntityRepository, getManager, Repository } from "typeorm";

@EntityRepository(PreductionFactorMarkup)
export class PreductionFactorMarkupRepository extends Repository<PreductionFactorMarkup>
{
    
    async listFactorMarkup(): Promise<{ data: PreductionFactorMarkup }> {
        // const [result,total] = await this.findAndCount({
        //     cache : {
        //         id:'markup',
        //         milliseconds:604800000
        //     }
        // });
        const result = await getManager()
			.createQueryBuilder(PreductionFactorMarkup, "markup")
            .getOne()
            

        if (!result) {
            throw new NotFoundException(`No preduction markup found.`)
        }
        return { data: result};
    }
}