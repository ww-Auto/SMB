/***********************************************************************
 
    Make PD API URL
    Process : makePDAPI.js
    Writer  : JK
    Data    : 2022-07-06
 
 ***********************************************************************/

async function makeURL(sitecode, sSKU) {
    var url = "";
    switch (sitecode) {
        case 'lv':
            url = 'https://s3-smn3-api.ecom-stg.samsung.com/tokocommercewebservices/v2/lvsme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
            break;
        case 'lt':
            url = 'https://s3-smn3-api.ecom-stg.samsung.com/tokocommercewebservices/v2/ltsme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
            break;
        case 'ee':
            url = 'https://s3-smn3-api.ecom-stg.samsung.com/tokocommercewebservices/v2/eesme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
            break;
        case 'tw':
            url = 'https://s3-sms-api.ecom-stg.samsung.com/tokocommercewebservices/v2/twsme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
            break;
        case 'hk':
            url = 'https://s3-sms-api.ecom-stg.samsung.com/tokocommercewebservices/v2/hksme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
            break;
        case 'hk_en':
            url = 'https://s3-sms-api.ecom-stg.samsung.com/tokocommercewebservices/v2/hksme/products/'+ sSKU +'/**?fields=SIMPLE_INFO&lang=en_HK';
            break;
        case 'kz_ru':
            url = 'https://s3-smn3-api.ecom-stg.samsung.com/tokocommercewebservices/v2/kzsme/products/'+ sSKU +'/**?fields=SIMPLE_INFO&lang=ru_KZ';
            break;
        case 'za':
            url = 'https://s3-smi-api.ecom-stg.samsung.com/tokocommercewebservices/v2/zasme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
            break;
        case 'hu':
            url = 'https://s3-smn-api.ecom-stg.samsung.com/tokocommercewebservices/v2/husme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
            break;
        case 'co':
            url = 'https://s3-smb-api.ecom-stg.samsung.com/tokocommercewebservices/v2/cosme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
            break;
        case 'cl':
            url = 'https://s3-smb-api.ecom-stg.samsung.com/tokocommercewebservices/v2/clsme/products/'+ sSKU +'/**?fields=SIMPLE_INFO';
            break;
        default:
            break;
    }

    return url;
}

module.exports.makeURL = makeURL;