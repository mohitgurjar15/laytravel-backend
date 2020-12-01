import { Body, Controller,  HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { AppVersionService } from './app-version.service';
import { AddVersionDto } from './dto/add-version.dto';
import { CheckForceUpdateDto } from './dto/check-force-update.dto';

@Controller('app-version')
@ApiTags("App Version")
export class AppVersionController {
    constructor(private appVersionService: AppVersionService) { }

    @Post('force-update')
    @ApiOperation({
        summary: "check app version for force update",
    })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 422, description: "Bad Request or API error message" })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async checkForceUpdate(
        @Body() checkForceUpdateDto: CheckForceUpdateDto
    ) {
        return await this.appVersionService.checkForceUpdate(checkForceUpdateDto);
    }


    @Post('add-new-version')
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @ApiOperation({
        summary: "Add new version detail",
    })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({ status: 422, description: "Bad Request or API error message" })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async addNewVersion(
        @Body() addVersionDto: AddVersionDto
    ) {
        return await this.appVersionService.addVersion(addVersionDto);
    }
}
