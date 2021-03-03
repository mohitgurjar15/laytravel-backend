import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.dacorator';
import { User } from 'src/entity/user.entity';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { CreateLaytripCategoryDto } from './dto/add-category.dto';
import { LaytripCategoryService } from './laytrip-category.service';

@ApiTags("Laytrip category")
@ApiBearerAuth()
@UseGuards(AuthGuard(), RolesGuard)
@Controller('laytrip-category')
export class LaytripCategoryController {
    constructor(private laytripCategoryService: LaytripCategoryService) {}

    @Post()
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Add category for laytrip flight routes" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async addCategory(@Body() dto : CreateLaytripCategoryDto ,@GetUser() user: User) {
		return await this.laytripCategoryService.addLaytripCategory(dto , user);
	}

}
