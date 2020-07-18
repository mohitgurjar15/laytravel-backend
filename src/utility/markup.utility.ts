import { Markup } from "src/entity/markup.entity";
import { getManager } from "typeorm";

export class PriceMarkup{
    
    /**
     * 
     * @param netRate (Net rate of supplier) 
     * @param supplierId  (Supplier ID)
     * @param userType (Free user , paid user or Guest user)
     */
    static async applyMarkup(netRate,supplierId,userType=null){

        let markupPrice;
        if(userType){
            let markupDetails =  await getManager()
                            .createQueryBuilder(Markup, "markup")
                            .where("markup.supplier_id = :supplierId and markup.user_type=:userType", { supplierId,userType })
                            .getOne();
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
            else{
                markupPrice =netRate;
            }
        }
        else{
            markupPrice =netRate;
        }
        return markupPrice;
    }
}