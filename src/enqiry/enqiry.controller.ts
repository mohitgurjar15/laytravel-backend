import { Controller, Get, Query, UseGuards, HttpCode, Param, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnquiryListDto } from './dto/enquiry-list.dto';
import { Enquiry } from 'src/entity/enquiry.entity';
import { EnqiryService } from './enqiry.service';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from 'src/guards/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/guards/role.decorator';
import { newEnquiryDto } from './dto/new-enquiry.dto'
import { GetUser } from 'src/auth/get-user.dacorator';
import { User } from 'src/entity/user.entity';


@ApiTags("Enquiry")
@Controller('enqiry')
export class EnqiryController {

	constructor(private enqiryService: EnqiryService) { }

	@Get()
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
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
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.SUPPORT, Role.ADMIN)
	@ApiOperation({ summary: "get Enquiry Data using id " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async getFaqDetail(@Param("id") id: string): Promise<Enquiry> {
		return await this.enqiryService.getEnquiry(id);
	}




	@ApiOperation({ summary: "Create New Enquiry" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Post()
	@HttpCode(200)
	
	async createEnquiry(
		@Body() newEnquiryDto: newEnquiryDto
	): Promise<{ message: string }> {
		return await this.enqiryService.newEnquiry(newEnquiryDto);
	}
}
