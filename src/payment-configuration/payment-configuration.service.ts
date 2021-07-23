import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { daysConfiguration } from 'src/entity/days_configuration.entity';
import { LaytripCategory } from 'src/entity/laytrip-category.entity';
import { PaymentConfiguration } from 'src/entity/payment-configuration.entity';
import { User } from 'src/entity/user.entity';
import { DownPaymentType } from 'src/enum/down-payment-type.enum';
import { InstalmentType } from 'src/enum/instalment-type.enum';
import { PaymentType } from 'src/enum/payment-type.enum';
import { getConnection } from 'typeorm';
import { GetPaymentConfigurationDto } from './dto/get-payment-config.dto';
import { UpdatePaymentConfigurationDto } from './dto/update-payment-config.dto';

@Injectable()
export class PaymentConfigurationService {

	async getPaymentConfig(getPaymentConfigurationDto: GetPaymentConfigurationDto) {
		const { module_id, category_name, days_config_id } = getPaymentConfigurationDto

		let where = `config.module_id = ${module_id} AND config.days_config_id = ${days_config_id}`

		if (category_name) {
			where += `AND category.name = '${category_name}'`
		}

		let config = await getConnection()
			.createQueryBuilder(PaymentConfiguration, "config")
			.leftJoinAndSelect("config.category", "category")
			.where(where)
			.getOne();
		
		if (!config) {
			throw new NotFoundException(`Please enter valid inputs`)
		}

		return { config }
	}

	async getDaysConfig() {
		return await getConnection()
			.createQueryBuilder(daysConfiguration, "daysConfiguration")
			.getMany();
	}

	async updatePaymentConfig(updatePaymentConfigurationDto: UpdatePaymentConfigurationDto,user:User) {
		const { module_id, category_name, days_config_id, down_payment_option, down_payment_type, payment_frequency, allow_installment } = updatePaymentConfigurationDto

		let where = `config.module_id = ${module_id} AND config.days_config_id = ${days_config_id}`
		if (down_payment_option.length){
			for await (const iterator of down_payment_option) {
				if (typeof iterator != 'number') {
					throw new BadRequestException(`${iterator} not valid in down payment option`)
				}
			}
		}

		if (payment_frequency.length){
			for await (const iterator of payment_frequency) {
				if (!Object.values(InstalmentType).includes(iterator)) {
					throw new BadRequestException(`${iterator} not valid payment type`)
				}
			}
		}
		
		if (category_name) {
			where += `AND category.name = '${category_name}'`
		}

		let config = await getConnection()
			.createQueryBuilder(PaymentConfiguration, "config")
			.leftJoinAndSelect("config.category", "category")
			.where(where)
			.getOne();

		if (!config) {
			throw new NotFoundException(`Please enter valid inputs`)
		}

		config.downPaymentOption = down_payment_option
		//config.paymentFrequency = payment_frequency
		config.isDownPaymentInPercentage =  down_payment_type == DownPaymentType.PERCENTAGE ? true : false
		config.isInstallmentAvailable = allow_installment
		config.updatedDate = new Date()
		config.updateBy = user.userId
		config.isWeeklyInstallmentAvailable = payment_frequency.includes(InstalmentType.WEEKLY) ? true : false
		config.isBiWeeklyInstallmentAvailable = payment_frequency.includes(InstalmentType.BIWEEKLY) ? true : false
		config.isMonthlyInstallmentAvailable = payment_frequency.includes(InstalmentType.MONTHLY) ? true : false

		const newConfig = await config.save()

		return {
			message : `Payment configuration updated successfully.`,
			data: newConfig
		}


	}
}
