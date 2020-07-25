import { Controller, Get, UseGuards, Delete, Param, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ModulesService } from './modules.service';
import { Module } from 'src/entity/module.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/role.guard';
import { Role } from "src/enum/role.enum";
import { Roles } from 'src/guards/role.decorator';
import { GetUser } from 'src/auth/get-user.dacorator';
import { User } from '@sentry/node';
import { moduleStatusPipe } from './pipes/module-status.pipes';
import { moduleStatusDto } from './dto/moduleEnableDisable.dto';


@ApiTags("Modules")
@ApiBearerAuth()
@Controller('modules')
export class ModulesController {

    constructor(private modulesService:ModulesService) {}

    @Get()
	@ApiOperation({ summary: "List language" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "modules not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listLanguge(
	): Promise<{ data: Module[];}> {
		return await this.modulesService.listmodule();
    }
    


    @UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)	
	@ApiOperation({ summary: "Enable/Disable module by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Patch("/:id")
	async moduleChangeStatus(@Param("id") id: number,@GetUser() user: User,@Body(moduleStatusPipe) moduleStatusDto:moduleStatusDto):Promise<{ message : string}> {
		
		return await this.modulesService.moduleChangeStatus(id,moduleStatusDto,user);
	}
}
