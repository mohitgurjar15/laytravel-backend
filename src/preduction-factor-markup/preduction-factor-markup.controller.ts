import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.dacorator';
import { PreductionFactorMarkup } from 'src/entity/preduction-factor-markup.entity';
import { User } from 'src/entity/user.entity';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { UpdatePreductionMarkupDto } from './dto/update-preduction-markup.dto';
import { PreductionFactorMarkupService } from './preduction-factor-markup.service';

@Controller('preduction-factor-markup')
@ApiTags("Preduction Factor Markup")
@ApiBearerAuth()

export class PreductionFactorMarkupController {

    constructor(private preductionFactorMarkupService:PreductionFactorMarkupService) {}

    @UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Update Preduction Markup by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Put()
	async changeMarkupStatus(
		@Body() updatePreductionMarkupDto: UpdatePreductionMarkupDto,
		@GetUser() user: User
	): Promise<{ message: string }> {
		return await this.preductionFactorMarkupService.updatePreductionMarkup(updatePreductionMarkupDto, user);
    }
    
    @Get()
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "List preduction markups" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Markup not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listMarkup(): Promise<{ data: any }> {
		return await this.preductionFactorMarkupService.listFactorMarkup();
	}
}
