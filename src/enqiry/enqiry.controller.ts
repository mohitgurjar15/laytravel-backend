import {
    Controller,
    Get,
    Query,
    UseGuards,
    HttpCode,
    Param,
    Post,
    Body,
    UseInterceptors,
    UploadedFiles,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiConsumes,
} from "@nestjs/swagger";
import { EnquiryListDto } from "./dto/enquiry-list.dto";
import { Enquiry } from "src/entity/enquiry.entity";
import { EnqiryService } from "./enqiry.service";
import { Role } from "src/enum/role.enum";
import { RolesGuard } from "src/guards/role.guard";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "src/guards/role.decorator";
import { newEnquiryDto } from "./dto/new-enquiry.dto";
import { FileFieldsInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { editFileName } from "src/auth/file-validator";
import { SiteUrl } from "src/decorator/site-url.decorator";
import { uploadFileDto } from "src/general/dto/attachment.dto";

@ApiTags("Enquiry")
@Controller("enqiry")
export class EnqiryController {
    constructor(private enqiryService: EnqiryService) {}

    @Get()
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    @ApiOperation({ summary: "List of Enquiry" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 404, description: "Not Found" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async getFaq(
        @Query() paginationOption: EnquiryListDto
    ): Promise<{ data: Enquiry[]; TotalReseult: number }> {
        return await this.enqiryService.listEnquiry(paginationOption);
    }

    @Get("/:id")
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
    @ApiOperation({ summary: "get Enquiry Data using id " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 404, description: "Not Found" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async getFaqDetail(@Param("id") id: string): Promise<Enquiry> {
        return await this.enqiryService.getEnquiry(id);
    }

    @ApiOperation({ summary: "Create New Enquiry" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 404, description: "Not Found" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Post()
    @ApiConsumes("multipart/form-data")
    // @UseInterceptors(
    //     FileFieldsInterceptor([{ name: "file" }], {
    //         storage: diskStorage({
    //             destination: "/var/www/html/logs/enquiry/",
    //             filename: editFileName,
    //         }),
    //         limits: { fileSize: 1097152 },
    //     })
    // )
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: "file", maxCount: 5 },
                { name: "file1", maxCount: 1 },
            ],
            {
                storage: diskStorage({
                    destination: "/var/www/html/logs/enquiry/",
                    filename: editFileName,
                }),
                limits: { fileSize: 20097152 },
            }
        )
    )
    //@UseInterceptors(FilesInterceptor('files[]', 20))
    @HttpCode(200)
    async createEnquiry(
        @Body() newEnquiryDto: newEnquiryDto,
        @SiteUrl() siteUrl,
        // @UploadedFiles() files: uploadFileDto
        @UploadedFiles() files
    ): Promise<{ message: string }> {
        return await this.enqiryService.newEnquiry(
            newEnquiryDto,
            files,
            siteUrl
        );
    }
}
