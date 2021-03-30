import { Generic } from "src/utility/generic.utility";
import { GenericHotel  } from "src/hotel/helpers/generic.helper";
export class CommonHelper {
    
    static async generateUrl(api: string, parameters: any = {}) {

        //let ppnConfig = config.get('ppn');
        let config = await Generic.getCredential("hotel");
        let ppnConfig = JSON.parse(config.testCredential);
        if (config.mode) {
            ppnConfig = JSON.parse(config.liveCredential);
        }
        let defaults = {
            format: ppnConfig.format,
            refid: ppnConfig.refid,
            api_key: ppnConfig.api_key,
        }
        
        parameters = { ...defaults, ...parameters };
        
        let query = GenericHotel.httpBuildQuery(parameters);
        
        console.log("query",ppnConfig.url+api+'?'+query)
        return ppnConfig.url+api+'?'+query;
    }
}