import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { RewordPointService } from './reword-point.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/guards/role.decorator';
import { Role } from 'src/enum/role.enum';
import { LayCreditEarn } from 'src/entity/lay-credit-earn.entity';
import { ListEarnRewordDto } from './dto/list-earn-reword.dto';
import { ListRedeemRewordDto } from './dto/list-redeem-reword.dto';
import { LayCreditRedeem } from 'src/entity/lay-credit-redeem.entity';
import { User } from 'src/entity/user.entity';
import { GetUser } from 'src/auth/get-user.dacorator';

@ApiTags("Laytrip Reword Point")
@ApiBearerAuth()
@Controller('reword-point')
export class RewordPointController {

    constructor(private RewordPointService:RewordPointService) {}

	@Get('earned/:id')
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)	
	@ApiOperation({ summary: "List All Earned Laytrip Point" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Rewords Are Not Available." })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listEarnReword(
        @Param("id") id: string,
        @Query() paginationOption: ListEarnRewordDto
	): Promise<{ data: LayCreditEarn[] ,TotalResult: number}> {
		return await this.RewordPointService.listEarnReword(paginationOption,id);
    }
	
	
	@Get('redeemed/:id')
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)	
	@ApiOperation({ summary: "List All Redeemed Laytrip Points" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Rewords Are Not Available." })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listRedeemReword(
        @Param("id") id: string,
        @Query() paginationOption: ListRedeemRewordDto
	): Promise<{ data: LayCreditRedeem[] ,TotalResult: number}> {
		return await this.RewordPointService.listRedeemReword(paginationOption,id);
	}
	

	@Get('total-available-points')
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)	
	@ApiOperation({ summary: "Get total available Laytrip Points" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Rewords Are Not Available." })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async countOfRewordPoints(
        @GetUser() user: User,
	): Promise<{ Total_available_points : number }> {
		return await this.RewordPointService.countOfRewordPoints(user);
    }
    

}
