import { Controller, Header } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

@Controller("app")
@ApiHeader({
    name: "referral_id",
    description: "Enter referral_id(ex. RS-410)",
})
export class AppController {}