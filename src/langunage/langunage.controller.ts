import { Controller, Get, Param, UseGuards, Post, Put, Body, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/guards/role.decorator';
import { Role } from 'src/enum/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/role.guard';
import { CreateLangunageDto } from './dto/create-langunage.dto';
import { LangunageStatusDto } from './dto/langunage-status.dto';

@ApiTags('Langunage')
@ApiBearerAuth()
@Controller('langunage')
export class LangunageController {
    @ApiOperation({ summary: "List all langunage"})
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @Get()
    listLangunage(){

        return "API is pending";
    }

    @ApiOperation({ summary: "Get langunage details"})
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Get('/:id')
    getLangunage(
        @Param('id') id:number
    ){
        return "API is pending";
    }

    @Roles(Role.SUPER_ADMIN)
    @UseGuards(AuthGuard(),RolesGuard)
    @ApiOperation({ summary: "Save new langunage by super admin"})
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Post()
    saveCurrency(
        @Body() createLangunageDto:CreateLangunageDto
    ){
        return "API is pending";
    }

    @Roles(Role.SUPER_ADMIN)
    @UseGuards(AuthGuard(),RolesGuard)
    @ApiOperation({ summary: "Update langunage by super admin"})
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Put('/:id')
    updateCurrency(
        @Param('id') id:number,
        @Body() updateLangunageDto:CreateLangunageDto
    ){
        return "API is pending";
    }

    @Roles(Role.SUPER_ADMIN)
    @UseGuards(AuthGuard(),RolesGuard)
    @ApiOperation({ summary: "Change status by super admin"})
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Patch('/:id')
    changeStatus(
        @Param('id') id:number,
        @Body() langunageStatusDto:LangunageStatusDto 
    ){
        return "API is pending";
    }

    @Roles(Role.SUPER_ADMIN)
    @UseGuards(AuthGuard(),RolesGuard)
    @ApiOperation({ summary: "Delete langunage by super admin"})
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Delete('/:id')
    deleteCurrency(
        @Param('id') id:number
    ){
        return "API is pending";
    }
}
