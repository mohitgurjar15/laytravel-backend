import { BadGatewayException, InternalServerErrorException } from '@nestjs/common';
import * as Cryptr from 'cryptr'
import { errorMessage } from 'src/config/common.config';
export class Crypto {

    static async Encryption(key, plainText) {
        try{
        const cryptr = new Cryptr(key);

        return cryptr.encrypt(plainText);
    } catch (error) {
        throw new InternalServerErrorException(`Error at encode the message&&&db&&&` + errorMessage)
    }
    }

    static async Decryption(key, cipherText, datatype = null) {
        try {
            const cryptr = new Cryptr(key);

            const plainText = cryptr.encrypt(cipherText);

            if (datatype) {
                switch (datatype) {
                    case 'int':
                        return parseInt(plainText)
                        break;
                    case 'float':
                        return parseFloat(plainText)
                        break;
                    case 'date':
                        return new Date(plainText)
                        break;

                    default:
                        return plainText
                        break;
                }
            } else {
                return plainText
            }
        } catch (error) {
            throw new BadGatewayException(`Error at decode the message&&&db&&&` + errorMessage)
        }
    }
}