import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, ValidateIf } from "class-validator";
import { ModulesName } from "src/enum/module.enum";

export class GetPaymentConfigurationDto {

    
    @IsNotEmpty({
        message: `Please enter module id.&&&module id`,
    })
    @ApiProperty({
        description: `Enter module id`,
        example: 1,
    })
    module_id?: number;

    @ValidateIf((o) => o.module_id == ModulesName.FLIGHT)
    @IsNotEmpty({
        message: `Please select category id.&&&category id`,
    })
    @ApiPropertyOptional({
        description: 'category id',
        example: 'Gold'
    })
    category_name: string;

    @IsNotEmpty({
        message: `Please enter days config id.`,
    })
    @ApiProperty({
        description: `Enter days config id`,
        example: 1,
    })
    days_config_id?: number;
    
}