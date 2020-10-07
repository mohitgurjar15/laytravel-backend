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

@ApiTags("Laytrip Point")
@ApiBearerAuth()
@Controller('laytrip-point')
export class RewordPointController {

    constructor(private RewordPointService:RewordPointService) {}

	@Get('earned/:id')
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)	
	@ApiOperation({ summary: "List all earned laytrip point of user by admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Rewords Are Not Available." })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listEarnRewordByAdmin(
        @Param("id") id: string,
        @Query() paginationOption: ListEarnRewordDto
	): Promise<{ data: LayCreditEarn[] ,TotalResult: number}> {
		return await this.RewordPointService.listEarnReword(paginationOption,id);
	}
	
	@Get('earned')
	@UseGuards(AuthGuard())
	@ApiOperation({ summary: "list all earned laytrip point by user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Rewords Are Not Available." })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listEarnReword(
		@Query() paginationOption: ListEarnRewordDto,
		@GetUser() user: User,
	): Promise<{ data: LayCreditEarn[] ,TotalResult: number}> {
		const id =user.userId
		return await this.RewordPointService.listEarnReword(paginationOption,id);
    }
	
	
	@Get('redeemed/:id')
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)	
	@ApiOperation({ summary: "List all redeemed laytrip points of user by admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Rewords Are Not Available." })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listRedeemRewordByAdmin(
        @Param("id") id: string,
        @Query() paginationOption: ListRedeemRewordDto
	): Promise<{ data: LayCreditRedeem[] ,TotalResult: number}> {
		return await this.RewordPointService.listRedeemReword(paginationOption,id);
	}

	@Get('redeemed')
	@UseGuards(AuthGuard())	
	@ApiOperation({ summary: "List all redeemed laytrip points by user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Rewords Are Not Available." })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listRedeemReword(
		@Query() paginationOption: ListRedeemRewordDto,
		@GetUser() user: User,
	): Promise<{ data: LayCreditRedeem[] ,TotalResult: number}> {
		return await this.RewordPointService.listRedeemReword(paginationOption,user.userId);
	}
	

	@Get('total-available-points/:id')
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN,Role.ADMIN)	
	@ApiOperation({ summary: "Get total available Laytrip Points of user by admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Rewords Are Not Available." })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async countOfRewordPointsbyAdmin(
        @Param("id") id: string,
	): Promise<{ total_available_points : number }> {
		return await this.RewordPointService.countOfRewordPoints(id);
	}
	
	@Get('total-available-points')
	@UseGuards(AuthGuard())	
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
	): Promise<{ total_available_points : number }> {
		return await this.RewordPointService.countOfRewordPoints(user.userId);
    }
    

}
