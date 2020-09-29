import { Markup } from "src/entity/markup.entity";
import { getManager } from "typeorm";

export class PriceMarkup{
    
    /**
     * 
     * @param netRate (Net rate of supplier) 
     * @param supplierId  (Supplier ID)
     * @param userType (Free user , paid user or Guest user)
     */
    static applyMarkup(netRate,markupDetails){

        let markupPrice;
        if(markupDetails){

            switch(markupDetails.operator){

                case '+':
                    markupPrice = parseFloat(netRate)+parseFloat(markupDetails.operand);
                    break;
                case '-':
                    markupPrice = parseFloat(netRate)-parseFloat(markupDetails.operand);
                    break;

                case '*':
                    markupPrice = parseFloat(netRate)*parseFloat(markupDetails.operand);
                    break;

                case '/':
                    markupPrice = parseFloat(netRate)*parseFloat(markupDetails.operand);
                    break;
                default:
                    markupPrice = netRate;
            }
        }
        return markupPrice;
            
    }

    static async getMarkup(moduleId,userType=null,bookingType=null){
        
        userType = userType==null ? 7 : userType;
        bookingType = bookingType || 'no-instalment';
        
        let markupDetails =  await getManager()
                            .createQueryBuilder(Markup, "markup")
                            .where("markup.module_id = :moduleId and markup.user_type=:userType", { moduleId,userType })
                            .getOne();
        return markupDetails;
    }
}