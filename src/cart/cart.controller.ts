import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser, LogInUser } from 'src/auth/get-user.dacorator';
import { User } from 'src/entity/user.entity';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/guards/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { CartService } from './cart.service';
import { AddInCartDto } from './dto/add-in-cart.dto';
import { CartBookDto } from './dto/book-cart.dto';
import { cartInstallmentsDto } from './dto/cart-installment-detil.dto';
import { DeleteCartDto } from './dto/delete-cart.dto';
import { ListCartDto } from './dto/list-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@ApiTags("Cart")

@Controller('cart')
export class CartController {
    constructor(private cartService: CartService) { }

    
    @Post('add')
    @ApiBearerAuth()
    @ApiOperation({ summary: "add item in cart" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example: 'USD'
    })
    @ApiHeader({
        name: 'language',
        description: 'Enter language code(ex. en)',
    })
    async addInCart(
        @Body() addInCartDto: AddInCartDto,
        @LogInUser() user,
        @Req() req,
    ) {
        return await this.cartService.addInCart(addInCartDto, user, req.headers);
    }

    @Put('update')
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.FREE_USER, Role.PAID_USER)
    @ApiOperation({ summary: "update cart" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async updateCart(
        @Body() updateCart: UpdateCartDto,
        @GetUser() user: User,
        @Req() req,
    ) {
        return await this.cartService.updateCart(updateCart, user);
    }


    @Get('list')
    @ApiBearerAuth()
    @ApiOperation({ summary: "list item in cart of user" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example: 'USD'
    })
    @ApiHeader({
        name: 'language',
        description: 'Enter language code(ex. en)',
    })
    async listCart(
        @LogInUser() user, @Req() req,
        @Query() dto: ListCartDto
    ) {
        console.log('user');
        
        console.log(user);
        
        return await this.cartService.listCart(dto, user, req.headers);
    }

    @Delete('delete/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: "Delete item in cart of user" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async deleteFromCart(
        @LogInUser() user,
        @Param("id") id: number,
        @Body() deleteCartDto:DeleteCartDto
    ) {
        return await this.cartService.deleteFromCart(id, user,deleteCartDto);
    }

    @Post('book')
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.FREE_USER, Role.PAID_USER)
    @ApiOperation({ summary: "book item from cart" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    @ApiHeader({
        name: 'currency',
        description: 'Enter currency code(ex. USD)',
        example: 'USD'
    })
    @ApiHeader({
        name: 'language',
        description: 'Enter language code(ex. en)',
    })
    async bookCart(
        @Body() bookCartDto: CartBookDto,
        @GetUser() user: User,
        @Req() req,
    ) {
        return await this.cartService.bookCart(bookCartDto, user, req.headers);
    }

    @Get('installment-detail')
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
    @ApiOperation({ summary: "installment detail of specific cart " })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async cartDetail(
        @Query() dto: cartInstallmentsDto,
        @GetUser() user: User,
    ) {
        return await this.cartService.cartInstallmentDetail(dto, user);
    }

    @Delete('empty-cart')
    @ApiBearerAuth()
    @ApiOperation({ summary: "empty cart " })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    async emptyCart(
        @LogInUser() user,
        @Body() deleteCartDto:DeleteCartDto
    ) {
        return await this.cartService.emptyCart(deleteCartDto,user);
    }

    @Patch('map-guest-user/:guest_user_id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard(), RolesGuard)
    @Roles(Role.FREE_USER, Role.PAID_USER)
    @ApiOperation({ summary: "Map guest user id to existing user" })
    @ApiResponse({ status: 200, description: 'Api success' })
    @ApiResponse({ status: 422, description: 'Bad Request or API error message' })
    @ApiResponse({ status: 500, description: "Internal server error!" })
    @HttpCode(200)
    async mapGuestUserId(
        @GetUser() user: User,
        @Param('guest_user_id') guestUserId : string
    ) {
        return await this.cartService.mapGuestUser(guestUserId, user);
    }

}
