import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SaveCardDto } from './dto/save-card.dto';
import { getManager } from 'typeorm';
import { PaymentGateway } from 'src/entity/payment-gateway.entity';
import { errorMessage } from 'src/config/common.config';
import { UserCard } from 'src/entity/user-card.entity';
import { v4 as uuidv4 } from "uuid";
import { User } from 'src/entity/user.entity';

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
}
