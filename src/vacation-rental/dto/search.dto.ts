import { ApiProperty } from "@nestjs/swagger";

export class SearchLocation{

    @ApiProperty({
        description:`Enter search location name`,
        example:`Barcelona`
    })
    search_name:string;
}