import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Activity } from 'src/utility/activity.utility';
import { getConnection } from 'typeorm';
import { UpdatePreductionMarkupDto } from './dto/update-preduction-markup.dto';
import { PreductionFactorMarkupRepository } from './preduction-factor-markup.repository';

@Injectable()
export class PreductionFactorMarkupService {
    constructor(
        @InjectRepository(PreductionFactorMarkupRepository)
        private PreductionFactorMarkupRepository: PreductionFactorMarkupRepository
    ) { }

    async listFactorMarkup(): Promise<{ data: any }> {
        try {
            return await this.PreductionFactorMarkupRepository.listFactorMarkup();
        } catch (error) {
            if (
                typeof error.response !== "undefined" &&
                error.response.statusCode == 404
            ) {
                throw new NotFoundException(`No any markup Found.&&&id`);
            }

            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${error.Message}`
            );
        }
    }


    async updatePreductionMarkup(

        updatePreductionMarkupDto: UpdatePreductionMarkupDto,
		user:User
    ): Promise<{ message: string }> {
        const { markup_percentage ,max_rate_percentage,min_rate_percentage } = updatePreductionMarkupDto;

        // let moduleDetaile = await getManager()
        // 	.createQueryBuilder(Module, "module")
        // 	.where(`id=:module_Id`, { module_id })
        // 	.getOne();
        // if (!moduleDetaile)
        // 	throw new BadRequestException(
        // 		`module id not exist with database.&&&module_id`
        // 	);

        // let supplierDetail = await getManager()
        // 	.createQueryBuilder(Supplier, "supplier")
        // 	.where(`id=:supplier_id `, {
        // 		supplier_id,
        // 	})
        // 	.getOne();
        // if (!supplierDetail)
        // 	throw new BadRequestException(
        // 		`supplier id not exist with database.&&&supplier_id`
        // 	);
        let markupDetail = await this.PreductionFactorMarkupRepository.findOne();

        if (!markupDetail) throw new NotFoundException(`Predaction markup not found`);

        //markupDetail.moduleId = module_id;
        //markupDetail.userType = user_type;
        markupDetail.markupPercentage = markup_percentage;
		markupDetail.minRatePercentage = min_rate_percentage;
		markupDetail.maxRatePercentage = max_rate_percentage;
        markupDetail.updatedDate = new Date();

        try {
            markupDetail.save();
            // await getConnection().queryResultCache!.remove(["markup"]);
            Activity.logActivity(user.userId, "Preduction factor markup", `Preduction Markup Updated by admin`);

            return { message: "Preduction Markup Updated Successfully" };
        } catch (error) {
            if (
                typeof error.response !== "undefined" &&
                error.response.statusCode == 404
            ) {
                throw new NotFoundException(`Predaction markup not found&&&id`);
            }
            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${error.Message}`
            );
        }
    }

}
