import { NotAcceptableException, RequestTimeoutException } from '@nestjs/common';
import Axios from 'axios';
import * as xml2js from 'xml2js';
import { Activity } from './activity.utility';

export class HttpRequest {

    static async mystiflyRequest(url, requestBody, headerAction , user = '') {
        try {
            let result = await Axios({
                method: 'POST',
                url: url,
                data: requestBody,
                timeout: 180000,
                headers: {
                    'content-type': 'text/xml',
                    'Accept-Encoding': 'gzip',
                    'soapaction': `Mystifly.OnePoint/OnePoint/${headerAction}`,
                    'charset': 'UTF-8',
                    'cache-control': 'no-cache'
                }
            })

            let fileName = '';
            if (headerAction != 'CreateSession') {
                let logData = {};
                logData['url'] = url
                logData['requestBody'] = requestBody
                logData['headers'] = {
                    'content-type': 'text/xml',
                    'Accept-Encoding': 'gzip',
                    'soapaction': `Mystifly.OnePoint/OnePoint/${headerAction}`,
                    'charset': 'UTF-8',
                    'cache-control': 'no-cache'
                }
                logData['responce'] = result.data;

                fileName = `Flight-mystifly-${headerAction}-${new Date().getTime()}`;
                if(user){
                    fileName +=  user
                }
                Activity.createlogFile(fileName, logData, 'flights');
            }

            result = await xml2js.parseStringPromise(result.data, {
                normalizeTags: true,
                ignoreAttrs: true
            });
            result['log_file'] = fileName
            return result;
        }
        catch (error) {
            //console.log("===================", error.message)
            let logData = {};
            logData['url'] = url
            logData['requestBody'] = requestBody
            logData['headers'] = {
                'content-type': 'text/xml',
                'Accept-Encoding': 'gzip',
                'soapaction': `${headerAction}`,
                'charset': 'UTF-8',
                'cache-control': 'no-cache'
            }
            logData['responce'] = error.response.data;
            const fileName = `Flight-mystifly-${headerAction}-${new Date().getTime()}`;
            Activity.createlogFile(fileName, logData, 'Mustifly_errors');
            
            throw new RequestTimeoutException(`Connection time out`)
        }

    }

    static async mystiflyRequestZip(url, requestBody, headerAction) {
        try {
            let result = await Axios({
                method: 'POST',
                url: url,
                data: requestBody,
                timeout: 180000,
                headers: {
                    'content-type': 'text/xml',
                    'Accept-Encoding': 'gzip',
                    'soapaction': `${headerAction}`,
                    'charset': 'UTF-8',
                    'cache-control': 'no-cache'
                }
            })
            // let logData = {};
            // logData['url'] = url
            // logData['requestBody'] = requestBody
            // logData['headers'] = {
            //     'content-type': 'text/xml',
            //     'Accept-Encoding': 'gzip',
            //     'soapaction': `${headerAction}`,
            //     'charset': 'UTF-8',
            //     'cache-control': 'no-cache'
            // }
            // logData['responce'] = result.data;
            
            
            result = await xml2js.parseStringPromise(result.data, {
                normalizeTags: true,
                ignoreAttrs: true
            });

            //logData['Decripted responce '] = result;

            // const fileName = `Flight-mystifly-zip-search-${new Date().getTime()}`;
            // Activity.createlogFile(fileName, logData, 'flights');
            return result;
        }
        catch (error) {
            // let logData = {};
            // logData['url'] = url
            // logData['requestBody'] = requestBody
            // logData['headers'] = {
            //     'content-type': 'text/xml',
            //     'Accept-Encoding': 'gzip',
            //     'soapaction': `${headerAction}`,
            //     'charset': 'UTF-8',
            //     'cache-control': 'no-cache'
            // }
            // logData['responce'] = error.response.data;
            // const fileName = `Flight-mystifly-zip-search-${new Date().getTime()}`;
            // Activity.createlogFile(fileName, logData, 'Mustifly_errors');
            throw new RequestTimeoutException(`Connection time out`)
        }

    }

    static async monakerRequest(url, method, requestBody, apiKey, flag = false) {

        // console.log("requestBody==============>", url);

        let result;
        try {
            result = await Axios({
                method: method,
                url: url,
                data: requestBody,
                headers: {
                    'Ocp-Apim-Subscription-Key': apiKey,
                    'Accept-Encoding': 'gzip',
                }
            })
            return result;
        }
        catch (e) {
            result = e.response.data
            if (result == "The booking request failed. Wrong quote handle.") {
                return false;
            } else if (flag == true) {
                if (result.hasOwnProperty("CheckOutDate") || result.hasOwnProperty("CheckInDate")) {
                    return false;
                }
            }
            else if (result.hasOwnProperty("CheckInDate")) {
                throw new NotAcceptableException(`${result["CheckInDate"][0]}`)
            } else if (result.hasOwnProperty("CheckOutDate")) {
                throw new NotAcceptableException(`${result["CheckOutDate"][0]}`)
            } else if (result["statusCode"] == 429) {
                throw new NotAcceptableException(`${result["message"]}`)
            } else {
                throw new RequestTimeoutException(`Connection time out`)
            }
        }

    }
}