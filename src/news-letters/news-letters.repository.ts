import { NotFoundException } from "@nestjs/common";
import { NewsLetters } from "src/entity/news-letter.entity";
import { EntityRepository, Repository } from "typeorm";
import {ListSubscribeUsersDto} from "./dto/list-subscribe-users.dto";

@EntityRepository(NewsLetters)
export class NewsLettersRepository extends Repository<NewsLetters> {

    async listSubscriber(paginationOption:ListSubscribeUsersDto): Promise<{ data: NewsLetters[] ,TotalReseult: number}> {
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10
        const skip = (page_no-1) * limit || 0
        const keyword = search || ''
        //const statusWord  =  status ? status : true;
        let where = {};
        
        if(keyword){
             where['email'] = keyword
        }
        const [result, total] = await this.findAndCount({
            where:where,
            skip:skip,
            take:take
        });
        if (!result.length) {
            throw new NotFoundException(`No subsciber found.`)
        }
        return { data: result , TotalReseult: total};
    }

}