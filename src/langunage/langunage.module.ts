import { Module } from "@nestjs/common";
import { LangunageController } from "./langunage.controller";
import { LangunageService } from "./langunage.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LanguageRepository } from "./language.repository";
import { AuthModule } from "src/auth/auth.module";

@Module({
	imports: [TypeOrmModule.forFeature([LanguageRepository]), AuthModule],
	controllers: [LangunageController],
	providers: [LangunageService],
})
export class LangunageModule {}
