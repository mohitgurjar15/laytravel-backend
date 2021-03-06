import { EntityRepository, Repository } from "typeorm";
import { Module } from "../entity/module.entity";
import { NotFoundException } from "@nestjs/common";

@EntityRepository(Module)
export class ModuleRepository extends Repository<Module> {

	async listModules(): Promise<{ data: Module[]; }> {
		// let where;
		// where = `status = true`;

		const [result, total] = await this.findAndCount({
			select: ["id", "name", "status", "mode"],
			cache: {
				id: "modules",
				milliseconds: 604800000,
			},
		});
		
		if (!result.length) {
			throw new NotFoundException(`No module found.`);
		}
		return { data: result};
	}
}
