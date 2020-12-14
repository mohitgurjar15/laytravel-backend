import {
	Injectable,
	BadRequestException,
	InternalServerErrorException,
	NotFoundException,
	ConflictException,
	ForbiddenException,
	NotAcceptableException,
	UnauthorizedException,
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
import { CreteTransactionDto } from "./dto/create-transaction.dto";
import { Generic } from "src/utility/generic.utility";
import { OtherPayments } from "src/entity/other-payment.entity";
import { PaymentStatus } from "src/enum/payment-status.enum";
import { Activity } from "src/utility/activity.utility";


@Injectable()
export class PaymentService {
	constructor(
		// @InjectRepository(BookingRepository)
		// private bookingRepository: BookingRepository,
	) { }
	async saveCard(saveCardDto: SaveCardDto, user: User) {
		const {
			card_holder_name,
			card_last_digit,
			card_type,
			card_token,
		} = saveCardDto;

		let paymentGateway = await getManager()
			.createQueryBuilder(PaymentGateway, "paymentgateway")
			.where("paymentgateway.gateway_name = :name ", { name: "stripe" })
			.getOne();
		if (!paymentGateway) {
			throw new BadRequestException(
				`Payment gateway is not configured in database&&&payment_gateway_id&&&${errorMessage}`
			);
		}

		this.retainCard(card_token);

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

		const GatewayCredantial = await Generic.getPaymentCredential()

		const authorization = GatewayCredantial.credentials.authorization;

		const headers = {
			Accept: "application/json",
			Authorization: authorization,
		}

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
		let cardResult = await this.axiosRequest(url, requestBody, headers, null, 'add-card');

		console.log(cardResult);
		if (
			typeof cardResult != "undefined" &&
			typeof cardResult.transaction != "undefined" &&
			cardResult.transaction.succeeded
		) {
			let paymentGateway = await getManager()
				.createQueryBuilder(PaymentGateway, "paymentgateway")
				.where("paymentgateway.gateway_name = :name ", { name: "stripe" })
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

	async authorizeCard(card_id, amount, currency_code) {

		const GatewayCredantial = await Generic.getPaymentCredential()

		const gatewayToken = GatewayCredantial.credentials.token;
		const authorization = GatewayCredantial.credentials.authorization;
		const transactionMode = GatewayCredantial.gateway_payment_mode;

		const headers = {
			Accept: "application/json",
			Authorization: authorization,
		}

		let url = `https://core.spreedly.com/v1/gateways/${gatewayToken}/authorize.json`;
		let requestBody = {
			transaction: {
				payment_method_token: card_id,
				amount: amount,
				currency_code: currency_code,
			},
		};
		let authResult = await this.axiosRequest(url, requestBody, headers, null, 'authorise-card');
		console.log(authResult)
		if (typeof authResult.transaction != 'undefined' && authResult.transaction.succeeded) {
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
		const GatewayCredantial = await Generic.getPaymentCredential()

		const authorization = GatewayCredantial.credentials.authorization;

		const headers = {
			Accept: "application/json",
			Authorization: authorization,
		}

		let url = `https://core.spreedly.com/v1/transactions/${authorizeToken}/capture.json`;
		let requestBody = {};
		let captureRes = await this.axiosRequest(url, requestBody, headers, null, 'capture-card');
		if (typeof captureRes.transaction != 'undefined' && captureRes.transaction.succeeded) {
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
		const GatewayCredantial = await Generic.getPaymentCredential()

		const authorization = GatewayCredantial.credentials.authorization;

		const headers = {
			Accept: "application/json",
			Authorization: authorization,
		}
		let url = `https://core.spreedly.com/v1/transactions/${captureToken}/void.json`;
		let requestBody = {};
		let voidRes = await this.axiosRequest(url, requestBody, headers, null, 'void-card');
		if (typeof voidRes.transaction != 'undefined' && voidRes.transaction.succeeded) {
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

	async retainCard(cardToken) {
		const GatewayCredantial = await Generic.getPaymentCredential()

		const authorization = GatewayCredantial.credentials.authorization;

		const headers = {
			Accept: "application/json",
			Authorization: authorization,
		}

		let url = `https://core.spreedly.com/v1/payment_methods/${cardToken}/retain.json`;
		let requestBody = {};
		let retainRes = await this.axiosRequest(url, requestBody, headers, 'PUT', 'retain-card');
		if (typeof retainRes != 'undefined' && retainRes.transaction.succeeded) {
			return {
				success: true
			};
		} else {
			return {
				success: false
			}
		}
	}

	async axiosRequest(url, requestBody, headers, method = null, headerAction = null) {

		method = method || 'POST';
		console.log("method", method)
		try {
			let result = await Axios({
				method: method,
				url: url,
				data: requestBody,
				headers: headers,
			});


			let logData = {};
			logData['url'] = url
			logData['requestBody'] = requestBody
			logData['headers'] = headers
			logData['responce'] = result.data;
			let fileName = `Payment-${headerAction}-${new Date().getTime()}`;
			Activity.createlogFile(fileName, logData, 'payment');
			return result.data;
		} catch (error) {
			let logData = {};
			logData['url'] = url
			logData['requestBody'] = requestBody
			logData['headers'] = headers
			logData['responce'] = error;
			let fileName = `Failed-Payment-${headerAction}-${new Date().getTime()}`;
			Activity.createlogFile(fileName, logData, 'payment');
			console.log(error.response.status);

			return {
				transaction: { succeeded: false },
				logFile : fileName,
				meta_data: error.responce
				
			}
			// if (typeof error.response !== "undefined") {
			// 	switch (error.response.status) {
			// 		case 404:
			// 			throw new NotFoundException(error.response.message);
			// 		case 409:
			// 			throw new ConflictException(error.response.message);
			// 		case 422:
			// 			return {transaction:{succeeded:false}}
			// 		case 403:
			// 			return {transaction:{succeeded:false}}
			// 		case 402:
			// 			return {transaction:{succeeded:false}}
			// 		case 500:
			// 			throw new InternalServerErrorException(error.response.message);
			// 		case 406:
			// 			throw new NotAcceptableException(error.response.message);
			// 		case 404:
			// 			throw new NotFoundException(error.response.message);
			// 		case 401:
			// 			throw new UnauthorizedException(error.response.message);
			// 		default:
			// 			throw new InternalServerErrorException(
			// 				`${error.message}&&&id&&&${error.Message}`
			// 			);
			// 	}
			// }
			// throw new InternalServerErrorException(
			// 	`${error.message}&&&id&&&${errorMessage}`
			// );
		}
	}

	async getPayment(card_token, amount, currency_code) {
		const GatewayCredantial = await Generic.getPaymentCredential()

		const gatewayToken = GatewayCredantial.credentials.token;
		const authorization = GatewayCredantial.credentials.authorization;
		const transactionMode = GatewayCredantial.gateway_payment_mode;

		const headers = {
			Accept: "application/json",
			Authorization: authorization,
		}

		let url = `https://core.spreedly.com/v1/gateways/${gatewayToken}/purchase.json`;
		let requestBody = {
			transaction: {
				payment_method_token: card_token,
				amount: amount,
				currency_code: currency_code,
			},
		};
		let authResult = await this.axiosRequest(url, requestBody, headers, null, 'capture-payment');
		console.log(authResult);
		if (typeof authResult.transaction != 'undefined' && authResult.transaction.succeeded) {
			return {
				status: true,
				token: authResult.transaction.token,
				meta_data: authResult,
			};
		} else {
			console.log(authResult);

			return {
				status: false,
				meta_data: authResult,
			};
		}


	}


	async createTransaction(creteTransactionDto: CreteTransactionDto, createdBy: string) {
		const {
			bookingId,
			userId,
			card_token,
			currencyId,
			amount,
			paidFor,
			note } = creteTransactionDto;

		const result = await this.getPayment(card_token, amount, "USD")


		const transaction = new OtherPayments;

		transaction.bookingId = bookingId;
		transaction.userId = userId;
		transaction.currencyId = currencyId;
		transaction.amount = `${amount}`;
		transaction.paidFor = paidFor
		transaction.comment = note
		transaction.transactionId = result.token
		transaction.paymentInfo = result.meta_data
		transaction.paymentStatus = result.status == true ? PaymentStatus.CONFIRM : PaymentStatus.FAILED;
		transaction.createdBy = createdBy
		transaction.createdDate = new Date()

		const transactionData = await transaction.save();

		return transactionData;
	}
}
