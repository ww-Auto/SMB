/***********************************************************************
 
    Bulk - Search API Data Matching Process
    Process : S28_1202_cmp.js
    Writer  : JK
    Data    : 2022-05-17
 
 ***********************************************************************/

////////////////////// Base Variable //////////////////////
const fs = require('fs');
const xlsx = require('xlsx');
const { sitecode } = require('../../../config/config.js');

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
    api_Buffer = fs.readFileSync("D:\\SMB\\outputs\\api\\search\\Search_API_" + sitecode[t] + '.json');
    api_String = api_Buffer.toString();
    api_Data = JSON.parse(api_String);
    console.log("Get Search");

    // Get Bulk API Result Data
    bulk_Buffer = fs.readFileSync("D:\\SMB\\outputs\\api\\bulk\\Bulk_API_" +sitecode[t] + '.json');
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

xlsx.writeFile(workBook, 'D:\\SMB\\result\\Bulk_Search_Compare_Result.xlsx');
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
    if(search.priceDisplay != bulk.bulkGuestPrice) {
        comment += "| Guest_Price[ " + bulk.bulkGuestPrice + " :: " + search.priceDisplay+ " ] ";
        tg++;
    }
    
    // Compare Promotion Price
    if(bulk.bulkPromotionPrice == undefined) bulk.bulkPromotionPrice = "";
    if(bulk.bulkPromotionPrice != "" && search.promotionPriceDisplay != bulk.bulkPromotionPrice) {
        comment += "| Promotion_Price[ " + bulk.bulkPromotionPrice + " :: " + search.promotionPriceDisplay + " ] ";
        tg++;
    }

    // Compare SMBPromotion Price
    if(bulk.blukSMBPrice == undefined) bulk.blukSMBPrice = "";
    if(bulk.blukSMBPrice != "" && search.smbPromotionPriceDisplay  != bulk.blukSMBPrice) {
        comment += "| SMB Promotion_Price[ " + bulk.blukSMBPrice + " :: " + search.smbPromotionPriceDisplay  + " ] ";
        tg++;
    }

    // Compare tieredPrice
    if(bulk.bulkTieredPrice == undefined) bulk.bulkTieredPrice = "";
    if(search.tieredPriceDisplay == undefined) search.tieredPriceDisplay = "";
    if(search.tieredPriceDisplay != bulk.bulkTieredPrice) {
        comment += "| tieredPrice[ " + bulk.bulkTieredPrice  + " :: " + search.tieredPriceDisplay + " ] ";
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
    rsJson.Bulk_promotionPrice = bulk.bulkSMBPrice;
    rsJson.Bulk_smbPromotionPrice = bulk.bulkPromotionPrice;
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
    rsJson.Bulk_smbPromotionPrice = bulk.bulkSMBPrice;
    rsJson.Bulk_Guestprice = bulk.bulkGuestPrice;
    rsJson.BulkTiered = bulk.bulkTiered;
    rsJson.BulkTieredPrice = bulk.bulkTieredPrice;

    rsData.push(rsJson);
    // console.log("OnlyAPI Push OK...");
}
