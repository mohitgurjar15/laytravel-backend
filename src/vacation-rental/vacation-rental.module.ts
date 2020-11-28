import { VacationRentalController } from './vacation-rental.controller';
import { VacationRentalService } from './vacation-rental.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [
        VacationRentalController,],
    providers: [
        VacationRentalService,],
})
export class VacationRentalModule { }
