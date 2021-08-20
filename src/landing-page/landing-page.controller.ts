import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Patch,
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
import { NewLandingPageDiscountConfigDto } from "./dto/discount-config.dto";
import { NewLandingPageDownPaymentConfigDto } from "./dto/down-payment-config.dto";
import { ExportReferralDto } from "./dto/export-referrals.dto";
import { ListDiscountDto } from "./dto/list-dicount-config.dto";
import { ListDownPaymentDto } from "./dto/list-down-payment.dto";
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

    @Get(`export/referral-users`)
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
    async exportlandingPageusers(@Query() paginationOption: ExportReferralDto) {
        return await this.landingPageService.exportReferralUser(
            paginationOption
        );
    }

    @Get(`export/referral-bookings`)
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
    async exportlandingPageBookings(
        @Query() paginationOption: ExportReferralDto
    ) {
        return await this.landingPageService.exportReferralBooking(
            paginationOption
        );
    }

    @Post('add-down-payment')
    @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "Add down payment in landing page from admin panel" })
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
    async addLandingPageDownPayment(
        @Body() newLandingPageDownPaymentConfigDto: NewLandingPageDownPaymentConfigDto,
        @GetUser() user: User
    ) {
        return await this.landingPageService.addLandingPageDownPayment(
            newLandingPageDownPaymentConfigDto,
            user
        );
    }

    // @Patch('update-down-payment')
    // @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    // @ApiBearerAuth()
    // @UseGuards(AuthGuard(), RolesGuard)
    // @ApiOperation({ summary: "Update down payment in landing page from admin panel" })
    // @ApiResponse({ status: 200, description: "Api success" })
    // @ApiResponse({
    //     status: 422,
    //     description: "Bad Request or API error message",
    // })
    // @ApiResponse({
    //     status: 403,
    //     description: "You are not allowed to access this resource.",
    // })
    // @ApiResponse({ status: 404, description: "Admin not found!" })
    // @ApiResponse({ status: 500, description: "Internal server error!" })
    // @HttpCode(200)
    // async updateLandingPageDownPayment(
    //     @Body() newLandingPageDownPaymentConfigDto: NewLandingPageDownPaymentConfigDto,
    //     @GetUser() user: User
    // ) {
    //     return await this.landingPageService.updateLandingPageDownPayment(
    //         newLandingPageDownPaymentConfigDto,
    //         user
    //     );
    // }

    @Get(`landing-page/down-payent`)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    @ApiOperation({ summary: "Get detail of landing page down payment" })
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
    async getLandingPageDownPayment(@Query() listDownPaymentDto:ListDownPaymentDto) {
        console.log('DTO-------------',listDownPaymentDto)
        return await this.landingPageService.getLandingPageDownPayment(listDownPaymentDto);
    }

    @Post('add-discount')
    @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "Add discount in landing page from admin panel" })
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
    async addLandingPageDiscount(
        @Body()newLandingPageDiscountConfigDto: NewLandingPageDiscountConfigDto,
        @GetUser() user: User
    ) {
        return await this.landingPageService.addLandingPageDiscount(
            newLandingPageDiscountConfigDto,
            user
        );
    }

    // @Patch('update-discount')
    // @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    // @ApiBearerAuth()
    // @UseGuards(AuthGuard(), RolesGuard)
    // @ApiOperation({ summary: "Update discount in landing page from admin panel" })
    // @ApiResponse({ status: 200, description: "Api success" })
    // @ApiResponse({
    //     status: 422,
    //     description: "Bad Request or API error message",
    // })
    // @ApiResponse({
    //     status: 403,
    //     description: "You are not allowed to access this resource.",
    // })
    // @ApiResponse({ status: 404, description: "Admin not found!" })
    // @ApiResponse({ status: 500, description: "Internal server error!" })
    // @HttpCode(200)
    // async updateLandingPageDiscount(
    //     @Body() newLandingPageDiscountConfigDto: NewLandingPageDiscountConfigDto,
    //     @GetUser() user: User
    // ) {
    //     return await this.landingPageService.updateLandingPageDiscount(
    //         newLandingPageDiscountConfigDto,
    //         user
    //     );
    // }

    @Get(`landing-page/discount`)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    @ApiOperation({ summary: "Get detail of landing page discount" })
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
    async getLandingPageDiscount(@Query() listDiscountDto:ListDiscountDto) {
        console.log('DTO-------------',listDiscountDto)
        return await this.landingPageService.getLandingPageDiscount(listDiscountDto);
    }
}
