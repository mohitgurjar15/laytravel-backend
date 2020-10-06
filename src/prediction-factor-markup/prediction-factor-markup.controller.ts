import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.dacorator';
import { PredictionFactorMarkup } from 'src/entity/prediction-factor-markup.entity';
import { User } from 'src/entity/user.entity';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { UpdatePredictionMarkupDto } from './dto/update-prediction-markup.dto';
import { PredictionFactorMarkupService } from './prediction-factor-markup.service';

@Controller('prediction-factor-markup')
@ApiTags("prediction Factor Markup")
@ApiBearerAuth()

export class PredictionFactorMarkupController {

    constructor(private predictionFactorMarkupService:PredictionFactorMarkupService) {}

    @UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Update prediction Markup by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Put()
	async changeMarkupStatus(
		@Body() updatepredictionMarkupDto: UpdatePredictionMarkupDto,
		@GetUser() user: User
	): Promise<{ message: string }> {
		return await this.predictionFactorMarkupService.updatepredictionMarkup(updatepredictionMarkupDto, user);
    }
    
    @Get()
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "List prediction markups" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Markup not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listMarkup(): Promise<{ data: any }> {
		return await this.predictionFactorMarkupService.listFactorMarkup();
	}
}
