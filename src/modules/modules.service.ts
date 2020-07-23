import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
} from "@nestjs/common";
import { Module } from "src/entity/module.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ModuleRepository } from "./modules.repository";
import { User } from "@sentry/node";
import { getConnection } from "typeorm";
import { moduleStatusDto } from "./dto/moduleEnableDisable.dto";

@Injectable()
export class ModulesService {
	constructor(
		@InjectRepository(ModuleRepository)
		private moduleRepository: ModuleRepository
	) {}

	async listmodule(): Promise<{ data: Module[]; TotalReseult: number }> {
		try {
			return await this.moduleRepository.listModules();
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No modules Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}   
    }
    


    async moduleChangeStatus(id:number,moduleStatusDto:moduleStatusDto,adminId:User): Promise<{ message : string}> {
		try {
			 const { status }= moduleStatusDto
			const moduleData = await this.moduleRepository.findOne({
                id:id
			});
            if (!moduleData) throw new NotFoundException(`No language found`);
            console.log(statusName);
            var statusName = status == 'true' ? true : false ;
            var task = statusName ? 'Enable' : 'Disable';
            moduleData.status = statusName;
            moduleData.updatedBy = adminId.userId;
            moduleData.updateDate = new Date()
			moduleData.save();
			await getConnection().queryResultCache!.remove(['modules']);
			return { message : `module is ${task}`};
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No language Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}
}
