import {
	Injectable,
	NotFoundException,
	InternalServerErrorException,
	Inject,
	CACHE_MANAGER,
} from "@nestjs/common";
import { Module } from "src/entity/module.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ModuleRepository } from "./modules.repository";
import { User } from "@sentry/node";
import { getConnection } from "typeorm";
import { moduleStatusDto } from "./dto/moduleEnableDisable.dto";
import { ModeTestLive } from "./dto/modeTestLive.dto";
import { Cache } from 'cache-manager';

var fs = require(`fs`);

@Injectable()
export class ModulesService {
	private sessionName: string = 'mystifly-session';

	constructor(
		@InjectRepository(ModuleRepository)
		private moduleRepository: ModuleRepository,

		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
	) {
	}

	async listmodule(): Promise<{ data: Module[] }> {
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

	async moduleChangeStatus(
		id: number,
		moduleStatusDto: moduleStatusDto,
		adminId: User
	): Promise<{ message: string }> {
		try {
			const { status } = moduleStatusDto;
			const moduleData = await this.moduleRepository.findOne({
				id: id,
			});
			if (!moduleData) throw new NotFoundException(`No module found`);

			moduleData.status = status;
			moduleData.updatedBy = adminId.userId;
			moduleData.updateDate = new Date();
			await moduleData.save();

			await getConnection().queryResultCache!.remove(["modules"]);
			return {
				message: `Module ${moduleData.name} status changed successfully.`,
			};

		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No module Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	async changeMode(id: number, changeMode: ModeTestLive, user: User) {
		try {
			const { mode } = changeMode;
			const moduleData = await this.moduleRepository.findOne({
				id: id,
			});
			if (!moduleData) throw new NotFoundException(`No module found`);

			moduleData.mode = mode;
			moduleData.updatedBy = user.userId;
			moduleData.updateDate = new Date();
			await moduleData.save();

			await getConnection().queryResultCache!.remove(["modules"]);
			await getConnection().queryResultCache!.remove([`${moduleData.name}_module`]);
			if (moduleData.name == 'flight') {
				await this.cacheManager.del(this.sessionName);
				// await fs.unlink(
				// 	`src/flight/mystifly-session.json`,
				// 	function (err) {
				// 		if (err) {
				// 			console.log(err);
				// 		}
				// 		else {
				// 			console.log(`file deleted!`);
				// 		}
				// 		// if no error, file has been deleted successfully
				// 	}
				//);

			}
			return {
				message: `${moduleData.name} is set to ${mode ? 'live' : 'test'} mode successfully`,
			};

		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No module Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}
}
