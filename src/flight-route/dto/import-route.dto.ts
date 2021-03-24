import { ApiPropertyOptional } from "@nestjs/swagger";

export class ImportRouteDto {
    @ApiPropertyOptional({
        type: "string",
        format: "binary",
        description: "csv file url (Allow Only 'csv')",
        example: "route.csv",
    })
    file: string;
}
