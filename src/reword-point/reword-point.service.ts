import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, ConflictException, NotAcceptableException, UnauthorizedException } from '@nestjs/common';
import { RewordPointRedeemRepository } from './roword-point-redeem.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { RewordPointEarnRepository } from './reword-point-earn.repository';
import { LayCreditEarn } from 'src/entity/lay-credit-earn.entity';
import { ListEarnRewordDto } from './dto/list-earn-reword.dto';
import { ListRedeemRewordDto } from './dto/list-redeem-reword.dto';
import { LayCreditRedeem } from 'src/entity/lay-credit-redeem.entity';
import { AddLaytripPoint } from './dto/add-laytrip-point.dto';
import { User } from 'src/entity/user.entity';
import { RewordStatus } from 'src/enum/reword-status.enum';
import { PaymentService } from "src/payment/payment.service";
import { errorMessage } from 'src/config/common.config';

@Injectable()
export class RewordPointService {

	constructor(
		@InjectRepository(RewordPointRedeemRepository)
		private rewordPointRedeemRepository: RewordPointRedeemRepository,

		@InjectRepository(RewordPointEarnRepository)
		private rewordPointEarnRepository: RewordPointEarnRepository,

		private paymentService: PaymentService,
	) { }


	async listEarnReword(paginationOption: ListEarnRewordDto, id: string): Promise<{ data: LayCreditEarn[], TotalResult: number }> {
		try {
			return await this.rewordPointEarnRepository.listEarnReword(paginationOption, id);
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



	async listRedeemReword(paginationOption: ListRedeemRewordDto, id: string): Promise<{ data: LayCreditRedeem[], TotalResult: number }> {
		try {
			return await this.rewordPointRedeemRepository.listRedeemReword(paginationOption, id);
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

	async countOfRewordPoints(userId: string) {
		try {
			let [earnedReword] = await this.rewordPointEarnRepository
				.query(`SELECT sum("points") FROM "lay_credit_earn" WHERE user_id = '${userId}' AND status = 1`);

			let [redeemReword] = await this.rewordPointRedeemRepository
				.query(`SELECT sum("points") FROM "lay_credit_redeem" WHERE user_id = '${userId}' AND status = 1`)

			const points = earnedReword.sum - redeemReword.sum;

			return { total_available_points: points, total_earned_points: earnedReword.sum || 0, total_redeem_points: redeemReword.sum || 0 }

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
	async addLaytripPoint(addLaytripPoint: AddLaytripPoint, user: User) {
		try {
			const { card_token, points } = addLaytripPoint;
			const payment = await this.getPayment(card_token, points)

			if (payment == true) {
				const reword = new LayCreditEarn();
				reword.points = points;
				reword.userId = user.userId;
				reword.status = RewordStatus.AVAILABLE;
				reword.creditMode = 'Purchesed';
				reword.earnDate = new Date();
				reword.description = `Point Purchesed by user`;
				reword.creditBy = user.userId;
				await reword.save();
				return {
					message: `${points} Laytrip point added succefully`
				}
			}
		}catch (error) {
			if (typeof error.response !== "undefined") {
				switch (error.response.statusCode) {
					case 404:
						throw new NotFoundException(error.response.message);
					case 409:
						throw new ConflictException(error.response.message);
					case 422:
						throw new BadRequestException(error.response.message);
					case 500:
						throw new InternalServerErrorException(error.response.message);
					case 406:
						throw new NotAcceptableException(error.response.message);
					case 404:
						throw new NotFoundException(error.response.message);
					case 401:
						throw new UnauthorizedException(error.response.message);
					default:
						throw new InternalServerErrorException(
							`${error.message}&&&id&&&${error.Message}`
						);
				}
			}
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async getPayment(card_token, amount) {
		let authCardResult = await this.paymentService.authorizeCard(
			"IATVj8ha4pTQtjTTHrJgqHtMtJn",
			card_token,
			amount,
			"USD"
		);
		if (authCardResult.status == true) {
			let authCardToken = authCardResult.token;
			let captureCardresult = await this.paymentService.captureCard(
				authCardToken
			);
			if (captureCardresult.status == true) {
				return true;
			} else {
				throw new BadRequestException(
					`Card capture is failed&&&card_token&&&${errorMessage}`
				);
			}
		} else {
			throw new BadRequestException(
				`Card authorization is failed&&&card_token&&&${errorMessage}`
			);
		}
	}
}
