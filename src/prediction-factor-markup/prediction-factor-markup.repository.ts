import { NotFoundException } from "@nestjs/common";
import { PredictionFactorMarkup } from "src/entity/prediction-factor-markup.entity";
import { EntityRepository, getManager, Repository } from "typeorm";

@EntityRepository(PredictionFactorMarkup)
export class PredictionFactorMarkupRepository extends Repository<PredictionFactorMarkup>
{
    
    async listFactorMarkup(): Promise<{ data: PredictionFactorMarkup }> {
        // const [result,total] = await this.findAndCount({
        //     cache : {
        //         id:'markup',
        //         milliseconds:604800000
        //     }
        // });
        const result = await getManager()
			.createQueryBuilder(PredictionFactorMarkup, "markup")
            .getOne()
            

        if (!result) {
            throw new NotFoundException(`No prediction markup found.`)
        }
        return { data: result};
    }
}