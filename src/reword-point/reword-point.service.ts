/**
 * @author Parth Virani
 * @email parthvirani@itoneclick.com
 * @create date 2020-10-23 13:06:34
 * @modify date 2020-10-23 13:06:34
 * @desc :- service for manage a Laytrip reword point 
 */
import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, ConflictException, NotAcceptableException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
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
import { CreteTransactionDto } from "src/payment/dto/create-transaction.dto";
import { PaidFor } from 'src/enum/paid-for.enum';
import { PaymentStatus } from 'src/enum/payment-status.enum';

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

			const createTransaction = {
				"bookingId": null,
				"userId": user.userId,
				"card_token": card_token,
				"currencyId": 1,
				"amount": points,
				"paidFor": PaidFor.RewordPoint,
				"note": ""
			}
			const payment = await this.paymentService.createTransaction(createTransaction, user.userId)

			if (payment.paymentStatus == PaymentStatus.CONFIRM) {

				const reword = new LayCreditEarn();
				reword.transactionId = payment.id;
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
			else {
				throw new InternalServerErrorException(
					`Transaction cancelled ! if amount is debited then please contact administration`)
			}
		} catch (error) {
			if (typeof error.response !== "undefined") {
				switch (error.response.statusCode) {
					case 404:
						throw new NotFoundException(error.response.message);
					case 409:
						throw new ConflictException(error.response.message);
					case 422:
						throw new BadRequestException(error.response.message);
					case 403:
						throw new ForbiddenException(error.response.message);
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


}
