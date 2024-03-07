/***********************************************************************
 
    Bulk - Search API Data Matching Process
    Process : S28_api_cmp.js

    사용법(개별 사용시)
    1. api_bulk와 api_search 데이터 출력과정이 끝났을 때 엑셀만 따로 출력해보고 싶을때 사용
    2. main >> api_remote 사용 안하고 개별로 데이터를 출력했을 시 사용
    3. config.js에 저장되는 위치 확인 후 readFileSync부분에 저장되는 코드 부분을 확인
    4. mergeReport 터미널을 연 후 node S28_api_cmp 엔터
    5. 엑셀이 저장되는 result폴더에서 엑셀 내용 확인
 
 ***********************************************************************/

////////////////////// Base Variable //////////////////////
const fs = require('fs');
const xlsx = require('xlsx');
const { sitecode, searchsave, bulksave, report } = require('../../../config/config.js');

var result;
var comment;
var rsData = new Array();
var rsJson = new Object();
var api_Buffer;
var api_String;
var api_Data;
var bulk_Buffer;
var bulk_String;
var bulk_Data;
///////////////////////////////////////////////////////////


// Main Process
const workBook = xlsx.utils.book_new();

for(var t = 0; t < sitecode.length; t++) {
    rsJson = new Object();
    rsData = new Array();

    // Get Search API Result Data
    api_Buffer = fs.readFileSync(searchsave + "Search_API_" + sitecode[t] + '.json');
    api_String = api_Buffer.toString();
    api_Data = JSON.parse(api_String);
    console.log("Get Search");

    // Get Bulk API Result Data
    bulk_Buffer = fs.readFileSync(bulksave + "Bulk_API_" +sitecode[t] + '.json');
    bulk_String = bulk_Buffer.toString();
    bulk_Data = JSON.parse(bulk_String);
    console.log("Get Bulk");

    // Find Modelcode to Mapping in Search API Data
    bulk_Data.filter(bulk => {
        var check = false;
        api_Data.forEach(search => {  
            if(bulk.bulkModelCode == search.modelCode) {
                compare(bulk, search);
                check = true;
            }
        });
        if(check == false){
            write_Onlyapi(bulk);
        }
    });

    // Creat Excel File
    var workSheet = xlsx.utils.json_to_sheet(rsData);
    xlsx.utils.book_append_sheet(workBook, workSheet, sitecode[t]);
}

xlsx.writeFile(workBook, report + 'Bulk_Search_Compare_Result.xlsx');
console.log("Bulk and Search API Data Compare Result File Saved!");


/***********************************************************************
 
    Function : Compare to Bulk API Data and Search API Data
    Process : compare(bulk, search)
    Writer  : JK
    Data    : 2022-05-17
 
 ***********************************************************************/
function compare(bulk, search) {
    var tg = 0;
    comment = "";
    // Compare Stock
    if(search.ctaType != bulk.bulkStock) {
        comment += "| Stock ";
        tg++;
    }
    
    // Compare Guest Price
    if(bulk.bulkGuestPrice == undefined) bulk.bulkGuestPrice = "";
    if(search.promotionPriceDisplay != bulk.bulkGuestPrice) {
        comment += "| Guest_Price[ " + bulk.bulkGuestPrice + " :: " + search.promotionPriceDisplay+ " ] ";
        tg++;
    }
    

    // 변경점
    // 추가부분 bulk_promotionPrice 부분을 search_promotionPriceDisplay와 같지 않거나 smbPromotionPriceDisplay와 같지 않을때 Fail처리
    // Compare Promotion Price
    if(bulk.bulkPromotionPrice == undefined) bulk.bulkPromotionPrice = "";
    if(bulk.bulkPromotionPrice != "" && search.promotionPriceDisplay != bulk.bulkPromotionPrice && search.smbPromotionPriceDisplay != bulk.bulkPromotionPrice) {
        comment += "| Promotion_Price[ " + bulk.bulkPromotionPrice + " :: " + search.promotionPriceDisplay + " ] ";
        tg++;
    }

    // 변경점
    // 비교대상변경 bulk_SMBPrice와 search_PriceDisplay와 비교 후 같지 않으면 Fail 처리
    // Compare SMBPromotion Price
    if(bulk.bulkSMBPrice == undefined) bulk.bulkSMBPrice = "";
    if(bulk.bulkSMBPrice != "" && search.priceDisplay  != bulk.bulkSMBPrice) {
        comment += "| SMB Price[ " + bulk.bulkSMBPrice + " :: " + search.priceDisplay + " ] ";
        tg++;
    }

    // 수정 시작

    // Tiered에 있는 1-3,4-6 부분을 "-"형태를 분리해서 앞에 1,4,7 부분을 이용 길이를 1로 잡고 1이거나 또는 1이 아니고 공백을 경우 comment에 "TieredPrice SetUp Issue"로 표시

    // compare tiered
    if(bulk.bulkTiered == undefined) bulk.bulkTiered = "";
    var bulkTiereds = bulk.bulkTiered.split("-");

    if(bulkTiereds[0] == "1" && bulkTiereds.length == 1 || bulkTiereds[0] != "1" && bulkTiereds[0] != "") {
        comment += "TieredPrice SetUp Issue";
        tg++;
    }


    // bulkPrice에 나오는 가격 $300/$700/$1000 부분을 "/" 형태를 분리해서 앞에 가격만으로 비교
    // Search.TierdPriceDisplay가 공백이 아니고 Search에 나오는 가격과 bulkPrice에 첫번째 가격이 같지 않을 경우 comment에 표시

    // Compare tieredPrice
    // 수정 중
    if(bulk.bulkTieredPrice == undefined) bulk.bulkTieredPrice = "";
    if(search.tieredPriceDisplay == undefined) search.tieredPriceDisplay = "";
    var bulkPrice = bulk.bulkTieredPrice.split("/");

    if(search.tieredPriceDisplay != "" && search.tieredPriceDisplay != bulkPrice[0]) {
        comment += "| tieredPrice[ " + (bulkPrice[0] ? bulkPrice[0].trim() : "")  + " :: " + search.tieredPriceDisplay + " ] ";
        tg++;
    }
  
    // Total Result
    if(tg == 0) {
        result = "Pass";
    } else {
        result = "Fail";
    }

    write_Result(bulk, search);

}

/***********************************************************************
 
    Function : Writing Result Data to JSON
    Process : write_Result(bulk, search)
    Writer  : JK
    Data    : 2022-05-17
 
 ***********************************************************************/
function write_Result(bulk, search) {
    rsJson = new Object();

    // Writing Compare Result Data
    rsJson.Total_Result = result;
    rsJson.Comment = comment;

    // Writing Search API Data
    rsJson.familyRecord = search.familyRecord;
    rsJson.diplayName = search.displayName;
    rsJson.modelCode = search.modelCode;
    rsJson.ctaType = search.ctaType;
    rsJson.smbPromotionPriceDisplay = search.smbPromotionPriceDisplay;
    rsJson.taxExPriceDisplay = search.taxExPriceDisplay;
    rsJson.promotionPriceDisplay = search.promotionPriceDisplay;
    rsJson.priceDisplay = search.priceDisplay;
    rsJson.saveText = search.saveText;
    rsJson.taxExTieredPriceDisplay = search.taxExTieredPriceDisplay;
    rsJson.tieredPriceDisplay = search.tieredPriceDisplay;

    // Writing Bulk API Data
    rsJson.Bulk_modelCode = bulk.bulkModelCode;
    rsJson.Bulk_Stock = bulk.bulkStock;
    rsJson.Bulk_promotionPrice = bulk.bulkPromotionPrice;
    rsJson.Bulk_SMBPrice = bulk.bulkSMBPrice;
    rsJson.Bulk_Guestprice = bulk.bulkGuestPrice;
    rsJson.BulkTiered = bulk.bulkTiered;
    rsJson.BulkTieredPrice = bulk.bulkTieredPrice;

    rsData.push(rsJson);
    // console.log("Push OK...");
}

/***********************************************************************
 
    Function : Writing OnlyAPI Data to JSON
    Process : write_Onlyapi(i)
    Writer  : JK
    Data    : 2022-04-07
 
 ***********************************************************************/
function write_Onlyapi(bulk) {
    rsJson = new Object();
    
    rsJson.Total_Result = "N/A";
    rsJson.Comment = "OnlyBulkAPI";

    // Writing API Data
    rsJson.Bulk_modelCode = bulk.bulkModelCode;
    rsJson.Bulk_Stock = bulk.bulkStock;
    rsJson.Bulk_promotionPrice = bulk.bulkPromotionPrice;
    rsJson.Bulk_SMBPrice = bulk.bulkSMBPrice;
    rsJson.Bulk_Guestprice = bulk.bulkGuestPrice;
    rsJson.BulkTiered = bulk.bulkTiered;
    rsJson.BulkTieredPrice = bulk.bulkTieredPrice;

    rsData.push(rsJson);
    // console.log("OnlyAPI Push OK...");
}
