import { Module } from '@nestjs/common';
import { FlightRouteController } from './flight-route.controller';
import { FlightRouteService } from './flight-route.service';

@Module({
  controllers: [FlightRouteController],
  providers: [FlightRouteService]
})
export class FlightRouteModule {}
