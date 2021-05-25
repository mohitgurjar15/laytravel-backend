import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    ValidateIf,
    ValidationArguments,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { errorMessage } from "src/config/common.config";
import { BookingType } from "src/enum/booking-type.enum";
import { BookingStatus } from "src/enum/booking-status.enum";
import { ModulesName } from "src/enum/module.enum";
import { PaymentType } from "src/enum/payment-type.enum";
export class ListBookingDto {
    @IsNotEmpty({
        message: `Please enter limit&&&limit&&&${errorMessage}`,
    })
    @ApiProperty({
        description: "Limit",
        example: 10,
    })
    limit: number;

    @IsNotEmpty({
        message: `Please enter page number&&&page&&&${errorMessage}`,
    })
    @ApiProperty({
        description: "Page number",
        example: 1,
    })
    page_no: number;

    @ApiPropertyOptional({
        description: "search for date",
        example: "",
    })
    start_date: Date;

    @ApiPropertyOptional({
        description: "booking date",
        example: "",
    })
    booking_date: Date;

    @ApiPropertyOptional({
        description: "depature date",
        example: "",
    })
    depature_date: Date;

    @ApiPropertyOptional({
        description: "search for date",
        example: "",
    })
    end_date: Date;

    @ApiPropertyOptional({
        description: "Booking type search",
    })
    booking_type: BookingType[];

    @ApiPropertyOptional({
        description: "category name",
    })
    category_name: string[];

    @ApiPropertyOptional({
        description: "Customer name",
        example: "steave",
    })
    customer_name: string;

    @ApiPropertyOptional({
        description: "Booking status",
    })
    booking_status: BookingStatus[];

    @ApiPropertyOptional({
        description: "module id",
    })
    module_id: ModulesName[];

    @ApiPropertyOptional({
        description: "Payment type",
    })
    payment_type: PaymentType[];

    @ApiPropertyOptional({
        description: "Product id",
        example: "",
    })
    product_id: string;

    @ApiPropertyOptional({
        description: "booking id",
        example: "",
    })
    booking_id: string;

    @ApiPropertyOptional({
        description: "supplier id",
        example: "",
    })
    supplier_id: number;

    @ApiPropertyOptional({
        description: "search with keyword",
        example: "",
    })
    search: string;

    @ApiPropertyOptional({
        description: "search with transaction token",
        example: "",
    })
    transaction_token: string;

    @ValidateIf((o) => o.email != "undefined")

    // @IsEmail(
    //     {},
    //     {
    //         message: (args: ValidationArguments) => {
    //             if (typeof args.value != "undefined" || args.value != "") {
    //                 return `Please Enter valid email address.&&&email`;
    //             }
    //         },
    //     }
    // )
    @ApiPropertyOptional({
        type: "string",
        description: "user email id",
    })
    email: string;

    // @ValidateIf((o) => o.booking_through != "undefined")
    // @IsEnum(['ios','web','android'],{
    //     message : (args: ValidationArguments) => {
    //         if (typeof args.value != "undefined" || args.value != "") {
    //             return `Please enter valid booking through up type('ios','web','android').&&&signup_via&&&Please enter valid booking through ('ios','web','android')`
    //         }
    //     }
    // })
    @ApiPropertyOptional({
        description: `enter valid booking through`,
        example: ``,
    })
    booking_through: string[];

    @ApiPropertyOptional({
        description: "reservation id",
    })
    reservationId: string;

    // @Type(() => Traveler)
    // @ApiProperty({
    //     description:`Travelers`,
    //     example:[
    //         {
    //             "traveler_id": "123-ffacd-dfefefesadsdaw-ww",
    //             "first_name": "Jon",
    //             "last_name": "Doe",
    //             "email": "jon.doe@gmail.com",
    //             "dob": "1995-06-22",
    //             "gender": "M",
    //             "country_code": "1",
    //             "phone_no": "91919221212",
    //             "passport_number": "S1234X7896",
    //             "passport_expiry": "2030-07-20",
    //             "country_id": "1"
    //           },
    //           {
    //             "first_name": "Jon",
    //             "last_name": "Doe",
    //             "email": "jon.doe@gmail.com",
    //             "dob": "1995-06-22",
    //             "gender": "M",
    //             "country_code": "1",
    //             "phone_no": "91919221212",
    //             "passport_number": "S1234X7896",
    //             "passport_expiry": "2030-07-20",
    //             "country_id": "1"
    //           }
    //     ]
    // })
    // travelers:Traveler[]
}

// class OrderBy {
//     @ApiPropertyOptional({
//         description: "reservation id",
//     })
//     reservationId: string;
// }
