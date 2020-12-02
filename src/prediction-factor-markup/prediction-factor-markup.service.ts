import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Activity } from 'src/utility/activity.utility';
import { UpdatePredictionMarkupDto } from './dto/update-prediction-markup.dto';
import { PredictionFactorMarkupRepository } from './prediction-factor-markup.repository';

@Injectable()
export class PredictionFactorMarkupService {
    constructor(
        @InjectRepository(PredictionFactorMarkupRepository)
        private predictionFactorMarkupRepository: PredictionFactorMarkupRepository
    ) { }

    async listFactorMarkup(): Promise<{ data: any }> {
        try {
            return await this.predictionFactorMarkupRepository.listFactorMarkup();
        } catch (error) {
            if (
                typeof error.response !== "undefined" &&
                error.response.statusCode == 404
            ) {
                throw new NotFoundException(`No preduction markup Found.&&&id`);
            }

            throw new InternalServerErrorException(
                `${error.message}&&&id&&&${error.Message}`
            );
        }
    }


    async updatepredictionMarkup(

        updatePredictionMarkupDto: UpdatePredictionMarkupDto,
		user:User
    ): Promise<{ message: string }> {
        const { minimum_installment_percentage ,max_rate_percentage,min_rate_percentage } = updatePredictionMarkupDto;

        
        let markupDetail = await this.predictionFactorMarkupRepository.findOne();

        if (!markupDetail) throw new NotFoundException(`Predaction markup not found`);

        //markupDetail.moduleId = module_id;
        //markupDetail.userType = user_type;
        markupDetail.minInstallmentPercentage = minimum_installment_percentage;
		markupDetail.minRatePercentage = min_rate_percentage;
		markupDetail.maxRatePercentage = max_rate_percentage;
        markupDetail.updatedDate = new Date();

        try {
            markupDetail.save();
            // await getConnection().queryResultCache!.remove(["markup"]);
            Activity.logActivity(user.userId, "prediction factor markup", `prediction Markup Updated by admin`);

            return { message: "Prediction Markup Updated Successfully" };
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
