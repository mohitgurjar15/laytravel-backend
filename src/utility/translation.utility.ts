export class Translation {
    static async Translater(
        lang: string = 'EN',
        file: string,
        variable: string,
        parameters: {} = {}
    ) {
        console.log(lang);
        
        var jsonData;
        switch (lang.toLowerCase()) {
            case 'en':
                jsonData = require(`../i18n/en/${file}.json`);
                break;
            case 'de':
                jsonData = require(`../i18n/de/${file}.json`);
                break;
            case 'es':
                jsonData = require(`../i18n/es/${file}.json`);
                break;
            default:
                jsonData = require(`../i18n/en/${file}.json`);
                break;
        }
        console.log(jsonData);
        
        var msgData = jsonData[`${variable}`];

        if(!msgData)
        {
            jsonData = require(`../i18n/en/${file}.json`);
            msgData = jsonData[`${variable}`];
        }
        console.log(msgData);
        
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