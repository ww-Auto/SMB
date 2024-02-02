/***********************************************************************
 
    BulkAPI Request Process
    Process : S28_1202_rq.js
    Writer  : JK
    Data    : 2022-05-16
 
 ***********************************************************************/

import fs from "fs";
import xlsx from "xlsx";
import { get_BulkAPI } from "../lib/getBulkAPI.js";

// Check Directory
const dir = fs.existsSync("../result/Bulk_API_Result");
if(!dir) fs.mkdirSync("../result/Bulk_API_Result");

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
            fs.writeFileSync('../result/Bulk_API_Result/Bulk_API_' + cur_sc + '.json', result);
            console.log("BulkAPI_" + cur_sc + "_JSON File Saved!");
            
            // Creat Excel File
            var workSheet = xlsx.utils.json_to_sheet(result);
            xlsx.utils.book_append_sheet(workBook, workSheet, cur_sc);
            xlsx.writeFile(workBook, "../result/Bulk_API_Result/Bulk_API_" + cur_sc + ".xlsx");
        
        }catch(e){
            console.log("Not Exist Data : " + e);
        }       
    });
}
