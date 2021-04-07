import {
  IsNotEmpty,
  ValidationArguments,
  IsEnum,
  ValidateIf,
  NotContains,
  IsEmail,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Gender } from "src/enum/gender.enum";
import { errorMessage } from "src/config/common.config";
import { IsValidDate } from "src/decorator/is-valid-date.decorator";
import * as moment from "moment";
import { ModulesName } from "src/enum/module.enum";

var today = new Date();
export class UpdateTravelerDto {
           // @IsEnum(['mr','ms','mrs'],{
           //     message : (args: ValidationArguments) => {
           //         if (typeof args.value == "undefined" || args.value == "") {
           //             return `Please select travelers title.&&&gender`;
           //         } else {
           //             return `Please select valid title('mr','ms','mrs').&&&title&&&${errorMessage}`
           //         }
           //     }
           // })
           // @ApiProperty({
           //     description: `Select Title ('mr','ms','mrs')`,
           //     example: `mr`
           // })
           // title : string;
           @ApiPropertyOptional({
               description: `Enter module id`,
               example: 1,
           })
           module_id?: number;

<<<<<<< HEAD
           @ApiPropertyOptional({
               description: `is primary traveler`,
               example: true,
           })
           is_primary_traveler?: boolean;
           @IsNotEmpty({
               message: `Please enter travelers first name.&&&first_name`,
           })
           @NotContains(" ", {
               message: `First name does not contain whitespace `,
           })
           @ApiProperty({
               description: `Enter First Name`,
               example: `Jon`,
           })
           first_name: string;

           @IsNotEmpty({
               message: `Please enter travelers last name.&&&last_name`,
           })
           @NotContains(" ", {
               message: `Last name does not contain whitespace `,
           })
           @ApiProperty({
               description: `Enter Last Name`,
               example: `Doe`,
           })
           last_name: string;
           @ValidateIf((o) => o.module_id != ModulesName.HOTEL)
           @IsValidDate("", {
               message: (args: ValidationArguments) => {
                   if (typeof args.value == "undefined" || args.value == "") {
                       return `Please enter date of birth.&&&dob`;
                   } else {
                       return `Please enter valid date of birth format(YYYY-MM-DD)&&&dob`;
                   }
               },
           })
           @ApiProperty({
               description: `Enter your dob`,
               example: `1995-06-22`,
           })
           dob: string;
           @ValidateIf((o) => o.module_id != ModulesName.HOTEL)
           @IsEnum(["M", "F", "O"], {
               message: (args: ValidationArguments) => {
                   if (
                       typeof args.value == "undefined" ||
                       args.value == "" ||
                       args.value == null
                   ) {
                       return `Please select your gender.&&&gender&&&Please select your gender.`;
                   } else {
                       return `Please select valid gender(M,F,O).&&&gender&&&${errorMessage}`;
                   }
               },
           })
           @ApiProperty({
               description: `Select Gender (M,F,N)`,
               example: `M`,
           })
           gender: Gender;
=======
  @IsNotEmpty({
    message: `Please enter travelers first name.&&&first_name`,
  })
  //@NotContains(" ", { message: `First name does not contain whitespace ` })
  @ApiProperty({
    description: `Enter First Name`,
    example: `Jon`,
  })
  first_name: string;

  @IsNotEmpty({
    message: `Please enter travelers last name.&&&last_name`,
  })
  //@NotContains(" ", { message: `Last name does not contain whitespace ` })
  @ApiProperty({
    description: `Enter Last Name`,
    example: `Doe`,
  })
  last_name: string;
>>>>>>> d151f16ad6acf5aee93934965dcb5fe78526bb61

           @ValidateIf(
               (o) =>
                   moment(new Date()).diff(moment(o.dob), "years") >= 12 &&
                   o.module_id == ModulesName.HOTEL &&
                   o.is_primary_traveler == true
           )
           @IsNotEmpty({
               message: `Please select phone country code.&&&country_code`,
           })
           @ApiProperty({
               description: `Select phone country code`,
               example: `+1`,
           })
           country_code: string;

           @ApiPropertyOptional({
               type: "string",
               description: "Passport number",
           })
           @ApiProperty({
               description: `Enter travelers passport number`,
               example: `S1234X7896`,
           })
           passport_number: string;

           @ApiPropertyOptional({
               type: "string",
               description: "Passport expiry date",
           })
           // @ValidateIf((o) => o.passport_expiry != "" &&  moment(new Date()).diff(moment(o.dob),'years') >= 12)
           // @IsValidDate("",{
           //     message: (args: ValidationArguments) => {
           //         if (typeof args.value != "undefined" || args.value != "") {
           //             return `Please enter valid passport expiry date format(YYYY-MM-DD)&&&passport_expiry`;
           //         }
           //     },
           // })
           @ApiProperty({
               description: `Enter travelers passport expiry date`,
               example: `2030-07-20`,
           })
           passport_expiry: string;

           @ApiPropertyOptional({
               type: "string",
               description: "Traveler phone no",
           })
           @ValidateIf(
               (o) =>
                   moment(new Date()).diff(moment(o.dob), "years") >= 12 &&
                   o.module_id == ModulesName.HOTEL &&
                   o.is_primary_traveler == true
           )
           @IsNotEmpty({
               message: (args: ValidationArguments) => {
                   if (typeof args.value == "undefined" || args.value == "") {
                       return `Please enter phone no.&&&phon_no`;
                   }
               },
           })
           @ApiProperty({
               description: `Enter travelers phone no`,
               example: `91919221212`,
           })
           phone_no: string;

           @ApiPropertyOptional({
               description: `Select country id`,
               example: `1`,
           })
           country_id: number;

           @ApiPropertyOptional({
               type: "string",
               description: "Traveler email id",
           })
           @IsEmail(
               {},
               {
                   message: (args: ValidationArguments) => {
                       if (
                           typeof args.value != "undefined" ||
                           args.value != ""
                       ) {
                           return `Please enter valid email address.&&&email`;
                       }
                   },
               }
           )
           @ApiProperty({
               description: `Enter travelers Email Id`,
               example: `jon.doe@gmail.com`,
           })
           email: string;
       }
