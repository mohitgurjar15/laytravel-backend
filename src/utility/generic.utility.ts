
import { getConnection } from "typeorm";
import { Module } from "src/entity/module.entity";

export class  Generic{

    static async getCredential(module_name:string){

        const credentail = await getConnection()
            .createQueryBuilder()
            .select(["module.mode","module.testCredential","module.liveCredential"])
            .from(Module, "module")
            .where("module.name = :module_name", { module_name })
            .cache(`${module_name}_module`,43200000)
            .getOne();
        return credentail;
    }
}