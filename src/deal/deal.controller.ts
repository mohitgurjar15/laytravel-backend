import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { editFileName, imageFileFilter } from 'src/auth/file-validator';
import { DealService } from './deal.service';
import { diskStorage } from "multer";
import { AddDealDto } from './dto/add-deal.dto';
import { ProfilePicDto } from 'src/auth/dto/profile-pic.dto';
import { ImageDto } from './dto/image.dto';
import { GetUser } from 'src/auth/get-user.dacorator';
import { User } from 'src/entity/user.entity';
import { SiteUrl } from 'src/decorator/site-url.decorator';
import { UpdateDealDto } from './dto/update-deal.dto';
import { Roles } from 'src/guards/role.decorator';
import { Role } from 'src/enum/role.enum';
import { ChangeDealStatusDto } from './dto/change-status.dto';
import { ListDealDto } from './dto/list-deal.dto';

@ApiTags("Deals module")
@Controller('deal')
export class DealController {
	constructor(private dealService: DealService) { }


	@Post("add")
	@ApiOperation({ summary: "add new deal" })
	@ApiConsumes("multipart/form-data")
	@ApiBearerAuth()
	@UseGuards(AuthGuard())
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 400, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not found!" })
	@ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	@UseInterceptors(
		FileFieldsInterceptor([{ name: "image", maxCount: 1 }], {
			storage: diskStorage({
				destination: "./assets/static",
				filename: editFileName,
			}),
			fileFilter: imageFileFilter,
			limits: { fileSize: 2097152 },
		})
	)
	async addDeal(
		@Body() addDealDto: AddDealDto,
		@UploadedFiles() files: ImageDto,
		@Req() req,
		@GetUser() user: User,
		@SiteUrl() siteUrl
	): Promise<any> {
		if (req.fileValidationError) {
			throw new BadRequestException(`${req.fileValidationError}`);
		}
		return await this.dealService.addDeal(
			addDealDto,
			user,
			files,
			siteUrl
		);
	}


	@Put("update")
	@ApiOperation({ summary: "update deal" })
	@ApiConsumes("multipart/form-data")
	@ApiBearerAuth()
	@UseGuards(AuthGuard())
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 400, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not found!" })
	@ApiResponse({ status: 406, description: "Please Verify Your Email Id" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	@UseInterceptors(
		FileFieldsInterceptor([{ name: "image", maxCount: 1 }], {
			storage: diskStorage({
				destination: "./assets/static",
				filename: editFileName,
			}),
			fileFilter: imageFileFilter,
			limits: { fileSize: 2097152 },
		})
	)
	async updateDeal(
		@Body() updateDealDto: UpdateDealDto,
		@UploadedFiles() files: ImageDto,
		@Req() req,
		@GetUser() user: User,
		@SiteUrl() siteUrl
	): Promise<any> {
		if (req.fileValidationError) {
			throw new BadRequestException(`${req.fileValidationError}`);
		}
		return await this.dealService.updateDeal(
			updateDealDto,
			user,
			files,
			siteUrl
		);
	}



	@Patch("change-status/:id")
	@ApiBearerAuth()
	@UseGuards(AuthGuard())
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "change deal status" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async changeStatus(
		@Param("id") id: number,
		@Body() changeDealStatusDto: ChangeDealStatusDto,
		@GetUser() user: User
	) {


		return await this.dealService.changeStatus(
			changeDealStatusDto,
			user, id
		);
	}

	@Delete("delete/:id")
	@ApiBearerAuth()
	@UseGuards(AuthGuard())
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "delete deal" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async deleteDeal(
		@Param("id") id: number,
		@GetUser() user: User
	) {
		return await this.dealService.deleteDeal(
			user, id
		);
	}
	/**
	 *
	 * @param paginationOption
	 */
	@Get()
	@ApiBearerAuth()
	@UseGuards(AuthGuard())
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "List deal by Admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listDealForAdmin(
		@Query() paginationOption: ListDealDto,
		@SiteUrl() siteUrl: string
	) {
		return await this.dealService.listDealForAdmin(paginationOption, siteUrl);
	}

	@Get("/:module_id")
	@ApiOperation({ summary: "list deal for user " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listForuser(
		@Param("module_id") id: number,
		@SiteUrl() siteUrl: string
	) {
		return await this.dealService.listDealForUser(id, siteUrl);
	}

	@Get("get-deal/:id")
	@ApiOperation({ summary: "get deal " })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getDeal(
		@Param("id") id: number,
		@SiteUrl() siteUrl: string
	) {
		return await this.dealService.getDeal(id, siteUrl);
	}
}
