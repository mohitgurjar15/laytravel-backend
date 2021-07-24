import { PaymentConfiguration } from "src/entity/payment-configuration.entity";
import { getConnection } from "typeorm";

export class PaymentConfigurationUtility {

    static async getPaymentConfig(module_id: number, category_id: number, daysUtilDepature : number) {


        let where = `config.module_id = ${module_id} AND daysConfiguration.minDays >= ${daysUtilDepature} AND daysConfiguration.maxDays <= ${daysUtilDepature}`

        if (category_id > 0) {
            where += `AND category.id = '${category_id}'`
        }

        let config = await getConnection()
            .createQueryBuilder(PaymentConfiguration, "config")
            .leftJoinAndSelect("config.category", "category")
            .leftJoinAndSelect("config.daysConfiguration", "daysConfiguration")
            .where(where)
            .getOne();

        return config
    }

}