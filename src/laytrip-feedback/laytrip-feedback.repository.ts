import { NotFoundException } from "@nestjs/common";
import { LaytripFeedback } from "src/entity/laytrip_feedback.entity";
import { EntityRepository, getConnection, getManager, Repository } from "typeorm";

@EntityRepository(LaytripFeedback)
export class LaytripFeedbackRepository extends Repository<LaytripFeedback>{
    
   async listLaytripFeedbackAdmin(where:string,limit,page_no){

        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;
    
        const query = getConnection()
            .createQueryBuilder(LaytripFeedback, "feedback")
            .leftJoinAndSelect("feedback.user", "user")
            // .leftJoinAndSelect("feedback.booking", "booking")
            // .leftJoinAndSelect("booking.module", "module")
            .select(["feedback.id","feedback.rating", "feedback.message", "user.firstName", "user.lastName", "user.email", "user.profilePic"])
            .where(where)
            .limit(take)
            .offset(skip)
        const [data, count] = await query.getManyAndCount();

        const   reviewCount = await getConnection()
            .createQueryBuilder(LaytripFeedback, "feedback")
            .getCount()

        if(!data.length){
            throw new NotFoundException(`No feedback found.`)
        }
        
        const individualCount = await getManager().query(`select count(id) as count , rating from laytrip_feedback group by rating`)
        
        var rating_count = [{
            "one": {
                "count": "0"
            }
        }, {
            "two": {
                "count": "0"
            }
        }, {
            "three": {
                "count": "0"
            }
        }, {
            "four": {
                "count": "0"
            }
        }, {
            "five": {
                "count": "0"
            }
        }];


        for await (const value of individualCount) {
            switch (value.rating) {
                case 1:
                    rating_count[0] = {
                        "one": {
                            "count": value.count
                        }
                    };
                    break;
                case 2:
                    rating_count[1] = {
                        "two": {
                            "count": value.count
                        }
                    };
                    break;

                case 3:
                    rating_count[2] = {
                        "three": {
                            "count": value.count
                        }
                    };
                    break;

                case 4:
                    rating_count[3] = {
                        "four": {
                            "count": value.count
                        }
                    };
                    break;

                case 5:
                    rating_count[4] = {
                        "five": {
                            "count": value.count
                        }
                    };
                    break;

                default:
                    break;
            }
        }

        const average_count = await getConnection().query(`select  ROUND(AVG(rating)) as rating from laytrip_feedback `)
        return { data: data, total_count: count, rating_count: rating_count, average_count: average_count[0], totalFeedbackCount: reviewCount };

    }   
}