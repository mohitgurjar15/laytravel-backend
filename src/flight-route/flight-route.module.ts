import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { FlightRouteController } from './flight-route.controller';
import { FlightRouteService } from './flight-route.service';

@Module({
  imports:[
    AuthModule],
  controllers: [FlightRouteController],
  providers: [FlightRouteService]
})
export class FlightRouteModule {}
