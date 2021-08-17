import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Post,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
} from "@nestjs/swagger";
import { editFileName } from "src/auth/file-validator";
import { GetUser } from "src/auth/get-user.dacorator";
import { User } from "src/entity/user.entity";
import { Role } from "src/enum/role.enum";
import { Roles } from "src/guards/role.decorator";
import { RolesGuard } from "src/guards/role.guard";
import { Detail } from "src/hotel/hotel-suppliers/priceline/modules/detail";
import { CryptoUtility } from "src/utility/crypto.utility";
import { PushNotification } from "src/utility/push-notification.utility";
import { WebNotification } from "src/utility/web-notification.utility";
import { PushNotificationDto } from "./dto/push-notification.dto";
import { MassCommunicationDto } from "./dto/send-mass-communication.dto";
import { WebNotificationDto } from "./dto/web-notification.dto";
import { diskStorage } from "multer";
import { GeneralService } from "./general.service";
import { uploadFileDto } from "./dto/upload-file.dto";
import { SiteUrl } from "src/decorator/site-url.decorator";
import { UserIpAddress } from "src/decorator/ip-address.decorator";
import { ListMassCommunicationDto } from "./dto/list-mass-communication.dto";

@ApiTags("Generic")
@Controller("generic")
export class GeneralController {
    constructor(private generalService: GeneralService) {}

    @ApiOperation({ summary: "Get All country" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 404, description: "Not found!" })
    @ApiResponse({ status: 409, description: "User Already Exist" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Get("country")
    async getCountry() {
        return await this.generalService.getAllCountry();
    }

    @ApiOperation({ summary: "Get country details" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 404, description: "Not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Get("country/:id")
    async getCountryDetails(@Param("id") id: number) {
        return await this.generalService.getCountryDetails(id);
    }

    @ApiOperation({ summary: "test crypto" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 404, description: "Not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Get("testCrypto/:id")
    async testCrypto(@Param("id") id: string) {
        return await CryptoUtility.encode(id);
    }

    @ApiOperation({ summary: "Get state by country id" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 404, description: "Not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Get("country/:id/state")
    async getState(@Param("id") id: number) {
        return await this.generalService.getStates(id);
    }

    @ApiOperation({ summary: "Get state details" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 404, description: "Not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Get("state/:id")
    async getStateDetails(@Param("id") id: number) {
        return await this.generalService.getStateDetails(id);
    }

    @ApiOperation({ summary: "User Location" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 404, description: "Not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Get("location")
    async getUserLocation(@Req() req) {
        return await this.generalService.getUserLocation(req);
    }

    @ApiOperation({ summary: "push notification" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 404, description: "Not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Post("push-notification")
    async pusTest(@Body() detail: PushNotificationDto) {
        const { userId, body, header } = detail;
        PushNotification.sendNotificationTouser(userId, body, header, userId);
        return { message: `Notification send succesfully` };
    }

    @ApiOperation({ summary: "web notification" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 404, description: "Not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Post("web-notification")
    async webtest(@Body() detail: WebNotificationDto) {
        try {
            const { userId, body, header, action } = detail;
            await WebNotification.sendNotificationTouser(
                userId,
                body,
                header,
                userId,
                action
            );
            return { message: `Notification send succesfully` };
        } catch (error) {
            console.log(error);
        }
    }

    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
    @Post(["mass-communication"])
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(
        FileFieldsInterceptor([{ name: "file" }], {
            storage: diskStorage({
                destination: "/var/www/html/logs/mail/",
                filename: editFileName,
            }),
            limits: { fileSize: 2097152 },
        })
    )
    @ApiOperation({ summary: "Mass communication" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
    @ApiResponse({ status: 401, description: "Invalid Login credentials." })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async massCommunication(
        @Body() dto: MassCommunicationDto,
        @GetUser() user: User,
        @UploadedFiles() files: uploadFileDto,
        @SiteUrl() siteUrl
    ) {
        return await this.generalService.massCommunication(
            dto,
            user,
            files,
            siteUrl
        );
    }
    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.SUPPORT)
    @Get(["list/mass-communication"])
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "list Mass communication" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
    @ApiResponse({ status: 401, description: "Invalid Login credentials." })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async listmassCommunication(@Query() paginationOption:ListMassCommunicationDto,@SiteUrl() siteUrl: string) {
        return await this.generalService.ListMassCommunication(
            paginationOption,siteUrl
        );
    }

    @Post(["test/email/:emailId"])
    @ApiOperation({ summary: "Test manual emails" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
    @ApiResponse({ status: 401, description: "Invalid Login credentials." })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async testEmail(@Param("emailId") email: string) {
        return await this.generalService.testEmail(email);
    }

    @Post(["test/travelerInfo/addforall"])
    @ApiOperation({ summary: "Update traveler info of user" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
    @ApiResponse({ status: 401, description: "Invalid Login credentials." })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async update() {
        return await this.generalService.updateTravelerInfo();
    }

    // @Post(["test/booking/categoryName"])
    // @ApiOperation({ summary: "Update traveler info of user" })
    // @ApiResponse({ status: 200, description: "Api success" })
    // @ApiResponse({
    //     status: 422,
    //     description: "Bad Request or API error message",
    // })
    // @ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
    // @ApiResponse({ status: 401, description: "Invalid Login credentials." })
    // @ApiResponse({ status: 500, description: "Internal server error!" })
    // @HttpCode(200)
    // async updatebooking() {
    //     return await this.generalService.bookingCategoryName();
    // }

    @Post(["test/ip_adress/log"])
    @ApiOperation({ summary: "Update traveler info of user" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
    @ApiResponse({ status: 401, description: "Invalid Login credentials." })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async test(@UserIpAddress() ip) {
        console.log(ip);
    }

    // @Post(["test/predictive_dance/update"])
    // @ApiOperation({ summary: "" })
    // @ApiResponse({ status: 200, description: "Api success" })
    // @ApiResponse({
    //     status: 422,
    //     description: "Bad Request or API error message",
    // })
    // @ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
    // @ApiResponse({ status: 401, description: "Invalid Login credentials." })
    // @ApiResponse({ status: 500, description: "Internal server error!" })
    // @HttpCode(200)
    // async test2(@UserIpAddress() ip) {
    //    return await this.generalService.predictiveData()
    // }


    @Post(["test/admin-model/:id/:email"])
    @ApiOperation({ summary: "Update traveler info of user" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
    @ApiResponse({ status: 401, description: "Invalid Login credentials." })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async testAdminModel(@Param('id') id:string,@Param('email') email:string ) {
        return this.generalService.adminEmailModel(id, email);
    }

    @Post(["test/valuation-percentage/:id"])
    @ApiOperation({ summary: "valuation percentage" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
    @ApiResponse({ status: 401, description: "Invalid Login credentials." })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async valuationPercentage(@Param('id') id:string) {
        return await  this.generalService.valuationPercentages(id);
    }


    @ApiOperation({ summary: "test/sample/code" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 404, description: "Not found!" })
    @ApiResponse({ status: 409, description: "User Already Exist" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Get("test/sample/code")
    async testSample() {
        return await this.generalService.temp();
    }
}
