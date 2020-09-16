import {
	Injectable,
	BadRequestException,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { SaveCardDto } from "./dto/save-card.dto";
import { getManager } from "typeorm";
import { PaymentGateway } from "src/entity/payment-gateway.entity";
import { errorMessage } from "src/config/common.config";
import { UserCard } from "src/entity/user-card.entity";
import { v4 as uuidv4 } from "uuid";
import { User } from "src/entity/user.entity";
import Axios from "axios";
import { AddCardDto } from "./dto/add-card.dto";
import { ListPaymentAdminDto } from "./dto/list-payment-admin.dto";
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { ListPaymentUserDto } from "./dto/list-payment-user.dto";

@Injectable()
export class PaymentService {
	async saveCard(saveCardDto: SaveCardDto, user: User) {
		const {
			card_holder_name,
			card_last_digit,
			card_type,
			card_token,
		} = saveCardDto;

		let paymentGateway = await getManager()
			.createQueryBuilder(PaymentGateway, "paymentgateway")
			.where("paymentgateway.gateway_name = :name ", { name: "spreedly" })
			.getOne();
		if (!paymentGateway) {
			throw new BadRequestException(
				`Payment gateway is not configured in database&&&payment_gateway_id&&&${errorMessage}`
			);
		}

		let userCard = new UserCard();
		userCard.id = uuidv4();
		userCard.paymentGatewayId = paymentGateway.id;
		userCard.userId = user.userId;
		userCard.cardHolderName = card_holder_name;
		userCard.cardDigits = card_last_digit;
		userCard.cardToken = card_token;
		userCard.cardType = card_type;
		userCard.createdDate = new Date();

		try {
			return await userCard.save();
		} catch (exception) {
			throw new InternalServerErrorException(errorMessage);
		}
	}

	async getAllCards(user: User) {
		let cardList = await getManager()
			.createQueryBuilder(UserCard, "user_card")
			.select([
				"user_card.userId",
				"user_card.id",
				"user_card.cardHolderName",
				"user_card.cardDigits",
				"user_card.cardToken",
				"user_card.cardType",
				"user_card.status",
			])
			.where(
				"user_card.user_id = :user_id and user_card.is_deleted=:is_deleted",
				{ user_id: user.userId, is_deleted: false }
			)
			.getMany();

		if (!cardList.length) throw new NotFoundException(`No card founds`);

		return cardList;
	}

	async addCard(addCardDto: AddCardDto, user: User) {
		const { first_name, last_name, card_number, card_cvv, expiry } = addCardDto;

		let expiryDate = expiry.split("/");

		let url = `https://core.spreedly.com/v1/payment_methods.json`;
		let requestBody = {
			payment_method: {
				credit_card: {
					first_name: first_name,
					last_name: last_name,
					number: card_number,
					verification_value: card_cvv,
					month: expiryDate[0],
					year: expiryDate[1],
				},
				retained: true,
			},
		};
		let cardResult = await this.axiosRequest(url, requestBody);
		console.log(cardResult);
		if (
			typeof cardResult != "undefined" &&
			typeof cardResult.transaction != "undefined" &&
			cardResult.transaction.succeeded
		) {
			let paymentGateway = await getManager()
				.createQueryBuilder(PaymentGateway, "paymentgateway")
				.where("paymentgateway.gateway_name = :name ", { name: "spreedly" })
				.getOne();
			if (!paymentGateway) {
				throw new BadRequestException(
					`Payment gateway is not configured in database&&&payment_gateway_id&&&${errorMessage}`
				);
			}

			let userCard = new UserCard();
			userCard.id = uuidv4();
			userCard.paymentGatewayId = paymentGateway.id;
			userCard.userId = user.userId;
			userCard.cardHolderName = cardResult.transaction.payment_method.full_name;
			userCard.cardDigits =
				cardResult.transaction.payment_method.last_four_digits;
			userCard.cardToken = cardResult.transaction.payment_method.token;
			userCard.cardType = cardResult.transaction.payment_method.card_type;
			userCard.createdDate = new Date();

			try {
				return await userCard.save();
			} catch (exception) {
				throw new InternalServerErrorException(errorMessage);
			}
		} else {
			throw new BadRequestException(`Invalid card!`);
		}
	}

	async authorizeCard(gatewayToken, card_id, amount, currency) {
		/* return {
            status   : true,
            token    : 'AUT675462'
        } */
		let url = `https://core.spreedly.com/v1/gateways/${gatewayToken}/authorize.json`;
		let requestBody = {
			transaction: {
				payment_method_token: card_id,
				amount: amount,
				currency_code: "USD",
			},
		};
		let authResult = await this.axiosRequest(url, requestBody);
		console.log(authResult);
		if (authResult.transaction?.succeeded) {
			return {
				status: true,
				token: authResult.transaction.token,
				meta_data: authResult,
			};
		} else {
			return {
				status: false,
				meta_data: authResult,
			};
		}
	}

	async captureCard(authorizeToken) {
		/* return {
            status   : true,
            token    : 'CAP675462'
        } */

		let url = `https://core.spreedly.com/v1/transactions/${authorizeToken}/capture.json`;
		let requestBody = {};
		let captureRes = await this.axiosRequest(url, requestBody);
		console.log(captureRes);
		if (captureRes.transaction.succeeded) {
			return {
				status: true,
				token: captureRes.transaction.token,
				meta_data: captureRes,
			};
		} else {
			return {
				status: false,
				meta_data: captureRes,
			};
		}
	}

	async voidCard(captureToken) {
		/* return {
            status   : true,
            token    : 'VOI675462'
        } */

		let url = `https://core.spreedly.com/v1/transactions/${captureToken}/void.json`;
		let requestBody = {};
		let voidRes = await this.axiosRequest(url, requestBody);
		console.log(voidRes);
		if (voidRes.transaction.succeeded) {
			return {
				status: true,
				token: voidRes.transaction.token,
				meta_data: voidRes,
			};
		} else {
			return {
				status: false,
				meta_data: voidRes,
			};
		}
	}

	async axiosRequest(url, requestBody, headers = null) {
		try {
			let result = await Axios({
				method: "POST",
				url: url,
				data: requestBody,
				headers: {
					Accept: "application/json",
					Authorization:
						"Basic WU5FZFpGVHdCMXRSUjR6d3ZjTUlhVXhacTNnOnV3RkowRHRKTTdQRVluWHBaWGJ2ZjBGYUR6czY2cjY4T1B1OG51Zld4Q3FYWTJ6RmFFYUFNb1ZmSTN1M2JVQ2k=",
				},
			});
			//console.log("=========================",result)
			return result.data;
		} catch (exception) {
			//console.log("exception",exception)
		}
	}

	/*
	 * Created on Tue Sep 15 2020
	 *
	 * @Auther:- Parth Virani
	 * Copyright (c) 2020 Oneclick
	 * my variables are ${myvar1} and ${myvar2}
	 */

	async listPaymentForAdmin(listPaymentAdminDto: ListPaymentAdminDto) {
		const {
			limit,
			page_no,
			module_id,
			supplier,
			status,
			start_date,
			end_date,
			instalment_type,
			user_id,
			booking_id,
		} = listPaymentAdminDto;

		let where;
		where = `1=1 `;
		if (user_id) {
			where += `AND ("BookingInstalments"."user_id" = '${user_id}')`;
		}

		if (booking_id) {
			where += `AND ("BookingInstalments"."booking_id" = '${booking_id}')`;
		}
		if (start_date) {
			where += `AND (DATE("BookingInstalments".instalment_date) >= '${start_date}') `;
		}
		if (end_date) {
			where += `AND (DATE("BookingInstalments".instalment_date) <= '${end_date}') `;
		}
		if (status) {
			where += `AND ("BookingInstalments"."payment_status" = '${status}')`;
		}
		if (module_id) {
			where += `AND ("BookingInstalments"."module_id" = '${module_id}')`;
		}
		if (supplier) {
			where += `AND ("BookingInstalments"."supplier_id" = '${supplier}') `;
		}
		if (instalment_type) {
			where += `AND ("BookingInstalments"."instalment_type" = '${instalment_type}') `;
		}

		return this.listPayment(where, limit, page_no);
	}

	async listPaymentForUser(listPaymentUserDto: ListPaymentUserDto,user_id : string = '') {
		const {
			limit,
			page_no,
			module_id,
			status,
			start_date,
			end_date,
			instalment_type,
			booking_id,
		} = listPaymentUserDto;

		let where;
		where = `("BookingInstalments"."user_id" = '${user_id}')`;

		if (booking_id) {
			where += `AND ("BookingInstalments"."booking_id" = '${booking_id}')`;
		}
		if (start_date) {
			where += `AND (DATE("BookingInstalments".instalment_date) >= '${start_date}') `;
		}
		if (end_date) {
			where += `AND (DATE("BookingInstalments".instalment_date) <= '${end_date}') `;
		}
		if (status) {
			where += `AND ("BookingInstalments"."payment_status" = '${status}')`;
		}
		if (module_id) {
			where += `AND ("BookingInstalments"."module_id" = '${module_id}')`;
		}
		if (instalment_type) {
			where += `AND ("BookingInstalments"."instalment_type" = '${instalment_type}') `;
		}
		return this.listPayment(where, limit, page_no);
	}

	async listPayment(where: string, limit: number, page_no: number) {
		const take = limit || 10;
		const skip = (page_no - 1) * limit || 0;

		const [data, count] = await getManager()
			.createQueryBuilder(BookingInstalments, "BookingInstalments")
			.leftJoinAndSelect("BookingInstalments.booking", "booking")
			.leftJoinAndSelect("BookingInstalments.currency", "currency")
			.leftJoinAndSelect("BookingInstalments.user", "User")
			.leftJoinAndSelect("BookingInstalments.module", "moduleData")
			.leftJoinAndSelect("BookingInstalments.supplier", "supplier")
			.leftJoinAndSelect(
				"BookingInstalments.failedPaymentAttempts",
				"failedPaymentAttempts"
			)
			// .select([
			// 	"User.userId",
			// 	"User.title",
			// 	"User.dob",
			// 	"User.firstName",
			// 	"User.lastName",
			// 	"User.email",
			// 	"booking",

			// 	"moduleData.id",
			// 	"moduleData.name",
			// 	"supplier.id",
			// 	"supplier.name",
			// 	"failedPaymentAttempts",
			// 	"currency.id",
			// 	"currency.country",
			// 	"currency.code",
			// 	"currency.symbol",
			// 	"currency.liveRate",
			// ])
			.where(where)
			.limit(take)
			.offset(skip)
			.getManyAndCount();

		if (!data.length) {
			throw new NotFoundException(
				`Payment record not found&&&id&&&Payment record not found`
			);
		}
		return { data: data, total_count: count };
	}
}
