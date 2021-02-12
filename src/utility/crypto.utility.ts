import * as crypto from 'crypto';
import { CryptoKey } from "src/config/common.config";
import * as cr from 'typeorm-encrypted'

export class CryptoUtility {

    static async encode(plainText) {
        const transformer = new cr.EncryptionTransformer(CryptoKey)
        return transformer.to(plainText)
    }

    static async decode(cipherText) {
        const transformer = new cr.EncryptionTransformer(CryptoKey)
        return transformer.from(cipherText)
    }
}