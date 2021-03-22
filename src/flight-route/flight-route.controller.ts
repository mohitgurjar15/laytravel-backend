import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
    ApiBearerAuth,
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
import { User } from "src/entity/user.entity";
import { GetUser } from "src/auth/get-user.dacorator";
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

    @Post("create")
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
        return await this.flightRouteService.addFlightRoute(addFlightRouteDto, user);
    }
}
