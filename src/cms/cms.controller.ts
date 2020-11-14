import { Controller, UseGuards,  Body, Get, Param, Put } from '@nestjs/common';
import { Roles } from 'src/guards/role.decorator';
import { Role } from 'src/enum/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/role.guard';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateCmsDto } from './dto/update-cms.dto';
import { CmsService } from './cms.service';
import { Cms } from 'src/entity/cms.entity';
import { GetUser } from 'src/auth/get-user.dacorator';
import { User } from 'src/entity/user.entity';

@ApiTags("CMS Page")
@Controller('cms')
@ApiBearerAuth()
export class CmsController {

    constructor(private cmsService:CmsService){}

    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@UseGuards(AuthGuard(),RolesGuard)
	@ApiOperation({ summary: "List cms page by super admin and admin"})
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 404, description: 'Not found' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Get()
	async listCms(
	):Promise<Cms[]>{
	     return await this.cmsService.listCmsPage()
    }

    
	@ApiOperation({ summary: "Get cms page details"})
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 404, description: 'Not found' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Get('/:page_type')
	async cmsPageDetails(
        @Param('page_type') page_type:string
	):Promise<Cms>{
	   return await this.cmsService.cmsPageDetails(page_type)
    }

    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@UseGuards(AuthGuard(),RolesGuard)
	@ApiOperation({ summary: "Update cms page by super admin and admin"})
	@ApiResponse({ status: 200, description: 'Api success' })
	@ApiResponse({ status: 422, description: 'Bad Request or API error message' })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Put()
	async updateCms(
		@Body() updateCmsDto: UpdateCmsDto,
		@GetUser() user:User
	):Promise<Cms>{
	    return await this.cmsService.updateCmsPage(updateCmsDto,user)
    }
    
}
