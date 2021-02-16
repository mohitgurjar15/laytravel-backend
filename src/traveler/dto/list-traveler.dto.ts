import { ApiPropertyOptional } from "@nestjs/swagger";

export class ListTravelerDto {
    @ApiPropertyOptional({
        description: `guest user id`,
        example: ``
    })
    guest_id: string;
}