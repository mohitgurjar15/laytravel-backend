import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FaqCategoryRepository } from './faq-category.repository';
import { AddFaqCategoryDto } from './dto/add-faq-category.dto';
import { FaqCategory } from 'src/entity/faq-category.entity';
import { UpdateFaqCategoryDto } from './dto/update-faq-category.dto';
import { errorMessage } from 'src/config/common.config';


@Injectable()
export class FaqCategoryService {
    constructor(
        @InjectRepository(FaqCategoryRepository)
        private faqCategoryRepository: FaqCategoryRepository
    ) { }



    async addFaqCategory(addFaqCategoryDto: AddFaqCategoryDto) {
        try {
            const { name } = addFaqCategoryDto;
            const alredyExiest = await this.faqCategoryRepository.count({ name: name, isDeleted: false })

            console.log(alredyExiest);

            if (alredyExiest) {
                throw new ConflictException(`Given faq category alredy exiest`)
            }
            const category = new FaqCategory()

            category.name = name
            category.isDeleted = false

            await category.save();

            return { message: `Faq category save successfully` }

        } catch (error) {
            if (typeof error.response !== "undefined") {
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
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }



    async updateFaqCategory(id: number, updateFaqCategoryDto: UpdateFaqCategoryDto) {
        try {
            const { name } = updateFaqCategoryDto;

            const category = await this.faqCategoryRepository.findOne({ id, isDeleted: false })

            category.name = name

            await category.save();

            return { message: `Faq category update successfully` }

        } catch (error) {
            if (typeof error.response !== "undefined") {
                console.log("m");
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
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async deleteFaqCategory(id: number) {
        try {
            const category = await this.faqCategoryRepository.findOne({ id, isDeleted: false })

            category.isDeleted = true

            await category.save();

            return { message: `Faq category delete successfully` }

        } catch (error) {
            if (typeof error.response !== "undefined") {
                console.log("m");
                switch (error.response.statusCode) {
                    case 404:
                        if (
                            error.response.message ==
                            "This user does not exist&&&email&&&This user does not exist"
                        ) {
                            error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
                        }
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }


    async listFaqCategory() {
        try {
            return await this.faqCategoryRepository.listFaqCategory();
        } catch (error) {
            if (typeof error.response !== "undefined") {
                console.log("m");
                switch (error.response.statusCode) {
                    case 404:
                        if (
                            error.response.message ==
                            "This user does not exist&&&email&&&This user does not exist"
                        ) {
                            error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
                        }
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }

    async getFaqCategory(id) {
        try {
            return await this.faqCategoryRepository.getFaqCategory(id);
        } catch (error) {
            if (typeof error.response !== "undefined") {
                console.log("m");
                switch (error.response.statusCode) {
                    case 404:
                        if (
                            error.response.message ==
                            "This user does not exist&&&email&&&This user does not exist"
                        ) {
                            error.response.message = `This traveler does not exist&&&email&&&This traveler not exist`;
                        }
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(error.response.message);
                    case 406:
                        throw new NotAcceptableException(error.response.message);
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
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${errorMessage}`
            );
        }
    }
}
