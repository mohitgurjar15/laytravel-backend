import { Enquiry } from "src/entity/enquiry.entity";
import { EntityRepository, Repository } from "typeorm";
import { EnquiryListDto } from "./dto/enquiry-list.dto"
import { NotFoundException } from "@nestjs/common";

@EntityRepository(Enquiry)
export class EnquiryRepository extends Repository<Enquiry> {

    async listEnquiry(paginationOption: EnquiryListDto): Promise<{ data: Enquiry[], TotalReseult: number }> {
        const { page_no, user_name, email, limit } = paginationOption;

        const take = limit || 10
        const skip = (page_no - 1) * limit || 0


        let where = {};
        if (email) {
            where['email'] = email
            //  where =`("user_name" ILIKE '%${keyword}%') or ("email" ILIKE '%${keyword}%') or ("phone_no" ILIKE '%${keyword}%') or  ("message" ILIKE '%${keyword}%')`
        }
        if (user_name) {
            where['userName'] = user_name
        }

        const [result, total] = await this.findAndCount({
            where: where,
            order: { createdDate: "DESC" },
            skip: skip,
            take: take
        });
        if (!result.length) {
            throw new NotFoundException(`No any Enquiry found.`)
        }
        return { data: result, TotalReseult: total };
    }

}