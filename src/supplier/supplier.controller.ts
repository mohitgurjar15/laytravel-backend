
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
} from "@nestjs/common";
import { RolesGuard } from "src/guards/role.guard";
import { AuthGuard } from "@nestjs/passport";
import {
	ApiBearerAuth,
	ApiTags,
	ApiOperation,
	ApiResponse,
} from "@nestjs/swagger";
import { Roles } from "src/guards/role.decorator";
import { GetUser } from "src/auth/get-user.dacorator";
import { SaveUserDto } from "src/user/dto/save-user.dto";
import { User } from "@sentry/node";
import { Role } from "src/enum/role.enum";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { ListUserDto } from "src/user/dto/list-user.dto";
import { SupplierService } from './supplier.service';
import { SaveSupplierDto } from "./dto/save-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { ListSupplierDto } from "./dto/list-supplier.dto";

@Controller('supplier-user')
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
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
	@ApiOperation({ summary: "Add new supplier user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async createUser(@Body() saveSupplierDto: SaveSupplierDto, @GetUser() user: User) {
		return await this.supplierService.createSupplier(saveSupplierDto);
	}
    /**
     * Update supplier 
     * @param updateUserDto 
     * @param user_id 
     */
	@Put("/:id")
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
	@ApiOperation({ summary: "Update supplier" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async updateUser(
		@Body(ValidationPipe) updateSupplierDto: UpdateSupplierDto,
		@Param("id") user_id: string
	) {
		return await this.supplierService.updateSupplier(updateSupplierDto, user_id);
	}

	/**
	 * delete supplier
	 * @param user_id
	 */
	@Delete(":id")
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
	@ApiOperation({ summary: "Delete supplier" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async deleteUser(@Param("id") user_id: string) {
		return await this.supplierService.deleteSupplier(user_id);
	}
	/**
	 * supplier List
	 * @param paginationOption 
	 */
	@Get()
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)
    @ApiOperation({ summary: "List supplier" })
    @ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 403, description: "You are not allowed to access this resource." })
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
    async listAdmin(
        @Query() paginationOption: ListSupplierDto,
    ): Promise<{data:User[], TotalReseult:number}> {
        return await this.supplierService.listSupplier(paginationOption);
    }

}
