import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser, LogInUser } from 'src/auth/get-user.dacorator';
import { GetReferralId } from 'src/decorator/referral.decorator';
import { User } from 'src/entity/user.entity';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { CartService } from './cart.service';
import { AddInCartDto } from './dto/add-in-cart.dto';
import { CartBookDto } from './dto/book-cart.dto';
import { cartInstallmentsDto } from './dto/cart-installment-detil.dto';
import { ListCartDto } from './dto/list-cart.dto';
import { MultipleInventryDeleteFromCartDto } from './dto/multiple-inventry-delete.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@ApiTags("Cart")
@ApiHeader({
    name: "referral_id",
    description: "landing page id",
    example: "",
})
@Controller("cart")
export class CartController {
    constructor(private cartService: CartService) { }

    @Post("add")
    @ApiBearerAuth()
    @ApiOperation({ summary: "add item in cart" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    @ApiHeader({
        name: "currency",
        description: "Enter currency code(ex. USD)",
        example: "USD",
    })
    @ApiHeader({
        name: "language",
        description: "Enter language code(ex. en)",
    })
    async addInCart(
        @Body() addInCartDto: AddInCartDto,
        @LogInUser() user,
        @Req() req,
        @GetReferralId() referralId: string
    ) {
        return await this.cartService.addInCart(
            addInCartDto,
            user,
            req.headers,
            referralId
        );
    }

    @Put("update")
    @ApiBearerAuth()
    @ApiOperation({ summary: "update cart" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async updateCart(
        @Body() updateCart: UpdateCartDto,
        @LogInUser() user,
        @Req() req
    ) {
        return await this.cartService.updateCart(updateCart, user);
    }

    @Get("list")
    @ApiBearerAuth()
    @ApiOperation({ summary: "list item in cart of user" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @ApiHeader({
        name: "currency",
        description: "Enter currency code(ex. USD)",
        example: "USD",
    })
    @ApiHeader({
        name: "language",
        description: "Enter language code(ex. en)",
    })
    async listCart(@LogInUser() user, @Req() req, @Query() dto: ListCartDto, @GetReferralId() referralId: string) {
        console.log("user");

        console.log(user);

        return await this.cartService.listCart(dto, user, req.headers, referralId);
    }

    @Delete("delete/:id")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Delete item in cart of user" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async deleteFromCart(@LogInUser() user, @Param("id") id: number) {
        return await this.cartService.deleteFromCart(id, user);
    }

    @Delete("delete-conflicted-cart-item")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Delete multiple item in cart of user" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async multipleDeleteFromCart(@LogInUser() user, @Body() dto: MultipleInventryDeleteFromCartDto) {
        return await this.cartService.multipleInventryDeleteFromCart(dto, user);
    }

    @Post("book")
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.FREE_USER, Role.PAID_USER)
    @ApiOperation({ summary: "book item from cart" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    @ApiHeader({
        name: "currency",
        description: "Enter currency code(ex. USD)",
        example: "USD",
    })
    @ApiHeader({
        name: "language",
        description: "Enter language code(ex. en)",
    })
    async bookCart(
        @Body() bookCartDto: CartBookDto,
        @GetUser() user: User,
        @Req() req, @GetReferralId() referralId: string
    ) {
        return await this.cartService.bookCart(bookCartDto, user, req.headers, referralId);
    }

    @Get("installment-detail")
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiOperation({ summary: "installment detail of specific cart " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async cartDetail(@Query() dto: cartInstallmentsDto, @GetUser() user: User) {
        return await this.cartService.cartInstallmentDetail(dto, user);
    }

    @Delete("empty-cart")
    @ApiBearerAuth()
    @ApiOperation({ summary: "empty cart " })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async emptyCart(@LogInUser() user) {
        return await this.cartService.emptyCart(user);
    }

    @Patch("map-guest-user/:guest_user_id")
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.FREE_USER, Role.PAID_USER)
    @ApiOperation({ summary: "Map guest user id to existing user" })
    @ApiResponse({ status: 200, description: "Api success" })
    @ApiResponse({
        status: 422,
        description: "Bad Request or API error message",
    })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async mapGuestUserId(
        @GetUser() user: User,
        @Param("guest_user_id") guestUserId: string
    ) {
        return await this.cartService.mapGuestUser(guestUserId, user);
    }


    // @Get("test/settale-installment/:cartId/:instalment_type/:smallestDate/:selected_down_payment")
    // @ApiOperation({ summary: "installment detail of specific cart " })
    // @ApiResponse({ status: 200, description: "Api success" })
    // @ApiResponse({
    //     status: 422,
    //     description: "Bad Request or API error message",
    // })
    // @ApiResponse({ status: 500, description: "Internal server error!" })
    // async settleInstallment(@Param('cartId') cartId: string, @Param('instalment_type') instalment_type: string, @Param('smallestDate') smallestDate: string, @Param('selected_down_payment') selected_down_payment: string) {
    //     //return await this.cartService.sattelInstalment(cartId, instalment_type, smallestDate, selected_down_payment);
    //     return await this.cartService.calculatePartialAmountAndSattelAmount(cartId, instalment_type);
    // }

    // @Put("/test/refaund/:booking_id")
    // @ApiOperation({ summary: "test-refaund api" })
    // @ApiResponse({ status: 200, description: "Api success" })
    // @ApiResponse({
    //     status: 422,
    //     description: "Bad Request or API error message",
    // })
    // @ApiResponse({ status: 500, description: "Internal server error!" })
    // @HttpCode(200)
    // @ApiHeader({
    //     name: "currency",
    //     description: "Enter currency code(ex. USD)",
    //     example: "USD",
    // })
    // @ApiHeader({
    //     name: "language",
    //     description: "Enter language code(ex. en)",
    // })
    // async testRefaund(@Param("booking_id") booking_id: string, @Req() req) {
    //     return await this.cartService.testRefaund(
    //         booking_id,
    //         req.headers
    //     );
    // }
}
