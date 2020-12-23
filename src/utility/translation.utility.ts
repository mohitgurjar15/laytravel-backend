export class Translation {
    static async Translater(
        lang: string = 'EN',
        file: string,
        variable: string,
        parameters: {} = {}
    ) {
        var jsonData;
        switch (lang) {
            case 'EN':
                jsonData = require(`../i18n/en/${file}.json`);
                break;
            case 'DE':
                jsonData = require(`../i18n/de/${file}.json`);
                break;
            case 'ES':
                jsonData = require(`../i18n/es/${file}.json`);
                break;
            default:
                jsonData = require(`../i18n/en/${file}.json`);
                break;
        }

        var msgData = jsonData[`${variable}`];

        async function renderString(msg: string, object) {
            return msg.match(/\{(.*?)\}/gi).reduce((acc, binding) => {
                const property = binding.substring(1, binding.length - 1);
                var str = acc == '' || acc == null ? msg : acc;
                return `${str.replace(/\{(.*?)\}/, object[property])}`;
            }, '');
        }
        if (msgData.match(/\{(.*?)\}/gi)) {
            return await renderString(msgData, parameters);
        } else {
            return msgData;
        }
    }

}