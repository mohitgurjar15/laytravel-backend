import { Generic } from "src/hotel/helpers/generic.helper";
import * as config from 'config';

export class CommonHelper {
    
    static generateUrl(api: string, parameters: any = {}) {

        let ppnConfig = config.get('ppn');

        let defaults = {
            format: ppnConfig.format,
            refid: ppnConfig.refid,
            api_key: ppnConfig.api_key,
        }
        
        parameters = { ...defaults, ...parameters };
        
        let query = Generic.httpBuildQuery(parameters);
        
        return ppnConfig.url+api+'?'+query;
    }
}