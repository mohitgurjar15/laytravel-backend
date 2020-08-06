import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EnquiryRepository } from './enquiry.repository';
import { EnquiryListDto } from './dto/enquiry-list.dto';
import { Enquiry } from 'src/entity/enquiry.entity';
import { errorMessage } from 'src/config/common.config';

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
