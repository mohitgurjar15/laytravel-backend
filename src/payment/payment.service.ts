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
import { BookingRepository } from "src/booking/booking.repository";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class PaymentService {
	constructor(
		@InjectRepository(BookingRepository)
		private bookingRepository: BookingRepository,
	) {}
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

		let url = `https://core.spreedly.com/v1/gateways/${gatewayToken}/authorize.json`;
		let requestBody = {
			transaction: {
				payment_method_token: card_id,
				amount: amount,
				currency_code: "USD",
			},
		};
		let authResult = await this.axiosRequest(url, requestBody);
		console.log(authResult)
		if (typeof authResult.transaction!='undefined' && authResult.transaction.succeeded) {
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

		let url = `https://core.spreedly.com/v1/transactions/${authorizeToken}/capture.json`;
		let requestBody = {};
		let captureRes = await this.axiosRequest(url, requestBody);
		if (typeof captureRes.transaction!='undefined' && captureRes.transaction.succeeded) {
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

		let url = `https://core.spreedly.com/v1/transactions/${captureToken}/void.json`;
		let requestBody = {};
		let voidRes = await this.axiosRequest(url, requestBody);
		if (typeof voidRes.transaction!='undefined' && voidRes.transaction.succeeded) {
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

	async retainCard(cardToken){
		let url = `https://core.spreedly.com/v1/payment_methods/${cardToken}/retain.json`;
		let requestBody = {};
		let retainRes = await this.axiosRequest(url, requestBody,null,'PUT');
		if (typeof retainRes!='undefined' && retainRes.transaction.succeeded) {
			return {
				success : true
			};
		} else {
			return{
				success : false
			}
		}
	}

	async axiosRequest(url, requestBody, headers = null, method=null) {

		method = method || 'POST';
		console.log("method",method)
		try {
			let result = await Axios({
				method: method,
				url: url,
				data: requestBody,
				headers: {
					Accept: "application/json",
					Authorization:
						"Basic OUtHTXZSVGNHZmJRa2FIUVUwZlBscjJqblE4OmlPZGFRQTJiRzNiNFVDUmtha3dGS3dlNTBmb29ZSnAxdmtLdWxtZ01rTnU4YTc0NWhWSEo0WWlVZDlSdUptdm8=",
				},
			});
			//console.log("=========================",result)
			return result.data;
		} catch (exception) {
			
			throw new InternalServerErrorException(`${exception.message}&&&card&&&${errorMessage}`)
			//console.log("exception",exception.message)
		}
	}
	
}
