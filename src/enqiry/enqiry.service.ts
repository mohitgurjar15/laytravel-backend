import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotAcceptableException,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EnquiryRepository } from "./enquiry.repository";
import { EnquiryListDto } from "./dto/enquiry-list.dto";
import { Enquiry } from "src/entity/enquiry.entity";
import { errorMessage } from "src/config/common.config";
import { newEnquiryDto } from "./dto/new-enquiry.dto";
import { v4 as uuidv4 } from "uuid";
import { MailerService } from "@nestjs-modules/mailer";
import * as config from "config";
import { EnquiryNotificationHTML } from "src/config/new_email_templete/enquiry-notification.html";
import { LaytripInquiryAutoReplayMail } from "src/config/new_email_templete/laytrip_inquiry-auto-replay-mail.html";
const mailConfig = config.get("email");
import * as uuidValidator from "uuid-validate";
import { extname } from "path";
import { contentType } from "src/config/content-type";
import {logUrl} from 'src/config/base-url'

@Injectable()
export class EnqiryService {
    constructor(
        @InjectRepository(EnquiryRepository)
        private EnquiryRepository: EnquiryRepository,

        private readonly mailerService: MailerService
    ) {}

    async listEnquiry(
        paginationOption: EnquiryListDto
    ): Promise<{ data: Enquiry[]; TotalReseult: number }> {
        try {
                let enquires = await this.EnquiryRepository.listEnquiry(
                    paginationOption
                );
                for await (const enquiry of enquires.data) {
					const attachment = JSON.parse(enquiry.attachment);

                    if (attachment?.file.length) {
                        for (
                            let index = 0;
                            index < attachment?.file.length;
                            index++
                        ) {
                            const file = attachment?.file[index];
                            attachment.file[index] = logUrl + "enquiry/" + file;
                        }
                    }
                    enquiry.attachment = attachment;
                }
                return enquires;
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

    async newEnquiry(newEnquiryDto: newEnquiryDto, files, siteUrl,referralId) {
        try {
            const { message, name, email } = newEnquiryDto;
            const enquiry = new Enquiry();
            enquiry.id = uuidv4();
            enquiry.email = email;
            // if (phone_no)
            // 	enquiry.phoneNo = phone_no;

            // if (country_code)
            // 	enquiry.countryCode = country_code;
			var allemail = "";
            let attachments = [];
            const fs = require("fs");
            var path = require("path");
            let filesName = {
                file: [],
            };
            if (typeof files.file != "undefined") {
                for await (const file of files.file) {
                    filesName.file.push(file.filename);
                    var fileName = path.resolve(
                        "/var/www/html/logs/enquiry/" + file.filename
                    );
                    const fileExtName = extname(file.originalname);
                    const cn = contentType[fileExtName];
                    console.log(cn);

                    const attachment = {
                        content: fs.readFileSync(fileName),
                        filename: file.filename,
                        contentType: cn,
                    };
                    attachments.push(attachment);
                }
            }

            enquiry.userName = name;
            enquiry.message = message;
            enquiry.createdDate = new Date();
			enquiry.attachment = JSON.stringify(filesName);
            await enquiry.save();
            //Activity.logActivity(user.userId, "enquiry", `${email} is Added New Enquiry`);
            this.mailerService
                .sendMail({
                    to: mailConfig.admin,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: `New Enquiry`,
					attachments: attachments,
                    html: EnquiryNotificationHTML({
                        name: name,
                        message: message,
                        id: enquiry.id,
                        email
                    }),
                })
                .then((res) => {
                    console.log("res", res);
                })
                .catch((err) => {
                    console.log("err", err);
                });

            this.mailerService
                .sendMail({
                    to: email,
                    from: mailConfig.from,
                    bcc: mailConfig.BCC,
                    subject: `Message to Laytrip Received`,
                    html: await LaytripInquiryAutoReplayMail({
                        username: name || "",
                    },referralId),
                })
                .then((res) => {
                    console.log("res", res);
                })
                .catch((err) => {
                    console.log("err", err);
                });
            return { message: `Message sent successfully.` };
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
            if (!uuidValidator(id)) {
                throw new BadRequestException("Given id not avilable");
            }
            const EnqiryData = await this.EnquiryRepository.findOne({ id });
            if (!EnqiryData) {
                throw new NotFoundException(`Enqiry Id Not Found`);
            }
            return EnqiryData;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                //console.log('m');
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 401:
                        throw new UnauthorizedException(error.response.message);
                    default:
                        throw new InternalServerErrorException(
                            `${error.message}&&&id&&&${error.Message}`
                        );
                }
            }
            throw new NotFoundException(
                `${error.message}&&&id&&&${error.message}`
            );
        }
    }
}
