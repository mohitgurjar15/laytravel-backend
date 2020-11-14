import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/enum/role.enum';
import { UpdateFaqDto } from 'src/faq/dto/update-faq.dto';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { AddFaqCategoryDto } from './dto/add-faq-category.dto';
import { UpdateFaqCategoryDto } from './dto/update-faq-category.dto';
import { FaqCategoryService } from './faq-category.service';

@ApiTags("FAQ Category")
@ApiBearerAuth()
@Controller('faq-category')
export class FaqCategoryController {
    constructor(private faqCategoryService: FaqCategoryService) {}



    @Get()
	@ApiOperation({ summary: "List Of Faq Category" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async faqCategoryList(
	){
		return await this.faqCategoryService.listFaqCategory();
	}

	@Get('/:id')
	@ApiOperation({ summary: "get Faq Category" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getFaqCategory(
		@Param("id") id: number,
	){
		return await this.faqCategoryService.getFaqCategory(id);
	}

	@Post()
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
	@ApiOperation({ summary: "Create New Faq Category" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async insertFaqCategory(
		@Body() addFaqCategoryDto: AddFaqCategoryDto,
	): Promise<{ message: string }> {
		return await this.faqCategoryService.addFaqCategory(addFaqCategoryDto);
	}

	@Put("/:id")
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
	@ApiOperation({ summary: "Update Faq category" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Faq Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async updateFaq(
		@Param("id") id: number,
		@Body() updateFaqCategoryDto: UpdateFaqCategoryDto,
	): Promise<{ message: string }> {
		return await this.faqCategoryService.updateFaqCategory(id, updateFaqCategoryDto);
	}

	@Delete("/:id")
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
	@ApiOperation({ summary: "Delete Faq Category" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async DeleteFaq(
		@Param("id") id: number,
	): Promise<{ message: string }> {
		return await this.faqCategoryService.deleteFaqCategory(id);
	}
}
