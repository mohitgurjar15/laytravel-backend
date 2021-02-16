import { Controller, UseGuards, Post, HttpCode, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/role.guard';
import { TravelerService } from './traveler.service';
import { SaveTravelerDto } from './dto/save-traveler.dto';
import { User } from 'src/entity/user.entity';
import { GetUser, LogInUser } from 'src/auth/get-user.dacorator';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/guards/role.decorator';
import { UpdateTravelerDto } from './dto/update-traveler.dto';
import { MultipleTravelersDto } from './dto/multiple-add-traveler.dto';

@ApiTags("Travelers")
@ApiBearerAuth()
@Controller('traveler')
export class TravelerController {
	constructor(private travelerService: TravelerService) { }


	@Post('save')
	@ApiOperation({ summary: "Create new traveler by primary user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Traveler not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async createTraveler(
		@Body() saveTravelerDto: SaveTravelerDto,
		@LogInUser() user,
	) {
		return await this.travelerService.createNewtraveller(saveTravelerDto, user.user_id, saveTravelerDto.guest_id);
	}

	@Post('add/multiple-traveler')
	@ApiOperation({ summary: "Create multiple traveler by primary user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Traveler not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async multipleTraveler(
		@Body() multipleTravelersDto: MultipleTravelersDto,
		@LogInUser() user) {
		console.log('multiple traveler');
		const parent_user_id = user.user_id;
		return await this.travelerService.multipleTravelerAdd(multipleTravelersDto, parent_user_id);
	}

	@Get('get-traveler/:id')
	@UseGuards(AuthGuard())
	@ApiOperation({ summary: "Get traveler detail from the traveler id" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Traveler not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getTraveler(
		@Param("id") userId: string,
	): Promise<User> {
		return await this.travelerService.getTraveler(userId);
	}


	@Get('list-traveler')
	@UseGuards(AuthGuard())
	@ApiOperation({ summary: "List all traveler of the user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Traveler not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listTraveler(
		@GetUser() user: User,
	) {
		return await this.travelerService.listTraveler(user.userId);
	}

	@UseGuards(RolesGuard)
	@UseGuards(AuthGuard())
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@Get('list-traveler/:id')
	@ApiOperation({ summary: "List all traveler from the user id by admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Traveler not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listtraverUsingUserId(
		@Param("id") userId: string,
	) {
		return await this.travelerService.listTraveler(userId);
	}



	@Put('/:id')
	@UseGuards(AuthGuard())
	@ApiOperation({ summary: "update traveler detail using traveler id" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Traveler not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async updateTraveler(
		@Param("id") userId: string,
		@Body() updateTravelerDto: UpdateTravelerDto,
		@LogInUser() user,
	): Promise<User> {
		return await this.travelerService.updateTraveler(updateTravelerDto, userId, user.user_id, updateTravelerDto.guest_id);
	}


	@Delete('/:id')
	@UseGuards(AuthGuard())
	@ApiOperation({ summary: "Delete traveler" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Traveler not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async DeleteTraveler(
		@Param("id") userId: string,
		@GetUser() user: User,
	): Promise<{ message: string }> {
		return await this.travelerService.deleteTraveler(userId, user.userId);
	}
}
