import { Module } from "@nestjs/common";
import { SupplierController } from "./supplier.controller";
import { SupplierService } from "./supplier.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRepository } from "src/auth/user.repository";
import { AuthModule } from "src/auth/auth.module";

@Module({
	imports: [TypeOrmModule.forFeature([UserRepository]), AuthModule],
	controllers: [SupplierController],
	providers: [SupplierService],
})
export class SupplierModule {}
