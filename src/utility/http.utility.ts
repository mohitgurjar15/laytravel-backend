import { RequestTimeoutException } from '@nestjs/common';
import Axios from 'axios';
import * as xml2js from 'xml2js';

export class  HttpRequest{

    static async mystiflyRequest(url,requestBody,headerAction){
        try{
            let result =await Axios({
                method: 'POST',
                url: url,
                data: requestBody,
                timeout :180000,
                headers: {
                    'content-type':'text/xml',
                    'Accept-Encoding':'gzip',
                    'soapaction':`Mystifly.OnePoint/OnePoint/${headerAction}`,
                    'charset':'UTF-8',
                    'cache-control':'no-cache'
                }
            })
            result = await xml2js.parseStringPromise(result.data,{
                normalizeTags :true,
                ignoreAttrs:true
            });
            return result;
        }
        catch(error){
            throw new RequestTimeoutException(`Connection time out`)
        }
        
    }
}