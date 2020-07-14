import { Controller, Get, Param, Post, Put, Patch, Delete, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/guards/role.decorator';
import { Role } from 'src/enum/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/role.guard';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CurrencyStatusDto } from './dto/currency-status.dto';

@Controller('currency')
@ApiTags('Currency')
@ApiBearerAuth()
export class CurrencyController {

    @ApiOperation({ summary: "List all currency"})
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @Get()
    listCurrency(){

        return "API is pending";
    }

    @ApiOperation({ summary: "Get currency details"})
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Get('/:id')
    getCurrency(
        @Param('id') id:number
    ){
        return "API is pending";
    }

    @Roles(Role.SUPER_ADMIN)
    @UseGuards(AuthGuard(),RolesGuard)
    @ApiOperation({ summary: "Save new currency by super admin"})
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Post()
    saveCurrency(
        @Body() createCurrencyDto:CreateCurrencyDto
    ){
        return "API is pending";
    }

    @Roles(Role.SUPER_ADMIN)
    @UseGuards(AuthGuard(),RolesGuard)
    @ApiOperation({ summary: "Update currency by super admin"})
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @Put('/:id')
    updateCurrency(
        @Param('id') id:number,
        @Body() updateCurrencyDto:UpdateCurrencyDto
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
        @Body() currencyStatusDto:CurrencyStatusDto 
    ){
        return "API is pending";
    }

    @Roles(Role.SUPER_ADMIN)
    @UseGuards(AuthGuard(),RolesGuard)
    @ApiOperation({ summary: "Delete currency by super admin"})
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
