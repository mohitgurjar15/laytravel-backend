import { ApiProperty } from "@nestjs/swagger";

export class SearchLocation{

    @ApiProperty({
        description:"Enter a search name",
        example:'Barcelona'
    })
    search_name:string;
}