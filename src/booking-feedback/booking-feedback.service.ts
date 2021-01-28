import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingFeedback } from 'src/entity/booking-feedback.entity';
import { User } from 'src/entity/user.entity';
import {BookingFeedbackRepositery} from  './booking-feedback.repository';
import {AddBookingFeedback} from './dto/add-booking-feedback.dto'
import { AddLaytripBookingFeedback } from './dto/add-laytrip-feedback.dto';
import { listFeedbackForAdminDto } from './dto/list-feedback-admin.dto';
import { listFeedbackForUserDto } from './dto/list-feedback-user.dto';

@Injectable()
export class BookingFeedbackService {
    constructor(
		@InjectRepository(BookingFeedbackRepositery)
		private bookingFeedbackRepositery: BookingFeedbackRepositery,
    ) {}
    

    async addNewFeedback(addBookingFeedback:AddBookingFeedback,user)
    {
        const {booking_id, rating,message} = addBookingFeedback;

        const feedbackExiest = this.bookingFeedbackRepositery.findOne(
            {bookingId:booking_id,userId:user.userId}
        )

        const feedback = new BookingFeedback();

        feedback.bookingId = booking_id;
        feedback.userId = user.userId;
        feedback.rating = rating;
		feedback.message = message;
		feedback.createdDate = new Date();
		feedback.isDeleted = false;
		

	    await feedback.save();

        return {
			message : `feedback add successfully`
		}

	}
	
	async listFeedbacksForUser(listFeedbackForUserDto:listFeedbackForUserDto)
	{
		const {limit,page_no} = listFeedbackForUserDto;

		const where = `feedback.is_deleted = false`;

		return await this.bookingFeedbackRepositery.listFeedbackForUser(where,limit,page_no);
	}


	async listFeedbacksForAdmin(listFeedbackForAdminDto:listFeedbackForAdminDto)
	{
		const {limit,page_no,search,rating} = listFeedbackForAdminDto;

		var where = `feedback.is_deleted = false `;

		if(rating)
		{
			where += `AND (feedback.rating = ${rating}) `;
		}

		if(search)
		{
			where += `AND (("user"."first_name" ILIKE '%${search}%')or("user"."email" ILIKE '%${search}%')or("user"."last_name" ILIKE '%${search}%')) `;
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

	// async addLaytripBookingFeedback(addLaytripBookingFeedback: AddLaytripBookingFeedback,user:User){
	// 	const { rating,message } = addLaytripBookingFeedback;
	
		
	// }
}
