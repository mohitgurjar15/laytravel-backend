import { Controller, Get, Param, Post, Put, Patch, Delete, UseGuards, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/guards/role.decorator';
import { Role } from 'src/enum/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/role.guard';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { ListCurrencyDto } from './dto/list-currency.dto';
import { SiteUrl } from 'src/decorator/site-url.decorator';
import { Currency } from 'src/entity/currency.entity';
import { CurrencyService } from './currency.service';
import { GetUser } from 'src/auth/get-user.dacorator';
import { User } from '@sentry/node';
import { CurrencytStatusPipe } from './pipes/currency-status.pipes';
import { CurrencyEnableDisableDto } from './dto/currency-EnableDisable.dto';

@Controller('currency')
@ApiTags('Currency')
@ApiBearerAuth()
export class CurrencyController {
    constructor(private currencyService: CurrencyService) {}
    	/**
	 *
	 * @param paginationOption
	 */
	@Get()
	@Roles(Role.SUPER_ADMIN, Role.ADMIN)
	@ApiOperation({ summary: "List currency by admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "currency not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async listAdmin(
		@Query() paginationOption: ListCurrencyDto
	): Promise<{ data: Currency[]; TotalReseult: number }> {
		return await this.currencyService.listCurrency(paginationOption);
	}

    @Get("/:id")
	@ApiOperation({ summary: "get a detail of currency" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "User not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getLangunage(@Param("id") id: number): Promise<Currency> {
		return await this.currencyService.CurrencyDetail(id);
	}

    // @Roles(Role.SUPER_ADMIN)
    // @UseGuards(AuthGuard(),RolesGuard)
    // @ApiOperation({ summary: "Save new currency by super admin"})
    // @ApiResponse({ status: 200, description: 'Api success' })
    // @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    // @ApiResponse({ status: 500, description: "Internal server error!" })
    // @Post()
    // async saveCurrency(
    //     @Body() createCurrencyDto:CreateCurrencyDto,@GetUser() user: User
    // ){
	// 	const adminId = user.userId;
	// 	return await this.currencyService.CurrencyInsert(createCurrencyDto,adminId);
	
    // }

    @Roles(Role.SUPER_ADMIN)
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "Update Currency rate by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Put("/:id")
	async updateCurrency(
		@Param("id") id: number,

		@Body() updateCurrencyDto: UpdateCurrencyDto,
		@GetUser() user: User
	):Promise<{ message : string}> {
        const adminId = user.userId;
		return await this.currencyService.CurrencyUpdate(id, updateCurrencyDto,adminId);
	}

    // @Roles(Role.SUPER_ADMIN)
    // @UseGuards(AuthGuard(),RolesGuard)
    // @ApiOperation({ summary: "Change status by super admin"})
    // @ApiResponse({ status: 200, description: 'Api success' })
    // @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    // @ApiResponse({ status: 404, description: 'Not Found' })
    // @ApiResponse({ status: 500, description: "Internal server error!" })
    // @Patch('/:id')
    // changeStatus(
    //     @Param('id') id:number,
    //     @Body() currencyStatusDto:CurrencyStatusDto 
    // ){
    //     return "API is pending";
    // }

    @Roles(Role.SUPER_ADMIN)
	@UseGuards(AuthGuard(), RolesGuard)
	@ApiOperation({ summary: "Delete Currency by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Delete("/:id")
	async deleteCurrency(@Param("id") id: number,@GetUser() user: User):Promise<{ message : string}> {
		const adminId = user.userId;
		return await this.currencyService.CurrencyDelete(id,adminId);
	}

	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN)
	@ApiOperation({ summary: "Enable-Disable currency by super admin" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({ status: 404, description: "Not Found" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	@Patch("enable-disable/:id")
	async changeCurrencyStatus(
		@Param("id") id: number,
		@Body(CurrencytStatusPipe) CurrencyEnableDisableDto:CurrencyEnableDisableDto,
		@GetUser() user: User
	):Promise<{ message : string}> {
		return await this.currencyService.changeCurrencyStatus(id, CurrencyEnableDisableDto,user);
	}

}
