
import * as moment from 'moment';
import { LANDING_PAGE } from 'src/config/landing-page.config';
export class LandingPage {
    static getLandingPageValidity(lpNumber){

        if(LANDING_PAGE[lpNumber].applicable){
          return true;
        }
        return false;
      }
      
    static getOfferData(lpNumber,type,departure,arrival,checkInDate){
      
        if(LANDING_PAGE[lpNumber].applicable){
          
        switch(type){
            case 'flight' : 
                return this.checkFlightoffer(lpNumber,departure,arrival,checkInDate)
            case 'hotel' :
                return this.checkHotelOffer(lpNumber,departure,checkInDate);
            default :
                return false;
          }
        }
    }

    static checkFlightoffer(lpNumber,departure,arrival,checkInDate){
        let LANDING_PAGE_DATA =LANDING_PAGE[lpNumber];
        let isRouteExist = LANDING_PAGE_DATA.deals.flight.findIndex(deal=>{
            return  deal.from.code==departure && deal.from.to==arrival; 
          })
          if(isRouteExist==-1){
            return false;
          }
    
          if(moment().diff(checkInDate,'days')<LANDING_PAGE_DATA.promotional.min_promotional_day){
            return false;
          }
    
          return {
            payment_frequency_options : LANDING_PAGE_DATA.payment_frequency_options,
            down_payment_options : LANDING_PAGE_DATA.down_payment_options,
            discount : LANDING_PAGE_DATA.discount
          }
    }

    static checkHotelOffer(lpNumber,departure,checkInDate){

        let LANDING_PAGE_DATA =LANDING_PAGE[lpNumber];
        let isRouteExist = LANDING_PAGE_DATA.deals.hotel.findIndex(deal=>{
            return  deal.location.city==departure
        })
        if(isRouteExist==-1){
        return false;
        }

        if(moment().diff(checkInDate,'days')<LANDING_PAGE_DATA.promotional.min_promotional_day){
        return false;
        }

        return {
        payment_frequency_options : LANDING_PAGE_DATA.payment_frequency_options,
        down_payment_options : LANDING_PAGE_DATA.down_payment_options,
        discount : LANDING_PAGE_DATA.discount
        }
    }
}

