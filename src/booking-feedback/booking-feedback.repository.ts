import { EntityRepository, getManager, Repository } from 'typeorm';
import {BookingFeedback} from '../entity/booking-feedback.entity'

@EntityRepository(BookingFeedback)
export class BookingFeedbackRepositery extends Repository<BookingFeedback> {

    async listFeedback(where:string , limit:number , page_no :number)
    {
        const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;

        const query = getManager()
			.createQueryBuilder(BookingFeedback, "feedback")
			//.leftJoinAndSelect("feedback.booking", "booking")
			.leftJoinAndSelect("feedback.user", "user")
			.where(where)
			.take(take)
			.offset(skip)
        const [data,count] = await query.getManyAndCount();
        
        // if (!data.length) {
		// 	throw new NotFoundException(`No feedback found&&&id&&&No feedback found`);
		// }
		return { data: data, total_count: count };
    }

}