import { Controller, UseGuards, Post, HttpCode, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/role.guard';
import { TravelerService } from './traveler.service';
import { SaveTravelerDto } from './dto/save-traveler.dto';
import { User } from 'src/entity/user.entity';
import { GetUser } from 'src/auth/get-user.dacorator';

@ApiTags("Travelers")
@ApiBearerAuth()
@UseGuards(AuthGuard(), RolesGuard)
@Controller('traveler')
export class TravelerController {
    constructor(private travelerService: TravelerService) {}


    @Post()
	@ApiConsumes("multipart/form-data")
	@ApiOperation({ summary: "Create new traveler by primary user" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Admin not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@HttpCode(200)
	async createTraveler(
		@Body() saveTravelerDto: SaveTravelerDto,
		@GetUser() user: User,
	) {
		const createdBy = user.userId;
		return await this.travelerService.createNewtraveller(saveTravelerDto, createdBy);
	}
}
