import { Enquiry } from "src/entity/enquiry.entity";
import { EntityRepository, Repository } from "typeorm";
import {EnquiryListDto} from "./dto/enquiry-list.dto"
import { NotFoundException } from "@nestjs/common";

@EntityRepository(Enquiry)
export class EnquiryRepository extends Repository<Enquiry> {

    async listEnquiry(paginationOption:EnquiryListDto): Promise<{ data: Enquiry[] ,TotalReseult: number}> {
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10
        const skip = (page_no-1) * limit || 0
        const keyword = search || ''
        
        let where;
        if(keyword){
             where =`("user_name" ILIKE '%${keyword}%') or ("email" ILIKE '%${keyword}%') or ("phone_no" ILIKE '%${keyword}%')or ("location" ILIKE '%${keyword}%') or ("subject" ILIKE '%${keyword}%') or ("message" ILIKE '%${keyword}%')`
        }
        else{
             where = `1=1`
        }
        const [result, total] = await this.findAndCount({
            where:where,
            skip:skip,
            take:take
        });
        if (!result) {
            throw new NotFoundException(`No any Enquiry found.`)
        }
        return { data: result , TotalReseult: total};
    }

}