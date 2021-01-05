import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { response } from 'express';
import { Deal } from 'src/entity/deal.entity';
import { Module } from 'src/entity/module.entity';
import { User } from 'src/entity/user.entity';
import { getConnection } from 'typeorm';
import { AddDealDto } from './dto/add-deal.dto';
import { ChangeDealStatusDto } from './dto/change-status.dto';
import { ListDealDto } from './dto/list-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Injectable()
export class DealService {


    async addDeal(addDealDto: AddDealDto, user: User, files, siteUrl) {

        const { module_id, location, image, status } = addDealDto
        const module = await getConnection()
            .createQueryBuilder(Module, 'module')
            .where("id =:module_id", { module_id })
            .getOne();

        if (!module) {
            throw new BadRequestException(`given module id not found`)
        }

        var where = `("deal"."is_deleted" = false) AND ("deal"."module_id" = ${module_id}) AND ("deal"."status" = true)`;

        const dealCount = await getConnection()
            .createQueryBuilder(Deal, 'deal')
            .where(where)
            .getCount();

        console.log(dealCount);

        if (status && dealCount > 1) {
            throw new NotAcceptableException(`Alredy 2 deal available please hide one of them`)
        }
        if (files.image == undefined) {
            throw new BadRequestException(`please upload image`)
        }

        const deal = new Deal()

        deal.image = files.image[0].filename;
        deal.location = location
        deal.module = module
        deal.isDeleted = false
        deal.status = status
        deal.createdDate = new Date()
        deal.updatedDate = new Date()
        deal.updateBy = user

        const dealData = await deal.save();

        return this.getDeal(dealData.id, siteUrl)
    }

    async updateDeal(updateDealDto: UpdateDealDto, user: User, files, siteUrl) {

        const { id, location, image } = updateDealDto

        var where = `("deal"."is_deleted" = false) AND ("deal"."id" = ${id})`;

        const deal = await getConnection()
            .createQueryBuilder(Deal, 'deal')
            .where(where)
            .getOne();

        if (!deal) {
            throw new NotAcceptableException(`given deal id is wrong`)
        }

        if (files.image != undefined) {
            deal.image = files.image[0].filename;
        }

        if (location) {
            deal.location = location
        }

        deal.updatedDate = new Date()
        deal.updateBy = user

        const dealData = await deal.save();
        return {
            message : `Deal updated successfully`
        }
    }


    async changeStatus(changeDealStatusDto: ChangeDealStatusDto, user: User, id: number) {

        const { status } = changeDealStatusDto

        var where = `("deal"."is_deleted" = false) AND ("deal"."id" = ${id})`;

        const deal = await getConnection()
            .createQueryBuilder(Deal, 'deal')
            .leftJoinAndSelect("deal.module", "module")
            .where(where)
            .getOne();

        if (!deal) {
            throw new NotAcceptableException(`given deal id is wrong`)
        }

        if (status) {
            var where2 = `("deal"."is_deleted" = false) AND ("deal"."module_id" = ${deal.module.id}) AND ("deal"."status" = true)`;
            const dealCount = await getConnection()
                .createQueryBuilder(Deal, 'deal')
                .where(where2)
                .getCount();

            if (dealCount > 1) {
                throw new NotAcceptableException(`Alredy 2 deal available please hide one of them`)
            }
        }

        deal.status = status
        deal.updatedDate = new Date()
        deal.updateBy = user

        await deal.save();

        return {
            message: `Deal status changed succesfully`
        }

    }

    async deleteDeal(user: User, id) {

        const deal = await getConnection()
            .createQueryBuilder(Deal, 'deal')
            .leftJoinAndSelect("deal.module", "module")
            .where(`"deal"."id" = ${id}`)
            .getOne();

        if (!deal) {
            throw new NotAcceptableException(`given deal id is wrong`)
        }


        deal.isDeleted = true
        deal.updatedDate = new Date()
        deal.updateBy = user

        await deal.save();
        return {
            message: `Deal deleted succesfully`
        }
    }


    async listDealForAdmin(listDealDto: ListDealDto, siteUrl) {
        const { limit, search, page_no } = listDealDto


        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;

        var where = `("deal"."is_deleted" = false)`;


        if (search) {
            module
            where += `AND (("deal"."location" ILIKE '%${search}%')or("module"."id" ILIKE '%${search}%')or("module"."name" ILIKE '%${search}%'))`;
        }

        const query = await getConnection()
            .createQueryBuilder(Deal, "deal")
            .leftJoinAndSelect("deal.module", "module")
            .select(["deal.id", "deal.image", "deal.location", "deal.isDeleted", "deal.status", "deal.createdDate", "deal.updatedDate", "deal.updateBy", "module.id", "module.name"])
            .where(where)
            .limit(take)
            .offset(skip)


        const [data, count] = await query.getManyAndCount();

        if (!data.length) {
            throw new NotFoundException(`no data found`)
        }

        for await (const row of data) {
            row.image = siteUrl + '/assets/static/' + row.image
        }

        return {
            data: data, count: count
        }
    }

    async listDealForUser(moduleId, siteUrl) {


        var where = `("deal"."is_deleted" = false) AND ("deal"."module_id" = ${moduleId}) AND ("deal"."status" = true)`;

        const query = await getConnection()
            .createQueryBuilder(Deal, "deal")
            .leftJoinAndSelect("deal.module", "module")
            .select(["deal.id", "deal.image", "deal.location", "deal.isDeleted", "deal.status", "deal.createdDate", "deal.updatedDate", "deal.updateBy", "module.id", "module.name"])
            .where(where)
            .orderBy(`"deal"."id"`, 'DESC')
            .limit(2)


        const [data, count] = await query.getManyAndCount();

        if (!data.length) {
            throw new NotFoundException(`no deal found`)
        }

        for await (const row of data) {
            row.image = siteUrl + '/assets/static/' + row.image
        }

        return {
            data: data
        }
    }

    async getDeal(id, siteUrl) {
        var where = `("deal"."is_deleted" = false) AND ("deal"."id" = ${id})`;

        const query = await getConnection()
            .createQueryBuilder(Deal, "deal")
            .leftJoinAndSelect("deal.module", "module")
            .select(["deal.id", "deal.image", "deal.location", "deal.isDeleted", "deal.status", "deal.createdDate", "deal.updatedDate", "deal.updateBy", "module.id", "module.name"])
            .where(where)


        const data = await query.getOne();

        if (!data) {
            throw new NotFoundException(`no deal found`)
        }
        data.image = siteUrl + '/assets/static/' + data.image
        return data
    }



}
