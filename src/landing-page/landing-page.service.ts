import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "src/entity/user.entity";
import { CreateLandingPageDto } from "./dto/new-landing-page.dto";
import { v4 as uuidv4 } from "uuid";
import { LandingPages } from "src/entity/landing-page.entity";
import { ListLandingPageDto } from "./dto/list-landing-pages.dto";
import { getConnection } from "typeorm";
import { BookingStatus } from "src/enum/booking-status.enum";
import { CartBooking } from "src/entity/cart-booking.entity";

@Injectable()
export class LandingPageService {
    async createNewLandingPage(
        createLandingPageDto: CreateLandingPageDto,
        user: User
    ) {
        const { name, templet } = createLandingPageDto;

        let landingPage = new LandingPages();
        landingPage.id = uuidv4();
        landingPage.name = name;
        landingPage.templete = templet;
        landingPage.createdDate = new Date();
        landingPage.userId = user.userId;

        await landingPage.save();

        return {
            message: `Landing page created successfully.`,
        };
    }

    async listLandingPage(paginationOption: ListLandingPageDto) {
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;
        const keyword = search || "";

        let where;
        if (keyword) {
            where = `"landingPages"."is_deleted" = false AND(("landingPages"."name" ILIKE '%${keyword}%') or ("landingPages"."templete" ILIKE '%${keyword}%'))`;
        } else {
            where = `"landingPages"."is_deleted" = false`;
        }
        const query = getConnection()
            .createQueryBuilder(LandingPages, "landingPages")
            .leftJoinAndSelect("landingPages.createByUser", "Users")
            .select([
                "landingPages",
                "Users.firstName",
                "Users.lastName",
                "Users.email",
            ])
            .where(where)
            .take(take)
            .skip(skip);
        console.log(query);

        const [result, total] = await query.getManyAndCount();
        if (!result.length) {
            throw new NotFoundException(`No data found.`);
        }
        return { data: result, TotalReseult: total };
    }

    async getLandingPage(id: string) {
        let where = `"landingPages"."is_deleted" = false AND "landingPages"."id" = '${id}'`;

        const query = getConnection()
            .createQueryBuilder(LandingPages, "landingPages")
            .leftJoinAndSelect("landingPages.createByUser", "Users")
            .select([
                "landingPages",
                "Users.firstName",
                "Users.lastName",
                "Users.email",
            ])
            .where(where);

        const result = await query.getOne();
        if (!result) {
            throw new NotFoundException(`Id not found.`);
        }
        const refferalUsers = await getConnection()
            .createQueryBuilder(User, "user")
            .where(`referral_id = '${result.id}' AND is_verified = true`)
            .getCount();
        // const refferalbooking = await getConnection().query(
        //     `SELECT count(*) as "cnt" FROM "cart_booking" WHERE referral_id = '${result.id}' `
        // );
        let cartBookings = await getConnection()
            .createQueryBuilder(CartBooking, "cartBooking")
            .leftJoinAndSelect("cartBooking.bookings", "booking")
            .where(
                `("booking"."booking_status" In (${BookingStatus.CONFIRM},${BookingStatus.PENDING}) AND "cartBooking"."referral_id" = '${result.id}')`
            )
            .getCount();
        return {
            data: result,
            refferalUser: refferalUsers || 0,
            refferalBookings: cartBookings || 0,
        };
    }

    async getLandingPageName(name: string) {
        let where = `"landingPages"."is_deleted" = false AND "landingPages"."name" = '${name}'`;

        const query = getConnection()
            .createQueryBuilder(LandingPages, "landingPages")
            .leftJoinAndSelect("landingPages.createByUser", "Users")
            .select([
                "landingPages",
                "Users.firstName",
                "Users.lastName",
                "Users.email",
            ])
            .where(where);

        const result = await query.getOne();
        if (!result) {
            throw new NotFoundException(`Id not found.`);
        }
        return { data: result };
    }
}
