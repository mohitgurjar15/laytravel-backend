import { NotFoundException } from '@nestjs/common';
import { EntityRepository, getManager, Repository } from 'typeorm';
import { BookingFeedback } from '../entity/booking-feedback.entity'

@EntityRepository(BookingFeedback)
export class BookingFeedbackRepositery extends Repository<BookingFeedback> {

    async listFeedback(where: string, limit: number, page_no: number) {
        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;

        const query = getManager()
            .createQueryBuilder(BookingFeedback, "feedback")
            .leftJoinAndSelect("feedback.booking", "booking")
            .leftJoinAndSelect("booking.module", "module")
            .leftJoinAndSelect("feedback.user", "user")
            .select(["feedback.id", "feedback.bookingId","booking.bookingDate","feedback.rating", "feedback.message", "module.name","module.id", "user.firstName", "user.lastName", "user.email", "user.profilePic"])
            .where(where)
            .take(take)
            .offset(skip)
		const [data, count] = await query.getManyAndCount();
        
        if (!data.length) {
            throw new NotFoundException(`No feedback found.`)
        }
		const individualCount = await getManager().query(`select count(id) as count , rating from booking_feedback group by rating`)
		const average_count = await getManager().query(`select  ROUND(AVG(rating)) as rating from booking_feedback `)
        return { data: data, total_count: count , individual_count : individualCount , average_count:average_count[0]};
    }

}