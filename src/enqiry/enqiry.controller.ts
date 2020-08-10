import { Controller, Get, Query, UseGuards, HttpCode, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnquiryListDto } from './dto/enquiry-list.dto';
import { Enquiry } from 'src/entity/enquiry.entity';
import { EnqiryService } from './enqiry.service';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from 'src/guards/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/guards/role.decorator';


@ApiTags("Enquiry")
@ApiBearerAuth()
@Controller('enqiry')
export class EnqiryController {

    constructor(private enqiryService: EnqiryService) {}

	@Get()
    @UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
    @ApiOperation({ summary: "List of Enquiry" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getFaq(
		@Query() paginationOption: EnquiryListDto
	): Promise<{ data: Enquiry[]; TotalReseult: number }> {
		return await this.enqiryService.listEnquiry(paginationOption);
    }



    @Get("/:id")
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "get Enquiry Data using id " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async getFaqDetail(@Param("id") id: string): Promise<Enquiry> {
		return await this.enqiryService.getEnquiry(id);
	}
}
