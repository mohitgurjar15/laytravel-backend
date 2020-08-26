import { Module } from "@nestjs/common";
import { ModulesController } from "./modules.controller";
import { ModulesService } from "./modules.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { ModuleRepository } from "./modules.repository";

@Module({
	imports: [TypeOrmModule.forFeature([ModuleRepository]), AuthModule],
	controllers: [ModulesController],
	providers: [ModulesService],
})
export class ModulesModule {}
