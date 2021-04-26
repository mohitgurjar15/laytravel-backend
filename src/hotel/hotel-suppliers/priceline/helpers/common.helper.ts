import { Generic } from "src/utility/generic.utility";
import { GenericHotel } from "src/hotel/helpers/generic.helper";
export class CommonHelper {
    static async generateUrl(api: string, parameters: any = {}, hotel_id = "") {
        //let ppnConfig = config.get('ppn');
        let config = await Generic.getCredential("hotel");
        let mode = "test";
        let ppnConfig = JSON.parse(config.testCredential);
        if (config.mode) {
            mode = "live";
            ppnConfig = JSON.parse(config.liveCredential);
        }
        console.log("hotel_id", hotel_id);
        
        if (hotel_id) {
            let refid = await Generic.getRefidFromHotelId(hotel_id);
            console.log(refid, "refid");
            
            if (refid) {
                console.log("new refid :", refid);
                
                ppnConfig.refid = refid;
            }
        }

        console.log("Hotel credantial", ppnConfig, "mode", mode);
        let defaults = {
            format: ppnConfig.format,
            refid: ppnConfig.refid,
            api_key: ppnConfig.api_key,
        };

        parameters = { ...defaults, ...parameters };

        let query = GenericHotel.httpBuildQuery(parameters);

        console.log(
            "ppnConfig.url+api+'?'+query",
            ppnConfig.url + api + "?" + query
        );
        return ppnConfig.url + api + "?" + query;
    }
}
