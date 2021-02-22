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
import * as config from "config";
const mailConfig = config.get("email");
import { MailerService } from "@nestjs-modules/mailer";
import { getConnection, getManager } from "typeorm";
import * as uuidValidator from "uuid-validate"
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
import { Booking } from "src/entity/booking.entity";
import { BookingStatus } from "src/enum/booking-status.enum";
import { BookingType } from "src/enum/booking-type.enum";
import { ManullyTakePaymentDto } from "./dto/manully-take-payment.dto";
import { CartBooking } from "src/entity/cart-booking.entity";
import { FailedPaymentAttempt } from "src/entity/failed-payment-attempt.entity";
import { DateTime } from "src/utility/datetime.utility";
import { PushNotification } from "src/utility/push-notification.utility";
import { WebNotification } from "src/utility/web-notification.utility";
import { BookingInstalments } from "src/entity/booking-instalments.entity";
import { InstalmentStatus } from "src/enum/instalment-status.enum";
import { InstallmentRecevied } from "src/config/new_email_templete/installment-recived.html";
import { TwilioSMS } from "src/utility/sms.utility";
import { CartDataUtility } from "src/utility/cart-data.utility";
import { LaytripCartBookingComplationMail } from "src/config/new_email_templete/cart-completion-mail.html";


@Injectable()
export class PaymentService {
	constructor(
		private readonly mailerService: MailerService,
		// @InjectRepository(BookingRepository)
		// private bookingRepository: BookingRepository,
	) { }
	async saveCard(saveCardDto: SaveCardDto, userId: string, guest_id) {
		const {
			card_holder_name,
			card_last_digit,
			card_type,
			card_token,
			card_meta
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
		if (userId) {
			if (!uuidValidator(userId)) {
				throw new NotFoundException('Given user_id not avilable&&&userId&&&' + errorMessage)
			}
			userCard.userId = userId;
		} else {
			if (!uuidValidator(guest_id)) {
				throw new NotFoundException('Given guest_id not avilable&&&userId&&&' + errorMessage)
			}
			userCard.guestUserId = guest_id;
		}

		userCard.cardHolderName = card_holder_name;
		userCard.cardDigits = card_last_digit;
		userCard.cardToken = card_token;
		userCard.cardType = card_type;
		userCard.cardMetaData = card_meta || {};
		userCard.createdDate = new Date();

		try {
			return await userCard.save();
		} catch (exception) {
			throw new InternalServerErrorException(errorMessage);
		}
	}

	async getAllCards(userId: string, guest_id) {
		let where
		if (userId) {
			if (!uuidValidator(userId)) {
				throw new NotFoundException('Given user_id not avilable&&&userId&&&' + errorMessage)
			}
			where = `user_card.user_id = '${userId}' and user_card.is_deleted= false`
		} else {
			if (!uuidValidator(guest_id)) {
				throw new NotFoundException('Given guest_id not avilable&&&userId&&&' + errorMessage)
			}
			where = `user_card.guest_user_id = '${guest_id}' and user_card.is_deleted= false`
		}

		let cardList = await getManager()
			.createQueryBuilder(UserCard, "user_card")
			.select([
				"user_card.userId",
				"user_card.guestUserId",
				"user_card.id",
				"user_card.cardHolderName",
				"user_card.cardDigits",
				"user_card.cardToken",
				"user_card.cardType",
				"user_card.status",
				"user_card.cardMetaData"
			])
			.where(where)
			.getMany();

		if (!cardList.length) throw new NotFoundException(`No card founds`);

		return cardList;
	}

	async addCard(addCardDto: AddCardDto, userId: string, guest_id) {


		const { first_name, last_name, card_number, card_cvv, expiry } = addCardDto;

		if (userId) {
			if (!uuidValidator(userId)) {
				throw new NotFoundException('Given user_id not avilable&&&userId&&&' + errorMessage)
			}
		} else {
			if (!uuidValidator(guest_id)) {
				throw new NotFoundException('Given guest_id not avilable&&&userId&&&' + errorMessage)
			}
		}

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

		//console.log(cardResult);
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
			if (userId) {
				userCard.userId = userId;
			} else {
				userCard.guestUserId = guest_id;
			}

			userCard.cardHolderName = cardResult.transaction.payment_method.full_name;
			userCard.cardDigits =
				cardResult.transaction.payment_method.last_four_digits;
			userCard.cardToken = cardResult.transaction.payment_method.token;
			userCard.cardType = cardResult.transaction.payment_method.card_type;
			userCard.createdDate = new Date();
			userCard.cardMetaData = cardResult?.transaction?.payment_method

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
		// //console.log(authResult)
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
		//console.log("method", method)
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
			//console.log(error.response.status);

			return {
				transaction: { succeeded: false },
				logFile: fileName,
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
		//console.log(authResult);
		if (typeof authResult.transaction != 'undefined' && authResult.transaction.succeeded) {
			return {
				status: true,
				token: authResult.transaction.token,
				meta_data: authResult,
			};
		} else {
			//console.log(authResult);

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

	async deleteCard(cardId: string, user: User) {
		let card = await getManager()
			.createQueryBuilder(UserCard, "user_card")
			.where(
				"user_card.user_id = :user_id and user_card.is_deleted=:is_deleted and id =:cardId",
				{ user_id: user.userId, is_deleted: false, cardId }
			)
			.getOne();

		if (!card) throw new NotFoundException(`No card founds`);

		let booking = await getManager()
			.createQueryBuilder(Booking, "booking")
			.where(`booking_type=:booking_type AND card_token=:card_token AND check_in_date >=:today AND user_id =:user_id AND payment_status=:paymentStatus`, {
				booking_type: BookingType.INSTALMENT,
				card_token: card.cardToken,
				today: new Date(),
				user_id: user.userId,
				paymentStatus: PaymentStatus.PENDING
			})
			.getOne()
		if (booking) {
			throw new ConflictException(`Sorry you can't delete this card, it's already used in your booking`)
		}

		card.isDeleted = true
		await card.save()
		return {
			message: `Your card deleted successfully`
		}
	}


	async checkCardPendingPayment(cardId: string, user: User) {
		let card = await getManager()
			.createQueryBuilder(UserCard, "user_card")
			.where(
				"user_card.user_id = :user_id and user_card.is_deleted=:is_deleted and id =:cardId",
				{ user_id: user.userId, is_deleted: false, cardId }
			)
			.getOne();

		if (!card) throw new NotFoundException(`Card id not founds`);

		let booking = await getManager()
			.createQueryBuilder(Booking, "booking")
			.where(`booking_type=:booking_type AND card_token=:card_token AND check_in_date >=:today AND user_id =:user_id AND payment_status=:paymentStatus AND booking_status < ${BookingStatus.FAILED}`, {
				booking_type: BookingType.INSTALMENT,
				card_token: card.cardToken,
				today: new Date(),
				user_id: user.userId,
				paymentStatus: PaymentStatus.PENDING
			})
			.select(["booking.laytripBookingId"])
			.getMany()
		if (booking.length) {
			return {
				pendingTransaction: true,
				bookingIds: booking
			}
		}

		return {
			pendingTransaction: false
		}
	}

	async updateCard(cardId, addCardDto: AddCardDto, user: User) {
		let card = await getManager()
			.createQueryBuilder(UserCard, "user_card")
			.where(
				"user_card.user_id = :user_id and user_card.is_deleted=:is_deleted and id =:cardId",
				{ user_id: user.userId, is_deleted: false, cardId }
			)
			.getOne();

		if (!card) throw new NotFoundException(`Card id not founds`);
		const newCard = await this.addCard(addCardDto, user.userId, '')
		await getConnection()
			.createQueryBuilder()
			.update(Booking)
			.set({ cardToken: newCard.cardToken })
			.where(`booking_type=:booking_type AND card_token=:card_token AND check_in_date >=:today AND user_id =:user_id AND payment_status=:paymentStatus AND booking_status < ${BookingStatus.FAILED}`, {
				booking_type: BookingType.INSTALMENT,
				card_token: card.cardToken,
				today: new Date(),
				user_id: user.userId,
				paymentStatus: PaymentStatus.PENDING
			})
			.execute();
		card.isDeleted = true
		await card.save()
		return {
			message: `Your card update successfully`,
			data: newCard
		}

	}

	async manuallyTakePayment(manullyTakePaymentDto: ManullyTakePaymentDto, admin: User) {
		try {
			const { user_id, cart_id, card_token, installmentDates } = manullyTakePaymentDto

			if (!uuidValidator(user_id)) {
				throw new NotFoundException('Given user_id not avilable&&&userId&&&' + errorMessage)
			}
			let instalmentDate = []
			for await (const record of installmentDates) {
				instalmentDate.push(record.installment_date)
			}
			let cart = await getConnection()
				.createQueryBuilder(CartBooking, "cart")
				.leftJoinAndSelect("cart.bookings", "booking")
				.leftJoinAndSelect("booking.bookingInstalments", "BookingInstalments")
				.leftJoinAndSelect("booking.currency2", "currency")
				.leftJoinAndSelect("cart.user", "User")
				.where(`"BookingInstalments"."instalment_date" in (:...instalmentDate) AND "BookingInstalments"."payment_status" != ${PaymentStatus.CONFIRM} AND "cart"."user_id" = '${user_id}' AND "cart"."laytrip_cart_id" = '${cart_id}' AND "cart"."booking_type" = ${BookingType.INSTALMENT}`, { instalmentDate })
				.getOne();

			if (!cart) {
				throw new NotFoundException(`We could not found any installments for given installment dates`);
			}

			const currency = cart.bookings[0].currency2
			let totalAmount: number = 0
			for await (const booking of cart.bookings) {
				for await (const installment of booking.bookingInstalments) {
					totalAmount += parseFloat(installment.amount)
				}
			}
			let currencyCode = currency.code
			let cardToken = card_token
			const cartAmount = totalAmount
			totalAmount = totalAmount * 100
			totalAmount = Math.ceil(totalAmount)
			const currentDate = new Date()
			//console.log(cartAmount);


			if (cardToken) {
				let transaction = await this.getPayment(cardToken, totalAmount, currencyCode)

				for await (const booking of cart.bookings) {

					for await (const instalment of booking.bookingInstalments) {
						instalment.paymentStatus = transaction.status == true ? PaymentStatus.CONFIRM : PaymentStatus.PENDING
						instalment.paymentInfo = transaction.meta_data;
						instalment.transactionToken = transaction.token;
						instalment.paymentCaptureDate = new Date();
						instalment.attempt = instalment.attempt ? instalment.attempt + 1 : 1;
						instalment.instalmentStatus = transaction.status == true ? PaymentStatus.CONFIRM : PaymentStatus.PENDING
						instalment.comment = `try to get Payment by cron on ${currentDate}`
						await instalment.save()
					}
				}
				let nextDate;
				let nextAmount: number = 0;


				if (transaction.status == false) {

					let faildTransaction = new FailedPaymentAttempt()
					faildTransaction.instalmentId = cart.bookings[0].bookingInstalments[0].id
					faildTransaction.paymentInfo = transaction.meta_data
					faildTransaction.date = new Date();

					await faildTransaction.save()
					var availableTry = ''

					return {
						message: `We could not able to take your payment please try again.`
					}

				}
				else {
					for await (const booking of cart.bookings) {
						//console.log(booking.laytripBookingId);

						const nextInstalmentDate = await getManager()
							.createQueryBuilder(BookingInstalments, "BookingInstalments")
							.select(['BookingInstalments.instalmentDate', 'BookingInstalments.amount'])
							.where(`"BookingInstalments"."instalment_status" =${InstalmentStatus.PENDING} AND "BookingInstalments"."booking_id" = '${booking.id}'`)
							.orderBy(`"BookingInstalments"."id"`)
							.getOne()
						let update = { nextInstalmentDate: nextInstalmentDate?.instalmentDate || null }
						if (!nextInstalmentDate) {
							update['paymentStatus'] = PaymentStatus.CONFIRM
						}

						await getConnection()
							.createQueryBuilder()
							.update(Booking)
							.set(update)
							.where("id = :id", { id: booking.id })
							.execute();
						if (nextInstalmentDate) {
							nextAmount += nextInstalmentDate.amount ? parseFloat(nextInstalmentDate.amount) : 0
							nextDate = nextInstalmentDate.instalmentDate
						}
					}

					//console.log('installment');


					let complitedAmount = 0;
					let totalAmount = 0;
					let pendingInstallment = 0;
					for await (const booking of cart.bookings) {

						complitedAmount += parseFloat(await this.totalPaidAmount(booking.id))
						//console.log('ca');
						totalAmount += Generic.formatPriceDecimal(parseFloat(booking.totalAmount))
						//console.log('ta');
						pendingInstallment += await this.pandingInstalment(booking.id)
						//console.log('pi');
					}


					let param = {
						date: DateTime.convertDateFormat(new Date(cart.bookings[0].bookingInstalments[0].instalmentDate), 'YYYY-MM-DD', ' Do YYYY'),
						userName: cart.user.firstName + ' ' + cart.user.lastName,
						cardHolderName: transaction.meta_data.transaction.payment_method.full_name,
						cardNo: transaction.meta_data.transaction.payment_method.number,
						orderId: cart.laytripCartId,
						amount: Generic.formatPriceDecimal(cartAmount),
						installmentId: cart.bookings[0].bookingInstalments[0].id,
						complitedAmount: complitedAmount,
						totalAmount: totalAmount,
						currencySymbol: currency.symbol,
						currency: currency.code,
						pendingInstallment: pendingInstallment,
						phoneNo: `+${cart.user.countryCode}` + cart.user.phoneNo,
						bookingId: cart.laytripCartId,
						nextDate: nextDate,
						nextAmount: nextAmount,
					}
					if (cart.user.isEmail) {
						if (nextAmount > 0) {
							this.mailerService
								.sendMail({
									to: cart.user.email,
									from: mailConfig.from,
									bcc: mailConfig.BCC,
									subject: `Installment Payment Successed`,
									html: InstallmentRecevied(param),
								})
								.then((res) => {
									//console.log("res", res);
								})
								.catch((err) => {
									//console.log("err", err);
								});
						}
						else{
							const responce = await CartDataUtility.CartMailModelDataGenerate(cart.laytripCartId)
								if (responce?.param) {
									let subject = responce.param.bookingType == BookingType.INSTALMENT ? `BOOKING ID ${responce.param.orderId} CONFIRMATION` : `BOOKING ID ${responce.param.orderId} CONFIRMATION`
									this.mailerService
										.sendMail({
											to: responce.email,
											from: mailConfig.from,
											bcc: mailConfig.BCC,
											subject: subject,
											html: await LaytripCartBookingComplationMail(responce.param),
										})
										.then((res) => {
											//console.log("res", res);
										})
										.catch((err) => {
											//console.log("err", err);
										});
								}
						}

					}

					if (cart.user.isSMS) {
						TwilioSMS.sendSMS({
							toSMS: param.phoneNo,
							message: `We have received your payment of ${param.currencySymbol}${param.amount} for booking number ${param.bookingId}`
						})
					}

					// Activity.logActivity(
					// 	"1c17cd17-9432-40c8-a256-10db77b95bca",
					// 	"cron",
					// 	`${instalment.id} Payment successed by Cron`
					// );

					PushNotification.sendNotificationTouser(cart.user.userId,
						{  //you can send only notification or only data(or include both)
							module_name: 'instalment',
							task: 'instalment_received',
							bookingId: cart.laytripCartId,
							instalmentId: cart.bookings[0].bookingInstalments[0].id
						},
						{
							title: 'Installment Received',
							body: `We have received your payment of $${cartAmount}.`
						}, user_id)
					WebNotification.sendNotificationTouser(cart.user.userId,
						{  //you can send only notification or only data(or include both)
							module_name: 'instalment',
							task: 'instalment_received',
							bookingId: cart.laytripCartId,
							instalmentId: cart.bookings[0].bookingInstalments[0].id
						},
						{
							title: 'Installment Received',
							body: `We have received your payment of $${cartAmount}.`
						}, user_id)
				}
				//console.log('booking Update');

				for await (const booking of cart.bookings) {
					await this.checkAllinstallmentPaid(booking.id)
				}
				Activity.logActivity(admin.userId, "Payment", `Mannully take payment for booking = ${cart_id} , Total amount = ${totalAmount} , installmentDates = ${instalmentDate}`)
				return {
					message: `Installment take successfully `
				}
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
	async totalPaidAmount(bookingId: string) {
		var paidAmount = await getConnection().query(`
                SELECT  SUM( amount) as total_amount from booking_instalments where payment_status = ${PaymentStatus.CONFIRM} AND booking_id = '${bookingId}'  
			`);
		return paidAmount[0].total_amount
	}
	async pandingInstalment(bookingId) {
		let query = await getManager()
			.createQueryBuilder(BookingInstalments, "instalment")
			.where(`"instalment"."booking_id" = '${bookingId}' AND "instalment"."payment_status" = '${PaymentStatus.PENDING}'`)
			.getCount();
		return query
	}
	async checkAllinstallmentPaid(bookingId) {

		let query = await getManager()
			.createQueryBuilder(BookingInstalments, "BookingInstalments")
			.where(`booking_id = '${bookingId}' AND payment_status != ${PaymentStatus.CONFIRM}`)
			.getCount()
		if (query <= 0) {
			await getConnection()
				.createQueryBuilder()
				.update(Booking)
				.set({ paymentStatus: PaymentStatus.CONFIRM, nextInstalmentDate: '' })
				.where("id = :id", { id: bookingId })
				.execute();
		}

	}


}
