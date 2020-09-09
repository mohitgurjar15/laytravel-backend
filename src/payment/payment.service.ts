import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SaveCardDto } from './dto/save-card.dto';
import { getManager } from 'typeorm';
import { PaymentGateway } from 'src/entity/payment-gateway.entity';
import { errorMessage } from 'src/config/common.config';
import { UserCard } from 'src/entity/user-card.entity';
import { v4 as uuidv4 } from "uuid";
import { User } from 'src/entity/user.entity';
import Axios from 'axios';

@Injectable()
export class PaymentService {

    async saveCard(saveCardDto:SaveCardDto,user:User){
        
        const {

            card_holder_name, card_last_digit,
            card_type, card_token
        } = saveCardDto;

        let paymentGateway = await getManager()
                .createQueryBuilder(PaymentGateway, "paymentgateway")
                .where("paymentgateway.gateway_name = :name ", { name:'spreedly' })
                .getOne();
        if(!paymentGateway){
            throw new BadRequestException(`Payment gateway is not configured in database&&&payment_gateway_id&&&${errorMessage}`)
        }

        let userCard = new UserCard();
        userCard.id = uuidv4();
        userCard.paymentGatewayId = paymentGateway.id;
        userCard.userId  = user.userId;
        userCard.cardHolderName = card_holder_name;
        userCard.cardDigits = card_last_digit;
        userCard.cardToken = card_token;
        userCard.cardType = card_type;
        userCard.createdDate = new Date();

        try{
           return await userCard.save();
        }
        catch(exception){

            throw new InternalServerErrorException(errorMessage)
        }
    }

    async getAllCards(user:User){
        
        let cardList =  await getManager()
        .createQueryBuilder(UserCard, "user_card")
        .select(["user_card.userId","user_card.id","user_card.cardHolderName","user_card.cardDigits","user_card.cardToken","user_card.cardType","user_card.status"])
        .where("user_card.user_id = :user_id and user_card.is_deleted=:is_deleted", { user_id:user.userId, is_deleted:false})
        .getMany(); 

        if(!cardList.length)
            throw new NotFoundException(`No card founds`)

        return cardList;
    }

    async authorizeCard(gatewayToken,card_id,amount,currency){

        /* return {
            status   : true,
            token    : 'AUT675462'
        } */
        console.log("gatewayToken,card_id",gatewayToken,card_id)
        let url=`https://core.spreedly.com/v1/gateways/${gatewayToken}/authorize.json`;
        let requestBody ={

            "transaction": {
              "payment_method_token": card_id,
              "amount": amount,
              "currency_code": "USD"
            }
          }
        let authResult = await this.axiosRequest(url,requestBody);
        console.log(authResult);
        if(authResult.transaction?.succeeded){
            return {
                status       : true,
                token        : authResult.transaction.token,
                meta_data    : authResult,
            }
        }
        else{
            return {
                status       : false,
                meta_data    : authResult,
            }
        }
    }

    async captureCard(authorizeToken){

        /* return {
            status   : true,
            token    : 'CAP675462'
        } */

        let url=`https://core.spreedly.com/v1/transactions/${authorizeToken}/capture.json`;
        let requestBody={};
        let captureRes = await this.axiosRequest(url,requestBody);
        console.log(captureRes);
        if(captureRes.transaction.succeeded){
            return {
                status       : true,
                token        : captureRes.transaction.token,
                meta_data    : captureRes,
            }
        }
        else{
            return {
                status       : false,
                meta_data    : captureRes,
            }
        }
    }

    async voidCard(captureToken){

        /* return {
            status   : true,
            token    : 'VOI675462'
        } */

        let url=`https://core.spreedly.com/v1/transactions/${captureToken}/void.json`;
        let requestBody={};
        let voidRes = await this.axiosRequest(url,requestBody);
        console.log(voidRes);
        if(voidRes.transaction.succeeded){
            return {
                status       : true,
                token        : voidRes.transaction.token,
                meta_data    : voidRes,
            }
        }
        else{
            return {
                status       : false,
                meta_data    : voidRes,
            }
        }
    }

    async axiosRequest(url,requestBody,headers=null){

        try{

            let result =await Axios({
                method: 'POST',
                url: url,
                data: requestBody,
                headers: {
                    'Accept':'application/json',
                    'Authorization': 'Basic WU5FZFpGVHdCMXRSUjR6d3ZjTUlhVXhacTNnOnV3RkowRHRKTTdQRVluWHBaWGJ2ZjBGYUR6czY2cjY4T1B1OG51Zld4Q3FYWTJ6RmFFYUFNb1ZmSTN1M2JVQ2k='
                }
            });
            //console.log("=========================",result)
            return result.data;
        }
        catch(exception){
            //console.log("exception",exception)
        }
    }
}
