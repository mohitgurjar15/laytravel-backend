import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateDealDto {
           @IsNotEmpty({
               message: `Please enter id&&&subject&&&Please enter id.`,
           })
           @ApiProperty({
               description: "Enter id",
               example: "",
           })
           id: number;

           @ApiPropertyOptional({
               type: "string",
               format: "binary",
               description: "deal image (Allow Only 'JPG,JPEG,PNG')",
               example: "",
           })
           image: string;

           @ApiPropertyOptional({
               description: "Enter location",
               example: "",
           })
           location: string;

           @ApiPropertyOptional({
               description: `hotel_location`,
               example: {
                   title: "TD Waterhouse Stadium, London, Ontario, Canada",
                   city: "London",
                   state: "Ontario",
                   country: "Canada",
                   type: "poi",
                   hotel_id: "",
                   lat: "42.9998",
                   long: "-81.2734",
               },
           })
           hotel_location: object;
       }

class hotelLocation {
    @IsNotEmpty({
        message: `Please select title.`,
    })
    @ApiProperty({
        description: `title`,
        example: ``,
    })
    title: string;

    @IsNotEmpty({
        message: `Please select city.`,
    })
    @ApiProperty({
        description: `city`,
        example: ``,
    })
    city: string;

    @IsNotEmpty({
        message: `Please select state.`,
    })
    @ApiProperty({
        description: `state`,
        example: ``,
    })
    state: string;

    @IsNotEmpty({
        message: `Please select country.`,
    })
    @ApiProperty({
        description: `country`,
        example: ``,
    })
    country: string;

    @IsNotEmpty({
        message: `Please select type.`,
    })
    @ApiProperty({
        description: `type`,
        example: ``,
    })
    type: string;
    @IsNotEmpty({
        message: `Please select lat.`,
    })
    @ApiProperty({
        description: `lat`,
        example: ``,
    })
    lat: string;
    @IsNotEmpty({
        message: `Please select long.`,
    })
    @ApiProperty({
        description: `long`,
        example: ``,
    })
    long: string;

    @ApiPropertyOptional({
        description: "hotel_id",
        example: "",
    })
    hotel_id: string;
}
