import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EnquiryRepository } from './enquiry.repository';
import { EnquiryListDto } from './dto/enquiry-list.dto';
import { Enquiry } from 'src/entity/enquiry.entity';
import { errorMessage } from 'src/config/common.config';
import { newEnquiryDto } from './dto/new-enquiry.dto';
import { v4 as uuidv4 } from "uuid";
import { MailerService } from '@nestjs-modules/mailer';
import * as config from "config";
import { EnquiryNotificationHTML } from 'src/config/email_template/enquiry-notification.html';
const mailConfig = config.get("email");

@Injectable()
export class EnqiryService {
	constructor(
		@InjectRepository(EnquiryRepository)
		private EnquiryRepository: EnquiryRepository,

		private readonly mailerService: MailerService
	) { }

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
				throw new NotFoundException(`No enquiry found&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async newEnquiry(
		newEnquiryDto: newEnquiryDto
	) {
		try {
			const { message, name, email, country_code, phone_no } = newEnquiryDto
			const enquiry = new Enquiry();
			enquiry.id = uuidv4();
			enquiry.email = email;
			if (phone_no)
				enquiry.phoneNo = phone_no;

			if (country_code)
				enquiry.countryCode = country_code;

			enquiry.userName = name;
			enquiry.message = message;
			enquiry.createdDate = new Date;
			await enquiry.save();
			//Activity.logActivity(user.userId, "enquiry", `${email} is Added New Enquiry`);
			this.mailerService
				.sendMail({
					to: mailConfig.admin,
					from: mailConfig.from,
					subject: `New enqiry`,
					html: EnquiryNotificationHTML({
						name: name, message: message
					})
				})
				.then((res) => {
					console.log("res", res);
				})
				.catch((err) => {
					console.log("err", err);
				});
			return { message: `Enquiry created successfully` };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No enquiry found&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}


	async getEnquiry(id: string): Promise<Enquiry> {
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
