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
import { Deal } from "src/entity/deal.entity";
import { Module } from "src/entity/module.entity";
import { User } from "src/entity/user.entity";
import { ModulesName } from "src/enum/module.enum";
import { airports } from "src/flight/airports";
import { getConnection } from "typeorm";
import { AddDealDto } from "./dto/add-deal.dto";
import { ChangeDealStatusDto } from "./dto/change-status.dto";
import { ListDealDto } from "./dto/list-deal.dto";
import { UpdateDealDto } from "./dto/update-deal.dto";

@Injectable()
export class DealService {
    async addDeal(addDealDto: AddDealDto, user: User, files, siteUrl) {
        try {
            const { module_id, location, image, hotel_location } = addDealDto;
            const module = await getConnection()
                .createQueryBuilder(Module, "module")
                .where("id =:module_id", { module_id })
                .getOne();

            if (!module) {
                throw new BadRequestException(`Given module id not found`);
            }

            var where = `("deal"."is_deleted" = false) AND ("deal"."module_id" = ${module_id}) AND ("deal"."status" = true)`;

            const dealCount = await getConnection()
                .createQueryBuilder(Deal, "deal")
                .where(where)
                .getCount();

            // console.log(dealCount);

            // if (status) {
            //     if (dealCount > 1) {
            //         throw new BadRequestException(`Max 2 deal will be available at a time, please deactivate one deal to active new deal.`)
            //     }
            // }

            if (files.image == undefined) {
                throw new BadRequestException(`Please upload image`);
            }

            if (module.id == ModulesName.FLIGHT && !airports[location]) {
                throw new BadRequestException(
                    `Please enter valid airport location`
                );
            }

            if(module.id == ModulesName.HOTEL){
                let loc:any = hotel_location

                if(!loc?.title){
                    throw new BadRequestException(`Enter title`)
                }
                if(!loc?.city){
                    throw new BadRequestException(`Enter city`)
                }
                if(!loc?.state){
                    throw new BadRequestException(`Enter state`)
                }
                if(!loc?.type){
                    throw new BadRequestException(`Enter type`)
                }
                if(!loc?.lat){
                    throw new BadRequestException(`Enter lat`)
                }
                if(!loc?.long){
                    throw new BadRequestException(`Enter long`)
                }
                
            }
            const deal = new Deal();

            deal.image = files.image[0].filename;
            deal.location = location || null;
            deal.module = module;
            deal.isDeleted = false;
            deal.status = false;
            deal.createdDate = new Date();
            deal.updatedDate = new Date();
            deal.updateBy = user;
            deal.hotelLocation = hotel_location || null;

            const dealData = await deal.save();

            return this.getDeal(dealData.id, siteUrl);
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
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
                    case 403:
                        throw new ForbiddenException(error.response.message);
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

    async updateDeal(updateDealDto: UpdateDealDto, user: User, files, siteUrl) {
        try {
            const { id, location, image, hotel_location } = updateDealDto;

            var where = `("deal"."is_deleted" = false) AND ("deal"."id" = ${id})`;

            const deal = await getConnection()
                .createQueryBuilder(Deal, "deal")
                .leftJoinAndSelect("deal.module", "module")
                .where(where)
                .getOne();

            if (!deal) {
                throw new BadRequestException(`Given deal id is incorrect.`);
            }

            if (files.image != undefined) {
                deal.image = files.image[0].filename;
            }

            if (location) {
                if (!airports[location]) {
                    throw new BadRequestException(
                        `Please enter valid airport location`
                    );
                }
                deal.location = location;
            }

            if (hotel_location) {
                if (deal.module.id == ModulesName.HOTEL) {
                    let loc: any = hotel_location;

                    if (!loc?.title) {
                        throw new BadRequestException(`Enter title`);
                    }
                    if (!loc?.city) {
                        throw new BadRequestException(`Enter city`);
                    }
                    if (!loc?.state) {
                        throw new BadRequestException(`Enter state`);
                    }
                    if (!loc?.type) {
                        throw new BadRequestException(`Enter type`);
                    }
                    if (!loc?.lat) {
                        throw new BadRequestException(`Enter lat`);
                    }
                    if (!loc?.long) {
                        throw new BadRequestException(`Enter long`);
                    }
                }
                deal.hotelLocation = hotel_location;
            }

            deal.updatedDate = new Date();
            deal.updateBy = user;

            const dealData = await deal.save();
            return {
                message: `Deal updated successfully`,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
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
                    case 403:
                        throw new ForbiddenException(error.response.message);
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

    async changeStatus(
        changeDealStatusDto: ChangeDealStatusDto,
        user: User,
        id: number
    ) {
        try {
            const { status } = changeDealStatusDto;

            var where = `("deal"."is_deleted" = false) AND ("deal"."id" = ${id})`;

            const deal = await getConnection()
                .createQueryBuilder(Deal, "deal")
                .leftJoinAndSelect("deal.module", "module")
                .where(where)
                .getOne();

            if (!deal) {
                throw new BadRequestException(`Given deal id is incorrect.`);
            }

            if (status) {
                var where2 = `("deal"."is_deleted" = false) AND ("deal"."module_id" = ${deal.module.id}) AND ("deal"."status" = true)`;
                const dealCount = await getConnection()
                    .createQueryBuilder(Deal, "deal")
                    .where(where2)
                    .getCount();

                if (dealCount > 1) {
                    throw new BadRequestException(
                        `Max 2 deal will be available at a time, please deactivate one deal to active new deal.`
                    );
                }
            }

            deal.status = status;
            deal.updatedDate = new Date();
            deal.updateBy = user;

            await deal.save();

            return {
                message: `Deal status changed successfully`,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
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
                    case 403:
                        throw new ForbiddenException(error.response.message);
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

    async deleteDeal(user: User, id) {
        try {
            const deal = await getConnection()
                .createQueryBuilder(Deal, "deal")
                .leftJoinAndSelect("deal.module", "module")
                .where(`"deal"."id" = ${id}`)
                .getOne();

            if (!deal) {
                throw new BadRequestException(`Given deal id is incorrect.`);
            }

            deal.isDeleted = true;
            deal.updatedDate = new Date();
            deal.updateBy = user;

            await deal.save();
            return {
                message: `Deal deleted successfully`,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
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
                    case 403:
                        throw new ForbiddenException(error.response.message);
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

    async listDealForAdmin(listDealDto: ListDealDto, siteUrl) {
        try {
            const { limit, search, page_no } = listDealDto;

            const take = limit || 10;
            const skip = (page_no - 1) * limit || 0;

            var where = `("deal"."is_deleted" = false)`;

            if (search) {
                //module
                where += `AND (("deal"."location" ILIKE '%${search}%')or("module"."name" ILIKE '%${search}%'))`;
            }

            const query = await getConnection()
                .createQueryBuilder(Deal, "deal")
                .leftJoinAndSelect("deal.module", "module")
                .select([
                    "deal.id",
                    "deal.image",
                    "deal.location",
                    "deal.isDeleted",
                    "deal.status",
                    "deal.createdDate",
                    "deal.updatedDate",
                    "deal.updateBy",
                    "module.id",
                    "module.name",
                    "deal.hotelLocation",
                ])
                .where(where)
                .limit(take)
                .offset(skip)
                .orderBy("deal.id", "DESC");

            const [data, count] = await query.getManyAndCount();

            if (!data.length) {
                throw new NotFoundException(`No deal founds.`);
            }
            let deals = [];
            let deal;
            for await (const row of data) {
                row.image = siteUrl + "/static/" + row.image;
                deal = {};
                deal = row;
                if (row.module.id == ModulesName.FLIGHT) {
                    deal.location_info = airports[row.location];
                }

                if (row.module.id == ModulesName.HOTEL) {
                    deal.location_info = row.hotelLocation;
                }
                deals.push(deal);
            }

            return {
                data: deals,
                count: count,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
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
                    case 403:
                        throw new ForbiddenException(error.response.message);
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

    async listDealForUser(moduleId, siteUrl) {
        try {
            var where = `("deal"."is_deleted" = false) AND ("deal"."module_id" = ${moduleId}) AND ("deal"."status" = true)`;

            const query = await getConnection()
                .createQueryBuilder(Deal, "deal")
                .leftJoinAndSelect("deal.module", "module")
                .select([
                    "deal.id",
                    "deal.image",
                    "deal.location",
                    "deal.isDeleted",
                    "deal.status",
                    "deal.createdDate",
                    "deal.updatedDate",
                    "deal.updateBy",
                    "module.id",
                    "module.name",
                    "deal.hotelLocation",
                ])
                .where(where)
                .orderBy(`"deal"."id"`, "DESC")
                .limit(2);

            const [data, count] = await query.getManyAndCount();

            // console.log(data);

            if (!data.length) {
                throw new NotFoundException(`No deal founds.`);
            }

            let deals = [];
            let deal;
            for await (const row of data) {
                deal = {};
                // deal = airports[row.location];

                if (row.module.id == ModulesName.FLIGHT) {
                    deal = airports[row.location];
                }
                deal.image = siteUrl + "/static/" + row.image;
                if (row.module.id == ModulesName.HOTEL) {
                    deal = row.hotelLocation;
                }
                deals.push(deal);
            }

            return {
                data: deals,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
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
                    case 403:
                        throw new ForbiddenException(error.response.message);
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

    async getDeal(id, siteUrl) {
        try {
            var where = `("deal"."is_deleted" = false) AND ("deal"."id" = ${id})`;

            const query = await getConnection()
                .createQueryBuilder(Deal, "deal")
                .leftJoinAndSelect("deal.module", "module")
                .select([
                    "deal.id",
                    "deal.image",
                    "deal.location",
                    "deal.isDeleted",
                    "deal.status",
                    "deal.createdDate",
                    "deal.updatedDate",
                    "deal.updateBy",
                    "module.id",
                    "module.name",
                    "deal.hotelLocation",
                ])
                .where(where);

            const data = await query.getOne();

            if (!data) {
                throw new NotFoundException(`No deal founds.`);
            }
            data.image = siteUrl + "/static/" + data.image;

            let deal;

            deal = {};
            deal = data;

            if (data.module.id == ModulesName.FLIGHT) {
                deal.location_info = airports[data.location];
            }

            if (data.module.id == ModulesName.HOTEL) {
                deal.location_info = data.hotelLocation;
            }

            return deal;
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
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
                    case 403:
                        throw new ForbiddenException(error.response.message);
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
