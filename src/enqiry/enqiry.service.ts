import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EnquiryRepository } from './enquiry.repository';
import { EnquiryListDto } from './dto/enquiry-list.dto';
import { Enquiry } from 'src/entity/enquiry.entity';
import { errorMessage } from 'src/config/common.config';
import { newEnquiryDto } from './dto/new-enquiry.dto';
import { User } from 'src/entity/user.entity';
import { v4 as uuidv4 } from "uuid";
import { Activity } from 'src/utility/activity.utility';

@Injectable()
export class EnqiryService {
    constructor(
		@InjectRepository(EnquiryRepository)
		private EnquiryRepository: EnquiryRepository
	) {}

	async listEnquiry(
		paginationOption: EnquiryListDto
	): Promise<{ data: Enquiry[]; TotalReseult: number }> {
		try {
			return await this.EnquiryRepository.listEnquiry(paginationOption);
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No Enquiry Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async newEnquiry(
		newEnquiryDto: newEnquiryDto,
		user : User
	){
		try {
			const {subject , message , location} = newEnquiryDto
			const enquiry = new Enquiry();
			enquiry.id = uuidv4();
			enquiry.email = user.email;
			enquiry.phoneNo = user.phoneNo;
			enquiry.location = location;
			enquiry.userName = user.firstName + ' ' + user.lastName;
			enquiry.subject = subject;
			enquiry.message = message;
			enquiry.createdDate = new Date;
			await enquiry.save();
			Activity.logActivity(user.userId, "enquiry", `${user.email} is Added New Enquiry for ${enquiry.subject}`);
        
			return { message : `Enquiry created successfully`};
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No Enquiry Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}


    async getEnquiry(id: string):Promise <Enquiry> {
		try {
			const EnqiryData = await this.EnquiryRepository.findOne({ id });
			if (!EnqiryData) {
				throw new NotFoundException(`Enqiry Id Not Found`);
			}
			return EnqiryData;
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No Enqiry Found.&&&id`);
			}
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}
}
