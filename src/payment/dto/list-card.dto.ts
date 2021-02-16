import { ApiPropertyOptional } from "@nestjs/swagger";

export class ListUserCardDto {
    @ApiPropertyOptional({
        description: `guest user id`,
        example: ``
    })
    guest_id: string;
}