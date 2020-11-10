import { NotFoundException } from "@nestjs/common";
import { FaqCategory } from "src/entity/faq-category.entity";
import { EntityRepository, getManager, Repository } from "typeorm";

@EntityRepository(FaqCategory)
export class FaqCategoryRepository extends Repository<FaqCategory> {
    async listFaqCategory() {
        const [result, count] = await this.findAndCount({ isDeleted: false })
        if (!result.length) {
            throw new NotFoundException(`No Faq category found.`)
        }
        return { data: result, count: count };
    }

    async getFaqCategory(id) {
        const [result, count] = await this.findAndCount({ isDeleted: false , id:id })
        if (!result.length) {
            throw new NotFoundException(`No Faq category found.`)
        }
        return { data: result, count: count };
    }
}