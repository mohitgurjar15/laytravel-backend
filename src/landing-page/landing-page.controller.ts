import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { GetUser } from "src/auth/get-user.dacorator";
import { User } from "src/entity/user.entity";
import { Role } from "src/enum/role.enum";
import { Roles } from "src/guards/role.decorator";
import { RolesGuard } from "src/guards/role.guard";
import { ListLandingPageDto } from "./dto/list-landing-pages.dto";
import { ListReferralDto } from "./dto/list-refferals.dto";
import { CreateLandingPageDto } from "./dto/new-landing-page.dto";
import { LandingPageService } from "./landing-page.service";
@ApiTags("Landing page")
@Controller("landing-page")
export class LandingPageController {
    constructor(private landingPageService: LandingPageService) {}

    @Post()
    @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "Create new landing page from admin panel" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async landingPage(
        @Body() createLandingPageDto: CreateLandingPageDto,
        @GetUser() user: User
    ) {
        return await this.landingPageService.createNewLandingPage(
            createLandingPageDto,
            user
        );
    }

    @Get(`admin-panel/list`)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    @ApiOperation({ summary: "list landing page from admin panel" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async listlandingPage(@Query() paginationOption: ListLandingPageDto) {
        // console.table(paginationOption);

        return await this.landingPageService.listLandingPage(paginationOption);
    }

    @Get(`admin-panel/detail/:id`)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    @ApiOperation({ summary: "Get detail of landing page from admin panel" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async getlandingPage(@Param("id") id: string) {
        return await this.landingPageService.getLandingPage(id);
    }

    @Get(`:name`)
    @ApiOperation({ summary: "Get detail of landing page from fron end" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async getlandingPageFN(@Param("name") name: string) {
        return await this.landingPageService.getLandingPageName(name);
    }

    @Get(`admin-panel/referral-users`)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    @ApiOperation({
        summary: "Get detail refferal users of landing page from admin panel",
    })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async getlandingPageusers(@Query() paginationOption: ListReferralDto) {
        return await this.landingPageService.listReferralUser(paginationOption);
    }

    @Get(`admin-panel/referral-bookings`)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    @ApiOperation({
        summary:
            "Get detail refferal bookings of landing page from admin panel",
    })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "Admin not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async getlandingPageBookings(@Query() paginationOption: ListReferralDto) {
        return await this.landingPageService.listReferralBooking(
            paginationOption
        );
    }
}
