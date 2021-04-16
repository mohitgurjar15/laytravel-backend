import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class SearchReqDto {
           @ApiProperty({
               description: "Check In date",
               example: new Date(new Date().setDate(new Date().getDate() + 10))
                   .toISOString()
                   .split("T")[0],
               required: true,
           })
           @IsString()
           check_in: string;

           @ApiProperty({
               description: "Check Out date",
               example: new Date(new Date().setDate(new Date().getDate() + 11))
                   .toISOString()
                   .split("T")[0],
               required: true,
           })
           @IsString()
           check_out: string;

           @ApiProperty({
               description: "Latitude of the searched location",
               example: "",
               required: true,
           })
           @IsString()
           latitude: string;

           @ApiProperty({
               description: "Longitude of the searched location",
               example: "",
               required: true,
           })
           @IsString()
           longitude: string;

           @ApiProperty({
               description:
                   "If search location is of Hotel type than pass the Hotel ID here",
               example: "702305676",
           })
           @IsString()
           @IsOptional()
           hotel_id?: string;

           @ApiProperty({
               description: "Number of of room",
               example: 2,
               required: true,
           })
           @IsNumber()
           rooms: number;

           @ApiProperty({
               description: "Number of adults",
               example: 2,
               required: true,
           })
           @IsNumber()
           adults: number;

           @ApiProperty({
               description: "Number of children",
               example: 2,
               required: true,
           })
           @IsNumber()
           children: number;

           @ApiProperty({
               description:
                   'If this object is set as "true" than "filter_object" will be provided with the search result which can be used to show under the Filter section',
               required: false,
           })
           @IsBoolean()
           @IsOptional()
           filter?: boolean = false;

           @IsOptional()
           @ApiProperty({
               description: "city_id",
               example: 2,
               required: true,
           })
           city_id: number;
       }
