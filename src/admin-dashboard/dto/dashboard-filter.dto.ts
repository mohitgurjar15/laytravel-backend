import { ApiPropertyOptional } from '@nestjs/swagger';
export class DashboardFilterDto {

    
    @ApiPropertyOptional({
        description:'module id',
        example:""
    })
    moduleId: number;


    @ApiPropertyOptional({
        description:'start Date',
        example:""
    })
    startDate: Date;


    @ApiPropertyOptional({
        description:'to Date',
        example:""
    })
    toDate: Date;
}