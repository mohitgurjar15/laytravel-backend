import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingFeedback } from 'src/entity/booking-feedback.entity';
import { User } from 'src/entity/user.entity';
import {BookingFeedbackRepositery} from  './booking-feedback.repository';
import {AddBookingFeedback} from './dto/add-booking-feedback.dto'
import { listFeedbackForAdminDto } from './dto/list-feedback-admin.dto';
import { listFeedbackForUserDto } from './dto/list-feedback-user.dto';

@Injectable()
export class BookingFeedbackService {
    constructor(
		@InjectRepository(BookingFeedbackRepositery)
		private bookingFeedbackRepositery: BookingFeedbackRepositery,
    ) {}
    

    async addNewFeedback(addBookingFeedback:AddBookingFeedback,user:User)
    {
        const {booking_id,rate,message,property_id} = addBookingFeedback;

        // const feedbackExiest = this.bookingFeedbackRepositery.findOne(
        //     {bookingId,userId:user.userId}
        // )

        const feedback = new BookingFeedback();

        feedback.bookingId = booking_id;
        feedback.userId = user.userId;
        feedback.rate = rate;
        feedback.message = message;
        feedback.createdDate = new Date();
		feedback.isDeleted = false;
		feedback.propertyId = property_id;

	    await feedback.save();

        return {
			message : `feedback add successfully`
		}

	}
	
	async listFeedbacksForUser(listFeedbackForUserDto:listFeedbackForUserDto)
	{
		const {limit,page_no,property_id} = listFeedbackForUserDto;

		const where = `feedback.property_id = ${property_id} AND feedback.is_deleted = true`;

		return await this.bookingFeedbackRepositery.listFeedback(where,limit,page_no);
	}


	async listFeedbacksForAdmin(listFeedbackForAdminDto:listFeedbackForAdminDto)
	{
		const {limit,page_no,property_id,search} = listFeedbackForAdminDto;

		var where = `1=1`;

		if(property_id)
		{
			where += `AND (feedback.property_id = ${property_id})`;
		}

		if(search)
		{
			where += `AND (("user"."first_name" ILIKE '%${search}%')or("user"."email" ILIKE '%${search}%')or("user"."last_name" ILIKE '%${search}%'))`;
		}

		return await this.bookingFeedbackRepositery.listFeedback(where,limit,page_no);
	}


	async deleteFeedback (id)
	{
		const feedback = await this.bookingFeedbackRepositery.findOne(
            {id}
        )
        
		feedback.isDeleted = true;
		feedback.updatedDate = new Date();

		await feedback.save();
		
		return {
			message : `feedback deleted successfully`
		}
	}    
}
