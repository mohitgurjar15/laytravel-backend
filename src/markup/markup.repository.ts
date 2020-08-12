import { EntityRepository, Repository, getManager } from "typeorm";
import { Markup } from "src/entity/markup.entity";
import { NotFoundException } from "@nestjs/common";

@EntityRepository(Markup)
export class MarkupRepository extends Repository<Markup>
{
    async MarkupDetail(): Promise<{ data: any }> {

        let markupArray =  await getManager()
            .createQueryBuilder(Markup, "markup")
            .innerJoinAndSelect("markup.module","module")
            .innerJoinAndSelect("markup.supplier","supplier")
            .select([
                	"markup.id","module.name","supplier.name",
					"markup.userType","markup.operator","markup.operand"
            ]).getOne();
			
			if (!markupArray) {
				throw new NotFoundException(`No markup found.`);
            }
            console.log(markupArray);

        return { data: markupArray};
    }





    async listMarkup(): Promise<{ data: Markup[] }> {
        // const [result,total] = await this.findAndCount({
        //     cache : {
        //         id:'markup',
        //         milliseconds:604800000
        //     }
        // });
        const result = await getManager()
			.createQueryBuilder(Markup, "markup")
			.leftJoinAndSelect("markup.module", "module")
			.select([
                "markup.id",
                "module.name",
                "markup.userType",
                "markup.operator",
                "markup.operand",
			])
            .getMany()
            

        if (!result[0]) {
            throw new NotFoundException(`No markup found.`)
        }
        return { data: result};
    }
}