import { Module } from '@nestjs/common';
import { VacationRentalController } from './vacation-rental.controller';
import { VacationRentalService } from './vacation-rental.service';

@Module({
    imports: [],
    controllers: [VacationRentalController],
    providers: [VacationRentalService],
})
export class VacationRentalModule {}
