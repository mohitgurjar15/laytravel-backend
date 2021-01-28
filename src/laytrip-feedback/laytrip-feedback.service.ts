import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddLaytripBookingFeedback } from 'src/booking-feedback/dto/add-laytrip-feedback.dto';
import { LaytripFeedback } from 'src/entity/laytrip_feedback.entity';
import { User } from 'src/entity/user.entity';
import { ListLaytripFeedbackForAdminDto } from './dto/list-laytrip-feedback-admin.dto';
import { LaytripFeedbackRepository } from './laytrip-feedback.repository';

@Injectable()
export class LaytripFeedbackService {

    constructor(
        @InjectRepository(LaytripFeedbackRepository)
		private laytripFeedbackRepository: LaytripFeedbackRepository,
    ){}

    async addLaytripFeedback(addLaytripBookingFeedback: AddLaytripBookingFeedback,user:User){
		const { rating,message } = addLaytripBookingFeedback;
    
        const laytripFeedback = new LaytripFeedback();

        laytripFeedback.userId = user.userId;
        laytripFeedback.rating = rating;
        laytripFeedback.message = message;
        laytripFeedback.createdDate = new Date();
        laytripFeedback.isDeleted = false;
        
        try{
            await laytripFeedback.save();
            return {message: "laytrip feedback added successfully"}
        }catch(e){
            throw new InternalServerErrorException(`something went wrong`);
        }
    }
    
    async listLaytripFeedbacksForAdmin(listLaytripFeedbackForAdminDto: ListLaytripFeedbackForAdminDto,){
        const { limit,page_no,rating,search } = listLaytripFeedbackForAdminDto;
   
        let where = `feedback.is_deleted = false `;
        
        if(rating){
			where += `AND (feedback.rating = ${rating}) `;
		}

		if(search){
			where += `AND (("user"."first_name" ILIKE '%${search}%')or("user"."email" ILIKE '%${search}%')or("user"."last_name" ILIKE '%${search}%')) `;
		}

        return await this.laytripFeedbackRepository.listLaytripFeedbackAdmin(where,limit,page_no);
    }
}
