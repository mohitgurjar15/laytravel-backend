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
import { SaveUserDto } from "src/user/dto/save-user.dto";
import { User } from "@sentry/node";
import { Role } from "src/enum/role.enum";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { ListUserDto } from "src/user/dto/list-user.dto";
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
		@Req() req
	) {
		if (req.fileValidationError) {
			throw new BadRequestException(`${req.fileValidationError}`);
		}
		const adminId = user.userId;
		return await this.supplierService.createSupplier(
			saveSupplierDto,
			files,
			adminId
		);
	}
	/**
	 * Update supplier
	 * @param updateUserDto
	 * @param user_id
	 */
	@Put("/:id")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiConsumes("multipart/form-data")
	@ApiOperation({ summary: "Update supplier" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "User not found!" })
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
			adminId
		);
	}

	/**
	 * delete supplier
	 * @param user_id
	 */
	@Delete(":id")
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "Delete supplier" })
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
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "List supplier" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "User not found!" })
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

	/**
	 * export supplier
	 */
	@Get("export")
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
	async exportSupplier(@GetUser() user: User): Promise<{ data: User[] }> {
		const adminId = user.userId;
		return await this.supplierService.exportSupplier(adminId);
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
