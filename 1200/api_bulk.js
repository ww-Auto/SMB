/***********************************************************************
 
    BulkAPI Request Process
    Writer  : JK
    Data    : 2022-05-16

    사용법
    1. https://hshopfront.samsung.com/lv/business/smartphones/all-smartphones/ 시크릿 모드로 접속
    2. SMB User 로그인 후 개발자 도구 활성화 >> 새로고침 1회
    3. Network 탭에서 user 찾은 후 쿠키값 전부 config.js cookie 부분에 붙여넣기
    4. main쪽 터미널 연 후 api_remote 실행

    실행결과 예시
    {
        "sitecode": "cl",
        "bulkModelCode": "QN75QN800BGXZS",
        "bulkStock": "inStock",
        "bulkSMBPrice": "$4.224.990",
        "bulkGuestPrice": "$4.224.990",
        "bulkTieredPrice": "",
        "bulkTiered": ""
    }
 
 ***********************************************************************/

const fs = require('fs');
const xlsx = require('xlsx');
const { get_BulkAPI } = require('../lib/getBulkAPI.js');
const { bulksave } = require('../config/config.js');

// Check Directory
const savePath = bulksave; 
const dir = fs.existsSync(savePath);
if(!dir) fs.mkdirSync(savePath, { recursive: true });

// cdn URL을 쓰는 이유는? 
var URL = { "lv" : "https://s3-smn3-api-cdn.ecom-stg.samsung.com/tokocommercewebservices/v2/lvsme/products/all?currentPage=1&fields=BULK_SIMPLE_INFO_V2&pageSize=100",
            "lt" : "https://s3-smn3-api-cdn.ecom-stg.samsung.com/tokocommercewebservices/v2/ltsme/products/all?currentPage=1&fields=BULK_SIMPLE_INFO_V2&pageSize=100",
            "ee" : "https://s3-smn3-api-cdn.ecom-stg.samsung.com/tokocommercewebservices/v2/eesme/products/all?currentPage=1&fields=BULK_SIMPLE_INFO_V2&pageSize=100",
            "tw" : "https://s3-sms-api-cdn.ecom-stg.samsung.com/tokocommercewebservices/v2/twsme/products/all?currentPage=1&fields=BULK_SIMPLE_INFO_V2&pageSize=100",
            "hk" : "https://s3-sms-api-cdn.ecom-stg.samsung.com/tokocommercewebservices/v2/hksme/products/all?currentPage=1&fields=BULK_SIMPLE_INFO_V2&pageSize=100",
            "hk_en" : "https://s3-sms-api-cdn.ecom-stg.samsung.com/tokocommercewebservices/v2/hksme/products/all?currentPage=1&fields=BULK_SIMPLE_INFO_V2&pageSize=100&lang=en_HK",
            "kz_ru" : "https://s3-smn3-api-cdn.ecom-stg.samsung.com/tokocommercewebservices/v2/kzsme/products/all?currentPage=1&fields=BULK_SIMPLE_INFO_V2&pageSize=100&lang=ru_KZ",
            "za" : "https://s3-smi-api-cdn.ecom-stg.samsung.com/tokocommercewebservices/v2/zasme/products/all?currentPage=1&fields=BULK_SIMPLE_INFO_V2&pageSize=100",
            "hu" : "https://s3-smn-api.ecom-stg.samsung.com/tokocommercewebservices/v2/husme/products/all?currentPage=1&fields=BULK_SIMPLE_INFO_V2&pageSize=100",
            "co" : "https://s3-smb-api-cdn.ecom-stg.samsung.com/tokocommercewebservices/v2/cosme/products/all?currentPage=1&fields=BULK_SIMPLE_INFO_V2&pageSize=100",
            "cl" : "https://s3-smb-api-cdn.ecom-stg.samsung.com/tokocommercewebservices/v2/clsme/products/all?currentPage=1&fields=BULK_SIMPLE_INFO_V2&pageSize=100"
        };


for(var key in URL) {
    get_BulkAPI(URL[key], key).then((data) => 
    {
        data = data.reduce(function(acc,cur) {
            return acc.concat(cur);
        });
        const workBook = xlsx.utils.book_new();
        const result = JSON.stringify(data, null, 2);
        try{
            var cur_sc = data[0].sitecode;
            fs.writeFileSync(savePath + 'Bulk_API_' + cur_sc + '.json', result);
            console.log("Bulk_API_" + cur_sc + "_JSON File Saved!");
            
            // Creat Excel File
            var workSheet = xlsx.utils.json_to_sheet(result);
            xlsx.utils.book_append_sheet(workBook, workSheet, cur_sc);
            xlsx.writeFile(workBook, "../result/Bulk_API_Result/Bulk_API_" + cur_sc + ".xlsx");
        
        }catch(e){
            console.log("Not Exist Data : " + e);
        }       
    });
}
