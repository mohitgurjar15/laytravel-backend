import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { RewordPointRedeemRepository } from './roword-point-redeem.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { RewordPointEarnRepository } from './reword-point-earn.repository';
import { LayCreditEarn } from 'src/entity/lay-credit-earn.entity';
import { ListEarnRewordDto } from './dto/list-earn-reword.dto';
import { ListRedeemRewordDto } from './dto/list-redeem-reword.dto';
import { LayCreditRedeem } from 'src/entity/lay-credit-redeem.entity';

@Injectable()
export class RewordPointService {

    constructor(
		@InjectRepository(RewordPointRedeemRepository)
        private rewordPointRedeemRepository: RewordPointRedeemRepository,
        
        @InjectRepository(RewordPointEarnRepository)
		private rewordPointEarnRepository: RewordPointEarnRepository
	) {}


    async listEarnReword(paginationOption:ListEarnRewordDto,id:string): Promise<{ data: LayCreditEarn[] , TotalResult :number }> {
		try {
			return await this.rewordPointEarnRepository.listEarnReword(paginationOption,id);
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`Rewords Are Not Available`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}



	async listRedeemReword(paginationOption:ListRedeemRewordDto,id:string): Promise<{ data: LayCreditRedeem[] , TotalResult :number }> {
		try {
			return await this.rewordPointRedeemRepository.listRedeemReword(paginationOption,id);
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`Rewords Are Not Available`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

	async countOfRewordPoints(userId:string): Promise <{ total_available_points : number }>
	{
		try {
			let [earnedReword] = await this.rewordPointEarnRepository
			.query(`SELECT sum("points") FROM "lay_credit_earn" WHERE user_id = '${userId}' AND status = 1`);			

			let [redeemReword] = await this.rewordPointRedeemRepository
            .query(`SELECT sum("points") FROM "lay_credit_redeem" WHERE user_id = '${userId}' AND status = 1`)

			const points = earnedReword.sum - redeemReword.sum;

			return { total_available_points : points }
			 
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`Rewords Are Not Available`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${error.Message}`
			);
		}
	}

}
