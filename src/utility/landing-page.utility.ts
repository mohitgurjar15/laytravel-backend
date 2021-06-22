
import * as moment from 'moment';
import { LANDING_PAGE } from 'src/config/landing-page.config';
import { LandingPages } from 'src/entity/landing-page.entity';
import { getConnection } from 'typeorm';
export class LandingPage {
    static async getLandingPageValidity(lpNumber){

      let where = `"landingPages"."is_deleted" = false AND "landingPages"."status" = true AND "landingPages"."name" like '${lpNumber}'`;

      const query = getConnection()
        .createQueryBuilder(LandingPages, "landingPages")
        // .leftJoinAndSelect("landingPages.createByUser", "Users")
        // .select([
        //     "landingPages",
        //     "Users.firstName",
        //     "Users.lastName",
        //     "Users.email",
        // ])
        .where(where);

      const landingPageDetail = await query.getOne();
    
      if (landingPageDetail && LANDING_PAGE[landingPageDetail?.name].applicable){
          return true;
        }
        return false;
      }
      
    static async getOfferData(lpNumber,type,searchData){
      
      if (await this.getLandingPageValidity(lpNumber)){
          
          switch(type){
              case 'flight' : 
                  return this.checkFlightoffer(lpNumber,searchData)
              case 'hotel' :
                  return this.checkHotelOffer(lpNumber,searchData);
              default :
                  return {applicable : false}
            }
        }
        else{
          return {applicable : false}
        }

    }

    static checkFlightoffer(lpNumber,searchData){
        let LANDING_PAGE_DATA =LANDING_PAGE[lpNumber];
        let isRouteExist = LANDING_PAGE_DATA.deals.flight.findIndex(deal=>{
            return  deal.from.code==searchData.departure && deal.to.code==searchData.arrival; 
          })
          if(isRouteExist==-1){
            return {applicable : false}
          }
          
          if(moment(searchData.checkInDate).diff(moment(),'days')<LANDING_PAGE_DATA.promotional.min_promotional_day){
            return {applicable : false}
          }
    
          return {
            applicable : true,
            payment_frequency_options : LANDING_PAGE_DATA.payment_frequency_options,
            down_payment_options : LANDING_PAGE_DATA.down_payment_options,
            discount : LANDING_PAGE_DATA.discount
          }
    }

    static checkHotelOffer(lpNumber,searchData){

        let LANDING_PAGE_DATA =LANDING_PAGE[lpNumber];
        let isRouteExist = LANDING_PAGE_DATA.deals.hotel.findIndex(deal=>{
            return  deal.location.city==searchData.departure
        })
        if(isRouteExist==-1){
          return {applicable : false};
        }

        if(moment(searchData.checkInDate).diff(moment(),'days')<LANDING_PAGE_DATA.promotional.min_promotional_day){
          return {applicable : false};
        }

        return {
          applicable : true,
          payment_frequency_options : LANDING_PAGE_DATA.payment_frequency_options,
          down_payment_options : LANDING_PAGE_DATA.down_payment_options,
          discount : LANDING_PAGE_DATA.discount
        }
    }

    static getDownPayment(offerData,downPaymentOption){

      if(offerData.applicable){
        return offerData.down_payment_options[downPaymentOption].amount ? offerData.down_payment_options[downPaymentOption].amount :null; 
      }
      return null;
    }

    static applyDiscount(offerData,price){

      if(!offerData.applicable){

        return price;
      }

      if(offerData.discount.applicable){
        let discountPrice;

        if(offerData.discount.type=='flat'){
          discountPrice = price-offerData.discount.amount;
        }
        else{
          discountPrice = price-(price*offerData.discount.amount/100);  
        }

        if(discountPrice<0){
          return 0;
        }
        return discountPrice;
      }
      return price;
    }
}

