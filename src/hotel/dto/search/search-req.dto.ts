import { ApiProperty } from "@nestjs/swagger";

export class Occupancy{
    @ApiProperty({
        description: 'Number of adults for a room',
        example: 2,
        required: true
    })
    adults: number;
    
    @ApiProperty({
        description: 'Number of Children for a room',
        example: [2,3],
        required: true
    })
    children: Array<number>;
}

export class SearchReqDto{

    @ApiProperty({
        description: 'Check In date',
        example: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
        required: true
    })
    check_in: Date;
    
    @ApiProperty({
        description: 'Check Out date',
        example: new Date(new Date().setDate(new Date().getDate() + 11)).toISOString().split('T')[0],
        required: true
    })
    check_out: Date;
    
    @ApiProperty({
        description: 'Latitude of the searched location',
        example: 51.5074,
        required: true
    })
    latitude: number;
    
    @ApiProperty({
        description: 'Longitude of the searched location',
        example: -0.1276,
        required: true
    })
    longitude: number;
    
    @ApiProperty({
        description: 'Number of occupancies for this search',
        required: true,
        type: () => [Occupancy],
    })
    occupancies: Array<Occupancy[]>;

}