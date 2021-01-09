import * as Cryptr from 'cryptr'
export class Crypto {

    static async Encryption(key, plainText) {
        const cryptr = new Cryptr(key);

        return cryptr.encrypt(plainText);
    }

    static async Decryption(key, cipherText, datatype = null) {
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

    }
}