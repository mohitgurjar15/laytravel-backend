import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { Role } from "src/enum/role.enum";
import { Roles } from "src/guards/role.decorator";
import { RolesGuard } from "src/guards/role.guard";
import { FlightRouteService } from "./flight-route.service";
import { ListFlightRouteDto } from "./dto/list-flight-route.dto";
import { AddFlightRouteDto } from "./dto/add-flight-route.dto";
import { diskStorage } from "multer";
import { User } from "src/entity/user.entity";
import { GetUser } from "src/auth/get-user.dacorator";
import { UpdateFlightRouteDto } from "./dto/update-flight-route.dto";
import { EnableDisableFlightRouteDto } from "./dto/enable-disable-route.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ImportRouteDto } from "./dto/import-route.dto";
import { csvFileDto } from "src/user/dto/csv-file.dto";
import { SiteUrl } from "src/decorator/site-url.decorator";
import { csvFileFilter, editFileName } from "src/auth/file-validator";
import { ExportFlightRouteDto } from "./dto/export-flight-route.dto";
import { BlacklistedUnblacklistedFlightRouteDto } from "./dto/blacklisted-unblacklisted-route.dto";
import { ListAirportRouteDto } from "./dto/list-airport.dto";
@ApiTags("Flight Route")
@Controller("flight-route")
@ApiBearerAuth()
@UseGuards(AuthGuard(), RolesGuard)
export class FlightRouteController {
    constructor(private flightRouteService: FlightRouteService) {}

    @Get("list-route")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "List all flight route for admin" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async listFlightRoute(@Query() listFlightRouteDto: ListFlightRouteDto) {
        return await this.flightRouteService.listFlightRoutes(
            listFlightRouteDto
        );
    }

    @Get("export-route")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "List all flight route for admin" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async exportFlightRoute(
        @Query() listFlightRouteDto: ExportFlightRouteDto,
        @GetUser() user: User
    ) {
        return await this.flightRouteService.exportFlightRoutes(
            listFlightRouteDto,
            user
        );
    }

    @Get("counts")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "get flight counts " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async flightCounts() {
        return await this.flightRouteService.routesCounts();
    }

    @Post()
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "Add new flight route" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async createNewRoute(
        @Body() addFlightRouteDto: AddFlightRouteDto,
        @GetUser() user: User
    ) {
        return await this.flightRouteService.addFlightRoute(
            addFlightRouteDto,
            user
        );
    }

    @Put(":id")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "update flight route" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async updateRoute(
        @Body() updateFlightRouteDto: UpdateFlightRouteDto,
        @GetUser() user: User,
        @Param("id") id: number
    ) {
        return await this.flightRouteService.updateFlightRoute(
            id,
            updateFlightRouteDto,
            user
        );
    }

    @Patch("active-deactive/:id")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "Flight route active-inactive" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async activeDeactiveRoute(
        @Body() enableDisableFlightRouteDto: EnableDisableFlightRouteDto,
        @GetUser() user: User,
        @Param("id") id: number
    ) {
        return await this.flightRouteService.enableDisableFlightRoute(
            id,
            enableDisableFlightRouteDto,
            user
        );
    }

    @Get("list-Airport")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "List all flight route for admin" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async listAirportRoutes(
        @Query() listAirportRouteDto: ListAirportRouteDto,
        @GetUser() user: User
    ) {
        return await this.flightRouteService.listAirportRoutes(
            listAirportRouteDto
        );
    }

    @Patch("blacklisted-unblacklisted")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "Flight route blacklisted-Unblacklisted" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)

    async blacklistedUnblacklisted(
        @Body() enableDisableFlightRouteDto: BlacklistedUnblacklistedFlightRouteDto,
        @GetUser() user: User,
    ) {
        console.log(enableDisableFlightRouteDto)
        return await this.flightRouteService.blacklistedUnblacklistedFlightRoute(enableDisableFlightRouteDto,user);
    }

    @Get('filter-options/flight-code')
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiOperation({ summary: "list all code of FlightRoute" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "Code not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getFlightCode() {
		return await this.flightRouteService.getFlightCode();
	}

    @Get('filter-options/flight-city')
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiOperation({ summary: "list all city of FlightRoute" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "city not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getFlightCity() {
		return await this.flightRouteService.getFlightCity();
	}

    @Get('filter-options/flight-country')
	@ApiBearerAuth()
	@UseGuards(AuthGuard(), RolesGuard)
	@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
	@ApiOperation({ summary: "list all country of FlightRoute" })
	@ApiResponse({ status: 200, description: "Api success" })
	@ApiResponse({ status: 422, description: "Bad Request or API error message" })
	@ApiResponse({
		status: 403,
		description: "You are not allowed to access this resource.",
	})
	@ApiResponse({ status: 404, description: "country not found!" })
	@ApiResponse({ status: 500, description: "Internal server error!" })
	async getFlightCountry() {
		return await this.flightRouteService.getFlightCountry();
	}

    @Delete(":id")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "Delrtr flight route" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async deleteRoute(@GetUser() user: User, @Param("id") id: number) {
        return await this.flightRouteService.deleteFlightRoute(id, user);
    }

    @Post("report/import")
    @ApiConsumes("multipart/form-data")
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiOperation({ summary: "import flight route" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({
        status: 403,
        description: "You are not allowed to access this resource.",
    })
    @ApiResponse({ status: 404, description: "User not found!" })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @UseInterceptors(
        FileFieldsInterceptor([{ name: "file", maxCount: 1 }], {
            storage: diskStorage({
                destination: "./assets/otherfiles",
                filename: editFileName,
            }),
            fileFilter: csvFileFilter,
        })
    )
    @HttpCode(200)
    async importRoute(
        @Body() importUserDto: ImportRouteDto,
        @UploadedFiles() files: csvFileDto,
        @Req() req,
        @GetUser() user: User,
        @SiteUrl() siteUrl: string
    ) {
        if (req.fileValidationError) {
            throw new BadRequestException(`${req.fileValidationError}`);
        }
        if (typeof files.file[0] == "undefined") {
            throw new NotFoundException(`file is not available&&&file`);
        }
        const userId = user.userId;
        const file = files.file;

        return await this.flightRouteService.importFlightRoute(
            importUserDto,
            file,
            userId,
            siteUrl
        );
    }

    @Get("detail/:id")
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @ApiOperation({ summary: "Flight route detail" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async flightRoute(@Param("id") id: number) {
        return await this.flightRouteService.getFlightRoute(id);
    }
}
