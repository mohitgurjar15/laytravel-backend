import {
	Controller,
	UseGuards,
	HttpCode,
	Post,
	Body,
	Put,
	ValidationPipe,
	Param,
	Delete,
	Query,
	Get,
	UseInterceptors,
	UploadedFiles,
	Req,
	BadRequestException,
	NotFoundException,
	Patch,
} from "@nestjs/common";
import { RolesGuard } from "src/guards/role.guard";
import { AuthGuard } from "@nestjs/passport";
import {
	ApiBearerAuth,
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiConsumes,
} from "@nestjs/swagger";
import { Roles } from "src/guards/role.decorator";
import { GetUser } from "src/auth/get-user.dacorator";
import { User } from "@sentry/node";
import { Role } from "src/enum/role.enum";
import { SupplierService } from "./supplier.service";
import { SaveSupplierDto } from "./dto/save-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { ListSupplierDto } from "./dto/list-supplier.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import {
	editFileName,
	imageFileFilter,
	csvFileFilter,
} from "../auth/file-validator";
import { ProfilePicDto } from "../auth/dto/profile-pic.dto";
import { SiteUrl } from "src/decorator/site-url.decorator";
import { ImportUserDto } from "src/user/dto/import-user.dto";
import { csvFileDto } from "src/user/dto/csv-file.dto";
import { ActiveDeactiveDto } from "src/user/dto/active-deactive-user.dto";
import { ExportUserDto } from "src/user/dto/export-user.dto";

@Controller("supplier-user")
@ApiTags("Supplier User")
@ApiBearerAuth()
@UseGuards(AuthGuard(), RolesGuard)
export class SupplierController {
	constructor(private supplierService: SupplierService) {}

	/**
	 * add new supplier
	 * @param saveUserDto
	 * @param user
	 */
	@Post()
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiConsumes("multipart/form-data")
	@ApiOperation({ summary: "Add new supplier user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	@UseInterceptors(
		FileFieldsInterceptor([{ name: "profile_pic", maxCount: 1 }], {
			storage: diskStorage({
				destination: "./assets/profile",
				filename: editFileName,
			}),
			fileFilter: imageFileFilter,
			limits: { fileSize: 2097152 },
		})
	)
	async createUser(
		@Body() saveSupplierDto: SaveSupplierDto,
		@GetUser() user: User,
		@UploadedFiles() files: ProfilePicDto,
		@SiteUrl() siteUrl: string,
		@Req() req
	) {
		if (req.fileValidationError) {
			throw new BadRequestException(`${req.fileValidationError}`);
		}
		const adminId = user.userId;
		return await this.supplierService.createSupplier(
			saveSupplierDto,
			files,
			adminId,
			siteUrl
		);
	}
	/**
	 * Update supplier
	 * @param updateUserDto
	 * @param user_id
	 */
	@Put("/:id")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN,Role.SUPPLIER)
	@ApiConsumes("multipart/form-data")
	@ApiOperation({ summary: "Update supplier" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "supplier User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@UseInterceptors(
		FileFieldsInterceptor([{ name: "profile_pic", maxCount: 1 }], {
			storage: diskStorage({
				destination: "./assets/profile",
				filename: editFileName,
			}),
			fileFilter: imageFileFilter,
			limits: { fileSize: 2097152 },
		})
	)
	async updateUser(
		@Body(ValidationPipe) updateSupplierDto: UpdateSupplierDto,
		@Param("id") user_id: string,
		@GetUser() user: User,
		@UploadedFiles() files: ProfilePicDto,
		@SiteUrl() siteUrl: string,
		@Req() req
	) {
		if (req.fileValidationError) {
			throw new BadRequestException(`${req.fileValidationError}`);
		}
		const adminId = user.userId;
		return await this.supplierService.updateSupplier(
			updateSupplierDto,
			user_id,
			files,
			adminId,
			siteUrl
		);
	}


	@Patch("active-deactive-supplier-user/:id")
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
	@ApiOperation({ summary: "Active-deactive supplier user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "supplier User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async activeUser(@Param("id") user_id: string,@Body() activeDeactiveDto:ActiveDeactiveDto, @GetUser() user: User) {
		const adminId = user.userId;
		return await this.supplierService.activeDeactivesupplier(user_id,activeDeactiveDto,adminId);
	}

	/**
	 * delete supplier
	 * @param user_id
	 */
	@Delete(":id")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Delete supplier user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async deleteUser(@Param("id") user_id: string, @GetUser() user: User) {
		const adminId = user.userId;
		return await this.supplierService.deleteSupplier(user_id, adminId);
	}
	/**
	 * supplier List
	 * @param paginationOption
	 */
	@Get()
	@Roles(Role.SUPER_ADMIN, Role.ADMIN,Role.SUPPLIER)
	@ApiOperation({ summary: "List supplier user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: " supplier user not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listAdmin(
		@Query() paginationOption: ListSupplierDto,
		@SiteUrl() siteUrl: string
	): Promise<{ data: User[]; TotalReseult: number }> {
		return await this.supplierService.listSupplier(paginationOption, siteUrl);
	}

	@Get("report/counts")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "counts Of all Supplier" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "supplier not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getCount(): Promise<{ result: any }> {
		return await this.supplierService.getCounts();
	}


	@Get('report/weekly-register')
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Count of register supplier user in current week" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async weeklyRagisterUser(
	): Promise<any>{
		return await this.supplierService.weeklyRagisterUser();
	}

	@Get("/:id")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Get Supplier user details by  admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "supplier user not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getSupplierData(
		@Param("id") userId: string,
		@SiteUrl() siteUrl: string
	): Promise<User> {
		return await this.supplierService.getSupplierData(userId, siteUrl);
	}
	/**
	 * export supplier
	 */
	@Get("report/export")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "export supplier user by admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async exportSupplier(@Query() paginationOption: ExportUserDto,@GetUser() user: User): Promise<{ data: User[] }> {
		const adminId = user.userId;
		return await this.supplierService.exportSupplier(adminId,paginationOption);
	}

	@Post("report/import")
	@ApiConsumes("multipart/form-data")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "import supplier user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "supplier user not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@UseInterceptors(
		FileFieldsInterceptor([{ name: "file", maxCount: 1 }], {
			storage: diskStorage({
				destination: "./assets/otherfiles",
				filename: editFileName,
			}),
			fileFilter: csvFileFilter,
		})
	)
	@HttpCode(200)
	async importUser(
		@Body() importUserDto: ImportUserDto,
		@UploadedFiles() files: csvFileDto,
		@Req() req,
		@GetUser() user: User,
		@SiteUrl() siteUrl: string
	) {
		if (req.fileValidationError) {
			throw new BadRequestException(`${req.fileValidationError}`);
		}
		if (typeof files.file[0] == "undefined") {
			throw new NotFoundException(`file is not available&&&file`);
		}
		const userId = user.userId;
		const file = files.file;

		return await this.supplierService.importSupplier(
			importUserDto,
			file,
			userId,
			siteUrl
		);
	}
}
