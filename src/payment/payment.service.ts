import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
    ConflictException,
    ForbiddenException,
    NotAcceptableException,
    UnauthorizedException,
    Inject,
    CACHE_MANAGER,
} from "@nestjs/common";
import { SaveCardDto } from "./dto/save-card.dto";
import * as config from "config";
const mailConfig = config.get("email");
import { MailerService } from "@nestjs-modules/mailer";
import { getConnection, getManager } from "typeorm";
import * as uuidValidator from "uuid-validate";
import { PaymentGateway } from "src/entity/payment-gateway.entity";
import { errorMessage } from "src/config/common.config";
import { UserCard } from "src/entity/user-card.entity";
import { v4 as uuidv4 } from "uuid";
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
import { LaytripInstallmentRecevied } from "src/config/new_email_templete/laytrip_installment-recived.html";
import { TwilioSMS } from "src/utility/sms.utility";
import { Cache } from "cache-manager";
import { CartDataUtility } from "src/utility/cart-data.utility";
import { LaytripCartBookingComplationMail } from "src/config/new_email_templete/cart-completion-mail.html";
import { AuthoriseCartDto } from "./dto/authorise-card-for-booking.dto";
import { ModulesName } from "src/enum/module.enum";
import { Cart } from "src/entity/cart.entity";
import { PaymentType } from "src/enum/payment-type.enum";
import { InstalmentType } from "src/enum/instalment-type.enum";
import { Instalment } from "src/utility/instalment.utility";
import { isUUID, Length, length } from "class-validator";
import { isNull } from "util";
import { User } from "src/entity/user.entity";
import { LaytripPaymentMethodChangeMail } from "src/config/new_email_templete/laytrip_payment-method-change-mail.html";
import { Role } from "src/enum/role.enum";
import { ListPaymentUserDto } from "./dto/list-payment-user.dto";

@Injectable()
export class PaymentService {
    constructor(
        private readonly mailerService: MailerService //@Inject(CACHE_MANAGER) private readonly cacheManager: Cache, // @InjectRepository(BookingRepository) // private bookingRepository: BookingRepository,
    ) { }
    async defaultCard(cardId: string, userId: string, guest_id, referralId) {
        try {
            if (!uuidValidator(cardId)) {
                throw new NotFoundException(
                    "No payment cards found.&&&card_id&&&" + errorMessage
                );
            }
            let whr;
            let whereForUncheck;
            if (userId) {
                if (!uuidValidator(userId)) {
                    throw new NotFoundException(
                        "Given user id not avilable&&&user_id&&&" + errorMessage
                    );
                }
                whr = `user_id = '${userId}' AND id = '${cardId}' `;
                whereForUncheck = `user_id = '${userId}'`;
            } else {
                if (!uuidValidator(userId)) {
                    throw new NotFoundException(
                        "Given guest id not avilable&&&guest_id&&&" +
                        errorMessage
                    );
                }
                whr = `guest_user_id = '${guest_id}' AND id = '${cardId}'`;
                whereForUncheck = `guest_user_id = '${guest_id}'`;
            }
            let card = await getManager()
                .createQueryBuilder(UserCard, "card")
                .where(whr)
                .getOne();
            if (!card) {
                throw new NotFoundException("No payment cards found.");
            }

            await getConnection()
                .createQueryBuilder()
                .update(UserCard)
                .set({ isDefault: false })
                .where(whereForUncheck)
                .execute();

            await getConnection()
                .createQueryBuilder()
                .update(UserCard)
                .set({ isDefault: true })
                .where(whr)
                .execute();
            if (userId) {
                const user = await getManager()
                    .createQueryBuilder(User, "user")
                    .where(`user_id = '${userId}'`)
                    .getOne();
                if (user) {
                    this.mailerService
                        .sendMail({
                            to: user.email,
                            from: mailConfig.from,
                            bcc: mailConfig.BCC,
                            subject: `Payment Method Change Confirmation`,
                            html: await LaytripPaymentMethodChangeMail({
                                username: user.firstName || "",
                            }, referralId),
                        })
                        .then((res) => {
                            console.log("res", res);
                        })
                        .catch((err) => {
                            console.log("err", err);
                        });
                }
            }

            return {
                message: `Card successfully updated as a default card`,
            };
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 400:
                        throw new BadRequestException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
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

    async saveCard(saveCardDto: SaveCardDto, userId: string, guest_id) {
        try {
            const {
                card_holder_name,
                card_last_digit,
                card_type,
                card_token,
                card_meta,
            } = saveCardDto;

            let paymentGateway = await getManager()
                .createQueryBuilder(PaymentGateway, "paymentgateway")
                .where("paymentgateway.gateway_name = :name ", {
                    name: "stripe",
                })
                .getOne();
            if (!paymentGateway) {
                throw new BadRequestException(
                    `Payment gateway is not configured in database&&&payment_gateway_id&&&${errorMessage}`
                );
            }
            let timeStamp = new Date().getTime() - 20000;
            let whr;
            if (userId) {
                whr = `user_id = '${userId}' AND ("timeStamp" >= ${timeStamp} OR "card_digits" = '${card_last_digit}') AND "card_type" = '${card_type}' AND is_deleted = false`;
            } else {
                whr = `guest_user_id = '${guest_id}' AND ("timeStamp" >= ${timeStamp} OR "card_digits" = '${card_last_digit}') AND "card_type" = '${card_type}' AND is_deleted = false`;
            }
            let lastAddedCard = await getManager()
                .createQueryBuilder(UserCard, "card")
                .where(whr)
                .getOne();
            if (lastAddedCard) {
                if (lastAddedCard.timeStamp >= timeStamp) {
                    throw new NotAcceptableException(
                        `You may add new card after 10 second`
                    );
                } else {
                    throw new ConflictException(
                        `Card already exists, Please try with other card.`
                    );
                }
            }
            let wher;
            if (userId) {
                wher = `user_id = '${userId}' AND is_deleted = false`;
            } else {
                wher = `guest_user_id = '${guest_id}' AND is_deleted = false`;
            }
            let totalCard = await getManager()
                .createQueryBuilder(UserCard, "card")
                .where(wher)
                .getCount();
            if (totalCard >= 5) {
                throw new BadRequestException(
                    `Maximum 5 Cards, please delete one`
                );
            }

            await this.retainCard(card_token, userId || guest_id);

            let authoriseCode = await this.authorizeCard(
                card_token,
                50,
                "USD",
                "",
                "",
                userId || guest_id,
                userId || guest_id,
                true
            );
            if (authoriseCode.status == false) {
                throw new BadRequestException(
                    `Card failed at authorization. Please correct card detail.&&&card_failed&&&Card failed at authorization. Please correct card detail.`
                );
            }
            let userCard = new UserCard();
            userCard.id = uuidv4();
            userCard.paymentGatewayId = paymentGateway.id;
            if (userId) {
                if (!uuidValidator(userId)) {
                    throw new NotFoundException(
                        "Given user_id not avilable&&&userId&&&" + errorMessage
                    );
                }
                userCard.userId = userId;
            } else {
                if (!uuidValidator(guest_id)) {
                    throw new NotFoundException(
                        "Given guest_id not avilable&&&userId&&&" + errorMessage
                    );
                }
                userCard.guestUserId = guest_id;
            }

            userCard.cardHolderName = card_holder_name;
            userCard.cardDigits = card_last_digit;
            userCard.cardToken = card_token;
            userCard.cardType = card_type;
            userCard.cardMetaData = card_meta || {};
            userCard.createdDate = new Date();
            userCard.timeStamp = new Date().getTime();
            userCard.isDefault = totalCard == 0 ? true : false;

            this.voidCard(authoriseCode.token, userId || guest_id);
            return await userCard.save();
        } catch (error) {
            if (typeof error.response !== "undefined") {
                switch (error.response.statusCode) {
                    case 404:
                        throw new NotFoundException(error.response.message);
                    case 409:
                        throw new ConflictException(error.response.message);
                    case 422:
                        throw new BadRequestException(error.response.message);
                    case 400:
                        throw new BadRequestException(error.response.message);
                    case 403:
                        throw new ForbiddenException(error.response.message);
                    case 500:
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
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

    async getAllCards(userId: string, guest_id) {
        let where;
        if (userId) {
            if (!uuidValidator(userId)) {
                throw new NotFoundException(
                    "Given user_id not avilable&&&userId&&&" + errorMessage
                );
            }
            where = `user_card.user_id = '${userId}' and user_card.is_deleted= false`;
        } else {
            if (!uuidValidator(guest_id)) {
                throw new NotFoundException(
                    "Given guest_id not avilable&&&userId&&&" + errorMessage
                );
            }
            where = `user_card.guest_user_id = '${guest_id}' and user_card.is_deleted= false`;
        }

        let cardList = await getManager()
            .createQueryBuilder(UserCard, "user_card")
            .select([
                "user_card.userId",
                "user_card.guestUserId",
                "user_card.id",
                "user_card.isDefault",
                "user_card.cardHolderName",
                "user_card.cardDigits",
                "user_card.cardToken",
                "user_card.cardType",
                "user_card.status",
                "user_card.cardMetaData",
            ])
            .where(where)
            .limit(5)
            .getMany();

        if (!cardList.length)
            throw new NotFoundException(`No payment cards found.`);

        return cardList;
    }

    async addCard(addCardDto: AddCardDto, userId: string, guest_id) {
        const {
            first_name,
            last_name,
            card_number,
            card_cvv,
            expiry,
        } = addCardDto;

        if (userId) {
            if (!uuidValidator(userId)) {
                throw new NotFoundException(
                    "Given user_id not avilable&&&userId&&&" + errorMessage
                );
            }
        } else {
            if (!uuidValidator(guest_id)) {
                throw new NotFoundException(
                    "Given guest_id not avilable&&&userId&&&" + errorMessage
                );
            }
        }

        let expiryDate = expiry.split("/");

        const GatewayCredantial = await Generic.getPaymentCredential();

        const authorization = GatewayCredantial.credentials.authorization;

        const headers = {
            Accept: "application/json",
            Authorization: authorization,
        };

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
        let cardResult = await this.axiosRequest(
            url,
            requestBody,
            headers,
            null,
            "add-card",
            userId || guest_id
        );

        //console.log(cardResult);
        if (
            typeof cardResult != "undefined" &&
            typeof cardResult.transaction != "undefined" &&
            cardResult.transaction.succeeded
        ) {
            let paymentGateway = await getManager()
                .createQueryBuilder(PaymentGateway, "paymentgateway")
                .where("paymentgateway.gateway_name = :name ", {
                    name: "stripe",
                })
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

            userCard.cardHolderName =
                cardResult.transaction.payment_method.full_name;
            userCard.cardDigits =
                cardResult.transaction.payment_method.last_four_digits;
            userCard.cardToken = cardResult.transaction.payment_method.token;
            userCard.cardType = cardResult.transaction.payment_method.card_type;
            userCard.createdDate = new Date();
            userCard.cardMetaData = cardResult?.transaction?.payment_method;

            try {
                return await userCard.save();
            } catch (exception) {
                throw new InternalServerErrorException(errorMessage);
            }
        } else {
            throw new BadRequestException(`No payment cards found.`);
        }
    }

    async authorizeCard(
        card_id,
        amount,
        currency_code,
        browser_info?: any,
        redirection: string = "",
        userId?: string,
        description = "",
        is_2ds = false
    ) {
        const GatewayCredantial = await Generic.getPaymentCredential();

        let gatewayToken = GatewayCredantial.credentials.token;
        const authorization = GatewayCredantial.credentials.authorization;
        const transactionMode = GatewayCredantial.gateway_payment_mode;

        if (is_2ds == true) {
            gatewayToken =
                GatewayCredantial.credentials.token_without_3ds ||
                GatewayCredantial.credentials.token;
        }

        const headers = {
            Accept: "application/json",
            Authorization: authorization,
        };

        let transaction = {
            payment_method_token: card_id,
            amount: amount,
            currency_code: currency_code,
            description: description,
        };

        if (redirection != "") {
            let threeDS = {
                redirect_url: redirection,
                callback_url: redirection,
                three_ds_version: "2",
                attempt_3dsecure: true,
                browser_info,
            };

            transaction = {
                ...transaction,
                ...threeDS,
            };
        }

        let url = `https://core.spreedly.com/v1/gateways/${gatewayToken}/authorize.json`;
        let requestBody = {
            transaction,
        };
        let authResult = await this.axiosRequest(
            url,
            requestBody,
            headers,
            null,
            "authorise-card",
            userId
        );
        // console.log(authResult, "1222")
        if (
            typeof authResult.transaction != "undefined" &&
            authResult.transaction.succeeded
        ) {
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

    async captureCard(authorizeToken, userId, partialAmount = 0) {
        const GatewayCredantial = await Generic.getPaymentCredential();

        const authorization = GatewayCredantial.credentials.authorization;

        const headers = {
            Accept: "application/json",
            Authorization: authorization,
        };

        let url = `https://core.spreedly.com/v1/transactions/${authorizeToken}/capture.json`;
        let requestBody = {};
        if (partialAmount > 0){
            requestBody = {
                transaction: {
                    amount: partialAmount,
                    currency_code: 'USD',
                },
            };
        }
        let captureRes = await this.axiosRequest(
            url,
            requestBody,
            headers,
            null,
            "capture-card",
            userId
        );

        if (
            typeof captureRes.transaction != "undefined" &&
            captureRes.transaction.succeeded
        ) {
            return {
                status: true,
                token: captureRes.transaction.token,
                meta_data: captureRes,
                reference_token: captureRes.transaction?.reference_token,
                logFile: captureRes['fileName']
            };
        } else {
            return {
                status: false,
                meta_data: captureRes,
                logFile: captureRes['fileName']
            };
        }
    }

    async voidCard(captureToken, userId) {
        const GatewayCredantial = await Generic.getPaymentCredential();

        const authorization = GatewayCredantial.credentials.authorization;

        const headers = {
            Accept: "application/json",
            Authorization: authorization,
        };
        let url = `https://core.spreedly.com/v1/transactions/${captureToken}/void.json`;
        let requestBody = {};
        let voidRes = await this.axiosRequest(
            url,
            requestBody,
            headers,
            null,
            "void-card",
            userId
        );
        if (
            typeof voidRes.transaction != "undefined" &&
            voidRes.transaction.succeeded
        ) {
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

    async verifyAuth(transaction_token, userId) {
        const GatewayCredantial = await Generic.getPaymentCredential();

        const authorization = GatewayCredantial.credentials.authorization;

        const headers = {
            Accept: "application/json",
            Authorization: authorization,
        };

        let url = `https://core.spreedly.com/v1/transactions/${transaction_token}.json`;
        let requestBody = {};
        let verifyAuthRes = await this.axiosRequest(
            url,
            requestBody,
            headers,
            "GET",
            "verify-auth",
            userId
        );
        console.log("verifyAuthRes", verifyAuthRes)
        if (
            typeof verifyAuthRes != "undefined" &&
            verifyAuthRes.transaction.succeeded
        ) {
            return {
                success: true,
            };
        } else {
            return {
                success: false,
            };
        }
    }

    async retainCard(cardToken, userId) {
        const GatewayCredantial = await Generic.getPaymentCredential();

        const authorization = GatewayCredantial.credentials.authorization;

        const headers = {
            Accept: "application/json",
            Authorization: authorization,
        };

        let url = `https://core.spreedly.com/v1/payment_methods/${cardToken}/retain.json`;
        let requestBody = {};
        let retainRes = await this.axiosRequest(
            url,
            requestBody,
            headers,
            "PUT",
            "retain-card",
            userId
        );
        if (
            typeof retainRes != "undefined" &&
            retainRes.transaction.succeeded
        ) {
            return {
                success: true,
            };
        } else {
            return {
                success: false,
            };
        }
    }

    async axiosRequest(
        url,
        requestBody,
        headers,
        method = null,
        headerAction = null,
        userId
    ) {
        method = method || "POST";
        //console.log("method", method)
        try {
            let requestTime = `${new Date()}`;
            let result = await Axios({
                method: method,
                url: url,
                data: requestBody,
                headers: headers,
            });
            let logData = {};
            logData["url"] = url;
            logData["requestBody"] = requestBody;
            logData["headers"] = headers;
            logData["requestTime"] = requestTime;
            let responceTime = `${new Date()}`;
            logData["responceTime"] = responceTime;
            logData["responce"] = result.data;
            let fileName = `Payment-${headerAction}-${new Date().getTime()}`;
            if (userId) {
                fileName += "_" + userId;
            }
            Activity.createlogFile(fileName, logData, "payment");
            result.data['fileName'] = `${fileName}.json`;
            return result.data;
        } catch (error) {
            let logData = {};
            logData["url"] = url;
            logData["requestBody"] = requestBody;
            logData["headers"] = headers;
            logData["responce"] = error?.data;
            logData["error"] = error;
            logData["message"] = error?.message;
            let fileName = `Failed-Payment-${headerAction}-${new Date().getTime()}`;
            if (userId) {
                fileName += "_" + userId;
            }
            Activity.createlogFile(fileName, logData, "payment");
            //console.log(error.response.status);

            return {
                transaction: { succeeded: false },
                logFile: fileName,
                meta_data: error.responce,
            };
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

    async getPayment(card_token, amount, currency_code, userId, is_2ds = true) {
        const GatewayCredantial = await Generic.getPaymentCredential();

        let gatewayToken = GatewayCredantial.credentials.token;
        const authorization = GatewayCredantial.credentials.authorization;
        const transactionMode = GatewayCredantial.gateway_payment_mode;

        if (is_2ds == true) {
            gatewayToken =
                GatewayCredantial.credentials.token_without_3ds ||
                GatewayCredantial.credentials.token;
        }

        const headers = {
            Accept: "application/json",
            Authorization: authorization,
        };

        let url = `https://core.spreedly.com/v1/gateways/${gatewayToken}/purchase.json`;
        let requestBody = {
            transaction: {
                payment_method_token: card_token,
                amount: amount,
                currency_code: currency_code,
            },
        };
        let authResult = await this.axiosRequest(
            url,
            requestBody,
            headers,
            null,
            "capture-payment",
            userId
        );
        //console.log(authResult);
        if (
            typeof authResult.transaction != "undefined" &&
            authResult.transaction.succeeded
        ) {
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

    async createTransaction(
        creteTransactionDto: CreteTransactionDto,
        createdBy: string
    ) {
        const {
            bookingId,
            userId,
            card_token,
            currencyId,
            amount,
            paidFor,
            travelerInfoId,
            note,
            productId,
        } = creteTransactionDto;
        try {
            if (!isUUID(userId)) {
                throw new BadRequestException(`Given user id not exiest.`);
            }
            let cart: CartBooking;
            if (bookingId) {
                cart = await getConnection()
                    .createQueryBuilder(CartBooking, "cartBooking")
                    .where(
                        `laytrip_cart_id = '${bookingId}' AND user_id = '${userId}'`
                    )
                    .getOne();
                if (!cart) {
                    throw new BadRequestException(
                        `Given booking id not exiest for selected user.`
                    );
                }
            }
            let booking: Booking;
            if (productId) {
                let whr = `laytrip_booking_id = '${productId}' AND user_id = '${userId}'`;
                if (cart) {
                    whr += `AND cart_id = '${cart.id}'`;
                }
                booking = await getConnection()
                    .createQueryBuilder(Booking, "booking")
                    .where(whr)
                    .getOne();
                if (!booking) {
                    throw new BadRequestException(
                        `Given product id not exiest.`
                    );
                }
            }
            const result = await this.getPayment(
                card_token,
                Math.ceil(amount * 100),
                "USD",
                createdBy,
                true
            );

            const transaction = new OtherPayments();

            transaction.bookingId = booking?.id || null;
            transaction.cartBookingId = cart?.id || null;
            transaction.userId = userId;
            transaction.travelerInfoId = travelerInfoId || null;
            transaction.currencyId = currencyId;
            transaction.amount = `${amount}`;
            transaction.paidFor = paidFor;
            transaction.comment = note;
            transaction.transactionId = result.token;
            transaction.paymentInfo = result.meta_data;
            transaction.paymentStatus =
                result.status == true
                    ? PaymentStatus.CONFIRM
                    : PaymentStatus.FAILED;
            transaction.createdBy = createdBy;
            transaction.createdDate = new Date();

            const transactionData = await transaction.save();

            return transactionData;
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
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
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

    async deleteCard(cardId: string, user: User) {
        let where = `is_deleted = false and id = '${cardId}'`;
        if (user.roleId >= Role.PAID_USER) {
            if (user.roleId == Role.GUEST_USER) {
                where += `and guest_user_id = '${user.userId}'`;
            } else {
                where += `and user_id = '${user.userId}'`;
            }
        }
        let card = await getManager()
            .createQueryBuilder(UserCard, "user_card")
            .where(where)
            .getOne();

        if (!card) throw new NotFoundException(`No card founds`);

        let booking = await getManager()
            .createQueryBuilder(Booking, "booking")
            .where(
                `booking_type=:booking_type AND card_token=:card_token AND check_in_date >=:today AND payment_status=:paymentStatus`,
                {
                    booking_type: BookingType.INSTALMENT,
                    card_token: card.cardToken,
                    today: new Date(),
                    user_id: user.userId,
                    paymentStatus: PaymentStatus.PENDING,
                }
            )
            .getOne();
        if (booking) {
            throw new ConflictException(
                `Sorry you can't delete this card, it's already used in your booking`
            );
        }

        card.isDeleted = true;
        await card.save();
        return {
            message: `Your card deleted successfully`,
        };
    }

    async checkCardPendingPayment(cardId: string, user: User) {
        let card = await getManager()
            .createQueryBuilder(UserCard, "user_card")
            .where(
                "user_card.user_id = :user_id and user_card.is_deleted=:is_deleted and id =:cardId",
                { user_id: user.userId, is_deleted: false, cardId }
            )
            .getOne();

        if (!card) throw new NotFoundException(`Invalid payment card.`);

        let booking = await getManager()
            .createQueryBuilder(Booking, "booking")
            .where(
                `booking_type=:booking_type AND card_token=:card_token AND check_in_date >=:today AND user_id =:user_id AND payment_status=:paymentStatus AND booking_status < ${BookingStatus.FAILED}`,
                {
                    booking_type: BookingType.INSTALMENT,
                    card_token: card.cardToken,
                    today: new Date(),
                    user_id: user.userId,
                    paymentStatus: PaymentStatus.PENDING,
                }
            )
            .select(["booking.laytripBookingId"])
            .getMany();
        if (booking.length) {
            return {
                pendingTransaction: true,
                bookingIds: booking,
            };
        }

        return {
            pendingTransaction: false,
        };
    }

    async updateCard(cardId, addCardDto: AddCardDto, user: User) {
        let card = await getManager()
            .createQueryBuilder(UserCard, "user_card")
            .where(
                "user_card.user_id = :user_id and user_card.is_deleted=:is_deleted and id =:cardId",
                { user_id: user.userId, is_deleted: false, cardId }
            )
            .getOne();

        if (!card) throw new NotFoundException(`Invalid payment card.`);
        const newCard = await this.addCard(addCardDto, user.userId, "");
        await getConnection()
            .createQueryBuilder()
            .update(Booking)
            .set({ cardToken: newCard.cardToken })
            .where(
                `booking_type=:booking_type AND card_token=:card_token AND check_in_date >=:today AND user_id =:user_id AND payment_status=:paymentStatus AND booking_status < ${BookingStatus.FAILED}`,
                {
                    booking_type: BookingType.INSTALMENT,
                    card_token: card.cardToken,
                    today: new Date(),
                    user_id: user.userId,
                    paymentStatus: PaymentStatus.PENDING,
                }
            )
            .execute();
        card.isDeleted = true;
        await card.save();
        return {
            message: `Your card update successfully`,
            data: newCard,
        };
    }

    async manuallyTakePayment(
        manullyTakePaymentDto: ManullyTakePaymentDto,
        admin: User
    ) {
        try {
            const {
                user_id,
                cart_id,
                card_token,
                installmentDates,
            } = manullyTakePaymentDto;

            if (!uuidValidator(user_id)) {
                throw new NotFoundException(
                    "Given user_id not avilable&&&userId&&&" + errorMessage
                );
            }
            let instalmentDate = [];
            for await (const record of installmentDates) {
                instalmentDate.push(record.installment_date);
            }
            let cart = await getConnection()
                .createQueryBuilder(CartBooking, "cart")
                .leftJoinAndSelect("cart.bookings", "booking")
                .leftJoinAndSelect("cart.referral", "referral")
                .leftJoinAndSelect(
                    "booking.bookingInstalments",
                    "BookingInstalments"
                )
                .leftJoinAndSelect("booking.currency2", "currency")
                .leftJoinAndSelect("cart.user", "User")
                .where(
                    `"BookingInstalments"."instalment_date" in (:...instalmentDate) AND "BookingInstalments"."payment_status" != ${PaymentStatus.CONFIRM} AND "cart"."user_id" = '${user_id}' AND "cart"."laytrip_cart_id" = '${cart_id}' AND "cart"."booking_type" = ${BookingType.INSTALMENT}`,
                    { instalmentDate }
                )
                .getOne();

            if (!cart) {
                throw new NotFoundException(
                    `We could not found any installments for given installment dates`
                );
            }

            const currency = cart.bookings[0].currency2;
            let totalAmount: number = 0;
            for await (const booking of cart.bookings) {
                for await (const installment of booking.bookingInstalments) {
                    totalAmount += parseFloat(installment.amount);
                }
            }
            let currencyCode = currency.code;
            let cardToken = card_token;
            const cartAmount = totalAmount;
            totalAmount = totalAmount * 100;
            totalAmount = Math.ceil(totalAmount);
            const currentDate = new Date();
            //console.log(cartAmount);

            if (cardToken) {
                let transaction = await this.getPayment(
                    cardToken,
                    totalAmount,
                    currencyCode,
                    user_id,
                    true
                );

                for await (const booking of cart.bookings) {
                    for await (const instalment of booking.bookingInstalments) {
                        instalment.paymentStatus =
                            transaction.status == true
                                ? PaymentStatus.CONFIRM
                                : PaymentStatus.PENDING;
                        instalment.paymentInfo = transaction.meta_data;
                        instalment.transactionToken = transaction.token;
                        instalment.paymentCaptureDate = new Date();
                        instalment.attempt = instalment.attempt
                            ? instalment.attempt + 1
                            : 1;
                        instalment.instalmentStatus =
                            transaction.status == true
                                ? PaymentStatus.CONFIRM
                                : PaymentStatus.PENDING;
                        instalment.comment = `try to get Payment by cron on ${currentDate}`;
                        instalment.isManually = true;
                        instalment.captureBy = admin.userId;
                        await instalment.save();
                    }
                }
                let nextDate;
                let nextAmount: number = 0;

                if (transaction.status == false) {
                    let faildTransaction = new FailedPaymentAttempt();
                    faildTransaction.instalmentId =
                        cart.bookings[0].bookingInstalments[0].id;
                    faildTransaction.paymentInfo = transaction.meta_data;
                    faildTransaction.date = new Date();

                    await faildTransaction.save();
                    var availableTry = "";

                    return {
                        message: `We could not able to take your payment please try again.`,
                    };
                } else {
                    for await (const booking of cart.bookings) {
                        //console.log(booking.laytripBookingId);

                        const nextInstalmentDate = await getManager()
                            .createQueryBuilder(
                                BookingInstalments,
                                "BookingInstalments"
                            )
                            .select([
                                "BookingInstalments.instalmentDate",
                                "BookingInstalments.amount",
                            ])
                            .where(
                                `"BookingInstalments"."instalment_status" =${InstalmentStatus.PENDING} AND "BookingInstalments"."booking_id" = '${booking.id}'`
                            )
                            .orderBy(`"BookingInstalments"."id"`)
                            .getOne();
                        let update = {
                            nextInstalmentDate:
                                nextInstalmentDate?.instalmentDate || null,
                        };
                        if (!nextInstalmentDate) {
                            update["paymentStatus"] = PaymentStatus.CONFIRM;
                        }

                        await getConnection()
                            .createQueryBuilder()
                            .update(Booking)
                            .set(update)
                            .where("id = :id", { id: booking.id })
                            .execute();
                        if (nextInstalmentDate) {
                            nextAmount += nextInstalmentDate.amount
                                ? parseFloat(nextInstalmentDate.amount)
                                : 0;
                            nextDate = nextInstalmentDate.instalmentDate;
                        }
                    }

                    //console.log('installment');

                    let complitedAmount = 0;
                    let totalAmount = 0;
                    let pendingInstallment = 0;
                    for await (const booking of cart.bookings) {
                        complitedAmount += parseFloat(
                            await this.totalPaidAmount(booking.id)
                        );
                        //console.log('ca');
                        totalAmount += Generic.formatPriceDecimal(
                            parseFloat(booking.totalAmount)
                        );
                        //console.log('ta');
                        pendingInstallment += await this.pandingInstalment(
                            booking.id
                        );
                        //console.log('pi');
                    }

                    let param = {
                        date: DateTime.convertDateFormat(
                            new Date(
                                cart.bookings[0].bookingInstalments[0].instalmentDate
                            ),
                            "YYYY-MM-DD",
                            "MMMM DD, YYYY"
                        ),
                        userName:
                            cart.user.firstName + " " + cart.user.lastName,
                        cardHolderName:
                            transaction.meta_data.transaction.payment_method
                                .full_name,
                        cardNo:
                            transaction.meta_data.transaction.payment_method
                                .number,
                        orderId: cart.laytripCartId,
                        amount: Generic.formatPriceDecimal(cartAmount),
                        installmentId:
                            cart.bookings[0].bookingInstalments[0].id,
                        complitedAmount: complitedAmount,
                        totalAmount: totalAmount,
                        currencySymbol: currency.symbol,
                        currency: currency.code,
                        pendingInstallment: pendingInstallment,
                        phoneNo:
                            `+${cart.user.countryCode}` + cart.user.phoneNo,
                        bookingId: cart.laytripCartId,
                        nextDate:
                            DateTime.convertDateFormat(
                                new Date(nextDate),
                                "YYYY-MM-DD",
                                "MMMM DD, YYYY"
                            ) || "",
                        nextAmount: nextAmount,
                        pastDue: false,
                    };
                    console.log("cart.user.isEmail", cart.user.isEmail);

                    if (cart.user.isEmail) {
                        if (nextAmount > 0) {
                            this.mailerService
                                .sendMail({
                                    to: cart.user.email,
                                    from: mailConfig.from,
                                    bcc: mailConfig.BCC,
                                    subject: `Booking ID ${param.bookingId} Installment Received`,
                                    html: await LaytripInstallmentRecevied(
                                        param
                                    ),
                                })
                                .then((res) => {
                                    console.log("res", res);
                                })
                                .catch((err) => {
                                    console.log("err", err);
                                });
                        } else {
                            const responce = await CartDataUtility.CartMailModelDataGenerate(
                                cart.laytripCartId
                            );
                            if (responce?.param) {
                                let subject = `TRAVEL PROVIDER RESERVATION CONFIRMATION #${cart.laytripCartId}`;
                                this.mailerService
                                    .sendMail({
                                        to: responce.email,
                                        from: mailConfig.from,
                                        bcc: mailConfig.BCC,
                                        subject: subject,
                                        html: await LaytripCartBookingComplationMail(
                                            responce.param
                                        ),
                                    })
                                    .then((res) => {
                                        //console.log("res", res);
                                    })
                                    .catch((err) => {
                                        //console.log("err", err);
                                    });
                            }
                        }
                        console.log("mail successed", param, cart.user.email);
                    }

                    if (cart.user.isSMS) {
                        TwilioSMS.sendSMS({
                            toSMS: param.phoneNo,
                            message: `We have received your payment of ${param.currencySymbol}${param.amount} for booking number ${param.bookingId}`,
                        });
                    }

                    // Activity.logActivity(
                    // 	"1c17cd17-9432-40c8-a256-10db77b95bca",
                    // 	"cron",
                    // 	`${instalment.id} Payment successed by Cron`
                    // );

                    PushNotification.sendNotificationTouser(
                        cart.user.userId,
                        {
                            //you can send only notification or only data(or include both)
                            module_name: "instalment",
                            task: "instalment_received",
                            bookingId: cart.laytripCartId,
                            instalmentId:
                                cart.bookings[0].bookingInstalments[0].id,
                        },
                        {
                            title: "Installment Received",
                            body: `We have received your payment of $${cartAmount}.`,
                        },
                        user_id
                    );
                    WebNotification.sendNotificationTouser(
                        cart.user.userId,
                        {
                            //you can send only notification or only data(or include both)
                            module_name: "instalment",
                            task: "instalment_received",
                            bookingId: cart.laytripCartId,
                            instalmentId:
                                cart.bookings[0].bookingInstalments[0].id,
                        },
                        {
                            title: "Installment Received",
                            body: `We have received your payment of $${cartAmount}.`,
                        },
                        user_id
                    );
                }
                //console.log('booking Update');

                // for await (const booking of cart.bookings) {
                //     await this.checkAllinstallmentPaid(booking.id);
                // }
                Activity.logActivity(
                    admin.userId,
                    "Payment",
                    `Manually take payment for booking = ${cart_id} , Total amount = ${totalAmount} , installmentDates = ${instalmentDate}`
                );
                return {
                    message: `Installment take successfully `,
                };
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
                        throw new InternalServerErrorException(
                            error.response.message
                        );
                    case 406:
                        throw new NotAcceptableException(
                            error.response.message
                        );
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
        return paidAmount[0].total_amount;
    }
    async pandingInstalment(bookingId) {
        let query = await getManager()
            .createQueryBuilder(BookingInstalments, "instalment")
            .where(
                `"instalment"."booking_id" = '${bookingId}' AND "instalment"."payment_status" = '${PaymentStatus.PENDING}'`
            )
            .getCount();
        return query;
    }
    async checkAllinstallmentPaid(bookingId) {
        let query = await getManager()
            .createQueryBuilder(BookingInstalments, "BookingInstalments")
            .where(
                `booking_id = '${bookingId}' AND payment_status != ${PaymentStatus.CONFIRM}`
            )
            .getCount();
        if (query <= 0) {
            await getConnection()
                .createQueryBuilder()
                .update(Booking)
                .set({
                    paymentStatus: PaymentStatus.CONFIRM,
                    nextInstalmentDate: null,
                })
                .where("id = :id", { id: bookingId })
                .execute();

            const responce = await CartDataUtility.CartMailModelDataGenerate(
                bookingId
            );
            if (responce?.param) {
                let subject = `TRAVEL PROVIDER RESERVATION CONFIRMATION #${responce.param.orderId}`;
                this.mailerService
                    .sendMail({
                        to: responce.email,
                        from: mailConfig.from,
                        bcc: mailConfig.BCC,
                        subject: subject,
                        html: await LaytripCartBookingComplationMail(
                            responce.param, responce.referralId
                        ),
                    })
                    .then((res) => {
                        console.log("res", res);
                    })
                    .catch((err) => {
                        console.log("err", err);
                    });
            }
        }
    }

    async validate(bookDto: AuthoriseCartDto, headers, user: User) {
        console.log(bookDto, headers, user);
        const {
            payment_type,
            laycredit_points,
            card_token,
            instalment_type,
            additional_amount,
            cart,
            selected_down_payment,
            browser_info,
            site_url,
        } = bookDto;
        let uuid = uuidv4();
        const date = new Date();
        var date1 = date.toISOString();
        date1 = date1
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "")
            .split(" ")[0];
        let redirection = site_url + "/book/charge/" + uuid;

        let response: any = {
            uuid,
            redirection,
            transaction: {},
        };

        let authoriseAmount: number = 0;

        if (cart.length > 10) {
            throw new BadRequestException(
                "Please check cart, In cart you can not purches more then 10 item"
            );
        }
        let cartIds: number[] = [];
        for await (const i of cart) {
            cartIds.push(i.cart_id);
        }

        let query = getConnection()
            .createQueryBuilder(Cart, "cart")
            //.select(["cart.moduleInfo", "cart.moduleId"])
            .where(
                `("cart"."is_deleted" = false) AND ("cart"."user_id" = '${user.userId}') AND ("cart"."module_id" In (${ModulesName.FLIGHT},${ModulesName.HOTEL})) AND ("cart"."id" IN (${cartIds}))`
            )
            .orderBy(`cart.id`, "DESC")
            .limit(10);
        const [result, count] = await query.getManyAndCount();

        if (!result.length) {
            throw new BadRequestException(
                `Cart is empty.&&&cart&&&${errorMessage}`
            );
        }
        let promotional = 0
        let nonPromotional = 0
        let promotionalItem = []
        let nonPromotionalItem = []
        let paymentType = 0
        for (let index = 0; index < result.length; index++) {
            const cart = result[index];

            if (cart.isPromotional == true) {
                promotional++
                promotionalItem.push(cart.id)
            } else {
                nonPromotional++
                nonPromotionalItem.push(cart.id)
            }

            // if (paymentType == 0) {
            //     paymentType = cart.paymentType
            // } else if (paymentType != cart.paymentType) {
            //     throw new NotAcceptableException(`In cart Installment and no-installment both inventry found.`)
            // }
        }

        if (promotional > 0 && nonPromotional > 0) {
            throw new ConflictException(`In cart promotional and not promotional both inventry found.`)
        }

        console.log("promotional", promotional, "nonPromotional", nonPromotional)

        let cartIsPromotional
        if (promotional > 0) {
            cartIsPromotional = true
            console.log("cartIsPromotional", cartIsPromotional)
        } else if (nonPromotional > 0) {
            cartIsPromotional = false
        }

        console.log("cartIsPromotional", cartIsPromotional)



        let smallestDate = "";
        let totalAmount: number = 0;
        let offerDownPayment:number=0

        for await (const item of result) {
           
            if (item.moduleId == ModulesName.FLIGHT) {
                // console.log("1");
                // console.log(result[0].moduleInfo[0].departure_date);
                const dipatureDate = await this.changeDateFormat(
                    item.moduleInfo[0].departure_date
                );
                //console.log("2");
                if (smallestDate == "") {
                    smallestDate = dipatureDate;
                } else if (new Date(smallestDate) > new Date(dipatureDate)) {
                    smallestDate = dipatureDate;
                }
                // console.log("smallestDate", smallestDate);
                console.log(item.moduleInfo[0].selling_price);
                console.log(item.moduleInfo[0].discounted_selling_price);

                totalAmount += parseFloat(item.moduleInfo[0].discounted_selling_price) 
                offerDownPayment += parseFloat(item.moduleInfo[0].discounted_start_price)
            } else if (item.moduleId == ModulesName.HOTEL) {

                const dipatureDate = item.moduleInfo[0].input_data.check_in;
                if (smallestDate == "") {
                    smallestDate = dipatureDate;
                } else if (new Date(smallestDate) > new Date(dipatureDate)) {
                    smallestDate = dipatureDate;
                }
                console.log(item.moduleInfo[0].selling);
                totalAmount += parseFloat(item.moduleInfo[0].selling['discounted_total']);
                offerDownPayment += parseFloat(item.moduleInfo[0].discounted_start_price)
            }
        }

        if (payment_type == PaymentType.INSTALMENT) {
            let instalmentDetails;

            let totalAdditionalAmount = additional_amount || 0;
            if (laycredit_points > 0) {
                totalAdditionalAmount =
                    totalAdditionalAmount + laycredit_points;
            }
            //save entry for future booking
            if (instalment_type == InstalmentType.WEEKLY) {
                if(cartIsPromotional){

                    instalmentDetails = Instalment.weeklyInstalment(
                        totalAmount,
                        smallestDate,
                        date1,
                        0,
                        null,
                        null,
                        0,
                        false,
                        offerDownPayment
                    );
                    console.log("offerDownPayment", offerDownPayment)
                    console.log(instalmentDetails)

                }else{
                    instalmentDetails = Instalment.weeklyInstalment(
                    totalAmount,
                    smallestDate,
                    date1,
                    totalAdditionalAmount,
                    0,
                    0,
                    selected_down_payment,
                    false
                );
                }
                
            }
            if (instalment_type == InstalmentType.BIWEEKLY) {
                instalmentDetails = Instalment.biWeeklyInstalment(
                    totalAmount,
                    smallestDate,
                    date1,
                    totalAdditionalAmount,
                    0,
                    0,
                    selected_down_payment,
                    false
                );
            }
            if (instalment_type == InstalmentType.MONTHLY) {
                instalmentDetails = Instalment.monthlyInstalment(
                    totalAmount,
                    smallestDate,
                    date1,
                    totalAdditionalAmount,
                    0,
                    0,
                    selected_down_payment,
                    false
                );
            }

            if (instalmentDetails.instalment_available) {
                console.log("instalmentDetails.",instalmentDetails)
                let firstInstalemntAmount =
                    instalmentDetails.instalment_date[0].instalment_amount;
                if (laycredit_points > 0) {
                    firstInstalemntAmount =
                        firstInstalemntAmount - laycredit_points;
                }
                authoriseAmount = Generic.formatPriceDecimal(
                    firstInstalemntAmount
                );
            } else {
                return {
                    statusCode: 422,
                    message: `Instalment option is not available for your search criteria`,
                };
            }
        } else if (payment_type == PaymentType.NOINSTALMENT) {
            let sellingPrice = totalAmount;
            if (laycredit_points > 0) {
                sellingPrice = totalAmount - laycredit_points;
            }

            if (sellingPrice > 0) {
                authoriseAmount = Generic.formatPriceDecimal(sellingPrice);
            }
            // else {
            // 	//for full laycredit rdeem
            // 	const mystifly = new Strategy(new Mystifly(headers, this.cacheManager));
            // 	const bookingResult = await mystifly.bookFlight(
            // 		bookFlightDto,
            // 		travelersDetails,
            // 		isPassportRequired
            // 	);
            // 	if (bookingResult.booking_status == "success") {

            // 		let laytripBookingResult = await this.saveBooking(
            // 			bookingRequestInfo,
            // 			currencyId,
            // 			bookingDate,
            // 			BookingType.NOINSTALMENT,
            // 			userId,
            // 			airRevalidateResult,
            // 			null,
            // 			null,
            // 			bookingResult,
            // 			travelers,
            //			cartId
            // 		);
            // 		//send email here
            // 		this.sendBookingEmail(laytripBookingResult.laytripBookingId);
            // 		bookingResult.laytrip_booking_id = laytripBookingResult.id;

            // 		bookingResult.booking_details = await this.bookingRepository.getBookingDetails(
            // 			laytripBookingResult.laytripBookingId
            // 		);
            // 		return bookingResult;
            // 	} else {

            // 			return {
            // 				status: 424,
            // 				message: bookingResult.error_message,
            // 			}
            // 	}
            // }
        }

        console.log("authoriseAmount", authoriseAmount)

        let authCardResult = await this.authorizeCard(
            card_token,
            Math.ceil(authoriseAmount * 100), //make it dynamic
            //50,
            "USD",
            browser_info,
            redirection,
            user.userId,
            user.email
        );
        //console.log(JSON.stringify(authCardResult));

        // return authCardResult;
        if (authCardResult.meta_data) {
            let transaction = authCardResult.meta_data.transaction;
            //this.cacheManager.set(uuid, { bookDto, headers, user }, { ttl: 3000 });
            response.transaction = transaction;
            response.redirection =
                redirection + "?transaction_token=" + transaction.token;
            response.authoriceAmount = authoriseAmount;
            response.auth_url = authCardResult.meta_data.fileName
        }

        return response;
    }

    async completeTransaction(purchaseToken, userId) {
        const GatewayCredantial = await Generic.getPaymentCredential();

        const authorization = GatewayCredantial.credentials.authorization;

        const headers = {
            Accept: "application/json",
            Authorization: authorization,
        };

        let url = `https://core.spreedly.com/v1/transactions/${purchaseToken}/complete.json`;
        let requestBody = {};
        let captureRes = await this.axiosRequest(
            url,
            requestBody,
            headers,
            null,
            "capture-card",
            userId
        );
        if (
            typeof captureRes.transaction != "undefined" &&
            captureRes.transaction.succeeded
        ) {
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

    async changeDateFormat(dateTime) {
        var date = dateTime.split("/");

        return `${date[2]}-${date[1]}-${date[0]}`;
    }

    async getCredantial() {
        const GatewayCredantial = await Generic.getPaymentCredential();
        return GatewayCredantial;
    }

    async refund(amount, token, currencyCode, userId) {
        const GatewayCredantial = await Generic.getPaymentCredential();

        const authorization = GatewayCredantial.credentials.authorization;

        const headers = {
            Accept: "application/json",
            Authorization: authorization,
        };

        let url = `https://core.spreedly.com/v1/transactions/${token}/credit.json`;
        let requestBody = {
            transaction: {
                amount: amount,
                currency_code: currencyCode,
            },
        };
        let cardResult = await this.axiosRequest(
            url,
            requestBody,
            headers,
            null,
            "refund",
            userId
        );

        //console.log(cardResult);
        if (
            typeof cardResult.transaction != "undefined" &&
            cardResult.transaction.succeeded
        ) {
            return {
                status: true,
                token: cardResult.transaction.token,
                meta_data: cardResult,
                logFile: cardResult['fileName']

            };
        } else {
            return {
                status: false,
                meta_data: cardResult,
                logFile: cardResult['fileName']
            };
        }
    }

    async listExstraPayment(listPaymentUserDto: ListPaymentUserDto) {
        const {
            page_no,
            limit,
            booking_id,
            end_date,
            start_date,
            module_id,
            status,
            product_id,
        } = listPaymentUserDto;

        const take = limit || 10;
        const skip = (page_no - 1) * limit || 0;
        let payment = new OtherPayments();

        let query = getManager()
            .createQueryBuilder(OtherPayments, "payment")
            .leftJoinAndSelect("payment.cart", "cart")
            .leftJoinAndSelect("payment.booking", "booking")
            .leftJoinAndSelect("payment.createdBy2", "User")
            .leftJoinAndSelect("booking.user", "user2")
            //.leftJoinAndSelect("booking.module", "moduleData")
            // .leftJoinAndSelect("User.state", "state")
            // .leftJoinAndSelect("User.country", "countries")
            // .leftJoinAndSelect("BookingInstalments.supplier", "supplier")
            // .leftJoinAndSelect(
            //     "BookingInstalments.failedPaymentAttempts",
            //     "failedPaymentAttempts"
            // )
            .select([
                // "BookingInstalments.id",
                // "BookingInstalments.bookingId",
                // "BookingInstalments.userId",
                // "BookingInstalments.moduleId",
                // "BookingInstalments.supplierId",
                // "BookingInstalments.instalmentType",
                // "BookingInstalments.instalmentNo",
                // "BookingInstalments.instalmentDate",
                // "BookingInstalments.currencyId",
                // "BookingInstalments.amount",
                // "BookingInstalments.instalmentStatus",
                // "BookingInstalments.paymentGatewayId",
                // "BookingInstalments.paymentInfo",
                // "BookingInstalments.paymentStatus",
                // "BookingInstalments.isPaymentProcessedToSupplier",
                // "BookingInstalments.isInvoiceGenerated",
                // "BookingInstalments.comment",
                // "BookingInstalments.transactionToken",
                "booking.laytripBookingId",
                "booking.id",
                "booking.categoryName",
                "booking.moduleId",
                "booking.bookingType",
                "booking.bookingStatus",
                "booking.currency",
                "booking.totalAmount",
                "booking.netRate",
                "booking.markupAmount",
                "booking.usdFactor",
                "booking.bookingDate",
                "booking.totalInstallments",
                "booking.locationInfo",
                "booking.paymentGatewayId",
                "booking.paymentStatus",
                "booking.paymentInfo",
                "booking.isPredictive",
                "booking.layCredit",
                "booking.fareType",
                "booking.isTicketd",
                "booking.paymentGatewayProcessingFee",
                "booking.supplierId",
                "booking.nextInstalmentDate",
                "booking.supplierBookingId",
                // "currency.id",
                // "currency.code",
                // "currency.symbol",
                // "currency.liveRate",
                "User.userId",
                "User.firstName",
                "User.lastName",
                "User.socialAccountId",
                "User.email",
                "User.phoneNo",
                "User.roleId",
                "user2.userId",
                "user2.firstName",
                "user2.lastName",
                "user2.socialAccountId",
                "user2.email",
                "user2.phoneNo",
                "user2.roleId",
                "payment.comment",
                "payment.amount",
                "payment.createdDate",
                "payment.currencyId",
                "payment.transactionId",
                "payment.paymentInfo",
                "payment.paidFor",
                "payment.paymentStatus",
                "payment.id",
                // "failedPaymentAttempts.id",
                // "failedPaymentAttempts.instalmentId",
                // "failedPaymentAttempts.date",
                "cart.laytripCartId",
            ])
            .take(take)
            .skip(skip)
            .where(`1=1`)
            .orderBy("payment.id", "DESC");

        if (product_id) {
            query = query.andWhere(
                `("booking"."laytrip_booking_id" =  '${product_id}')`
            );
        }

        if (booking_id) {
            query = query.andWhere(
                `("cart"."laytrip_cart_id" =  '${booking_id}')`
            );
        }

        if (module_id)
            query = query.andWhere(`"booking"."module_id"=:module_id`, {
                module_id,
            });
        if (status) {
            query = query.andWhere(
                `"payment"."payment_status"=:payment_status`,
                {
                    payment_status: status,
                }
            );
        }
        if (start_date && end_date) {
            query = query.andWhere(
                `"payment"."created_date" >=:payment_start_date and "payment"."created_date" <=:payment_end_date`,
                { payment_start_date: start_date, payment_end_date: end_date }
            );
        } else if (start_date) {
            query = query.andWhere(
                `"payment"."created_date"=:payment_start_date`,
                { payment_start_date: end_date }
            );
        }

        const [result, count] = await query.getManyAndCount();

        if (!result.length) throw new NotFoundException(`No data found.`);

        return {
            result,
            count,
        };
    }
}
