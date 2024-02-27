import fs from "fs";
import xlsx from "xlsx";
import * as convert from '../../../lib/convertString.js';
import * as testAssert from '../../../lib/testAssert.js';
import { sitecode, searchAPIPath, pfgueatPath  } from "../../../config/config.js";


var rsData = new Array();
var rsJson = new Object();
var api_Buffer;
var api_String;
var api_Data;
var pf_Buffer;
var pf_String;
var pf_Data;

var rsFailData = new Array(); 

var savePath = "../../../outputs/report/"; 

await task_excel(); // 엑셀 익스포트용 
await task_excel_fail(); // fail 시트 뽑기 
// ToDo : fail 시트 하나로 합치기 필요

// excel_data
async function task_excel() {
    const workBook = xlsx.utils.book_new();

     for(var t = 0; t < sitecode.length; t++) {
        
        rsData = new Array(); 

        api_Buffer = fs.readFileSync(searchAPIPath + 'Search_API_'+sitecode[t]+'.json');
        api_String = api_Buffer.toString();
        api_Data = JSON.parse(api_String);

        pf_Buffer = fs.readFileSync(pfgueatPath +sitecode[t] + '_guest_PF_output.json');
        pf_String = pf_Buffer.toString();
        pf_Data = JSON.parse(pf_String);
        
        var check = false;  
        for(var j =0; j < pf_Data.length; j++){
            if(pf_Data[j].status != "rejected") {
                for(var i = 0; i < api_Data.length; i++) {
                    var arrTestData = new Array(); 
                    for(var n = 0; n < pf_Data[j].value.length; n++) {
                        if(pf_Data[j].value[n].PF_SKU == api_Data[i].modelCode) {  
                            arrTestData.push(parsingTestData(j,n,i,sitecode[t])); // 테스트 데이터 파싱
                            await Compare_Excel(arrTestData, sitecode[t]);  // 매칭 
                            parsingOriginData(pf_Data, j, n, api_Data, i); // 기존 데이터 쓰기 
                            
                            rsData.push(rsJson);
                            rsFailData.push(rsJson); 
                            check = true; 
                            break; 
                        }  
                    }

                    if(check == false){       // only api   
                        arrTestData.push(parsingTestDataonlyAPI(i,sitecode[t])); 
                        await Compare_Excel(arrTestData, sitecode[t]); 
                        parsingOriginData_onlyAPI(api_Data, i);
                        rsData.push(rsJson);
                        rsFailData.push(rsJson); 
                    }
                }
            }  
        }
        
        // Creat Excel Sheet
        var workSheet = xlsx.utils.json_to_sheet(rsData);
        xlsx.utils.book_append_sheet(workBook, workSheet, sitecode[t]);
    }

     xlsx.writeFile(workBook, savePath + "SearchAPI_PF(Guest)_Report.xlsx");
     console.log("Excel Result File Saved!");

     // fail data만 뽑기 위해 json도 저장 
     const merge = JSON.stringify(rsFailData);
     fs.writeFileSync(savePath + 'SearchAPI_PF(Guest)_Report.json', merge);
     console.log("Json Result File Saved!");
}

function parsingOriginData(pf_Data, j, n, api_Data, i) {
    //rsJson = new Object(); 

    // search api data
    rsJson.API_familyRecord = api_Data[i].familyRecord;
    rsJson.API_diplayName = api_Data[i].displayName;
    rsJson.API_modelCode = api_Data[i].modelCode;
    rsJson.pviTypeName = api_Data[i].pviTypeName;
    rsJson.API_pviSubtypeName = api_Data[i].pviSubtypeName;
    rsJson.API_ctaType = api_Data[i].ctaType;
    rsJson.API_smbPromotionPriceDisplay = api_Data[i].smbPromotionPriceDisplay;
    rsJson.API_taxExPriceDisplay = api_Data[i].taxExPriceDisplay;
    rsJson.API_promotionPriceDisplay = api_Data[i].promotionPriceDisplay;
    rsJson.API_priceDisplay = api_Data[i].priceDisplay;
    rsJson.API_saveText = api_Data[i].saveText;
    rsJson.API_taxExTieredPriceDisplay = api_Data[i].taxExTieredPriceDisplay;
    rsJson.API_tieredPriceDisplay = api_Data[i].tieredPriceDisplay;
    rsJson.API_marketingpdpYN = api_Data[i].marketingpdpYN;
    rsJson.API_tradeIn = api_Data[i].tradeIn;
    rsJson.API_KeySummaryTitle = api_Data[i].KeySummaryTitle;
    rsJson.API_KeySummaryImgUrl = api_Data[i].KeySummaryImgUrl;
    rsJson.API_pdpUrl = api_Data[i].pdpUrl;
    rsJson.API_originPdpUrl = api_Data[i].originPdpUrl;
    rsJson.API_fmyChip1 = api_Data[i].fmyChipList;
    rsJson.API_fmyChip2 = api_Data[i].fmyChipList2;
    if(api_Data[i].fmyChipList2 == null) rsJson.API_fmyChip2 = "";

    // pf scrapping data
    rsJson.PF_NUM = pf_Data[j].value[n].NUM;
    rsJson.PF_URL = pf_Data[j].value[n].PF_URL;
    rsJson.PF_SKU = pf_Data[j].value[n].PF_SKU;
    rsJson.PF_DISPLAYNAME = pf_Data[j].value[n].PF_DISPLAYNAME;
    rsJson.PF_COLOR = pf_Data[j].value[n].PF_COLOR;
    rsJson.PF_MEMORY = pf_Data[j].value[n].PF_MEMORY;
    rsJson.PF_PRICE_PROMOTION = pf_Data[j].value[n].PF_PRICE_PROMOTION;
    rsJson.PF_PRICE_SAVE = pf_Data[j].value[n].PF_PRICE_SAVE;
    rsJson.PF_PRICE_ORIGINAL = pf_Data[j].value[n].PF_PRICE_ORIGINAL;
    rsJson.PF_TIERED_MIN = pf_Data[j].value[n].PF_TIERED_MIN;
    rsJson.PF_TIERED_PRICE = pf_Data[j].value[n].PF_TIERED_PRICE;
    rsJson.PF_CTA_1_STOCK = pf_Data[j].value[n].CTA_1_STOCK;
    rsJson.PF_CTA_1_URL = pf_Data[j].value[n].CTA_1_URL;
    rsJson.PF_CTA_2_STOCK = pf_Data[j].value[n].CTA_2_STOCK;
    rsJson.PF_CTA_2_URL = pf_Data[j].value[n].CTA_2_URL;
}

function parsingOriginData_onlyAPI(api_Data, i) {
    //rsJson = new Object(); 

    // search api data
    rsJson.API_familyRecord = api_Data[i].familyRecord;
    rsJson.API_diplayName = api_Data[i].displayName;
    rsJson.API_modelCode = api_Data[i].modelCode;
    rsJson.pviTypeName = api_Data[i].pviTypeName;
    rsJson.API_pviSubtypeName = api_Data[i].pviSubtypeName;
    rsJson.API_ctaType = api_Data[i].ctaType;
    rsJson.API_smbPromotionPriceDisplay = api_Data[i].smbPromotionPriceDisplay;
    rsJson.API_taxExPriceDisplay = api_Data[i].taxExPriceDisplay;
    rsJson.API_promotionPriceDisplay = api_Data[i].promotionPriceDisplay;
    rsJson.API_priceDisplay = api_Data[i].priceDisplay;
    rsJson.API_saveText = api_Data[i].saveText;
    rsJson.API_taxExTieredPriceDisplay = api_Data[i].taxExTieredPriceDisplay;
    rsJson.API_tieredPriceDisplay = api_Data[i].tieredPriceDisplay;
    rsJson.API_marketingpdpYN = api_Data[i].marketingpdpYN;
    rsJson.API_tradeIn = api_Data[i].tradeIn;
    rsJson.API_KeySummaryTitle = api_Data[i].KeySummaryTitle;
    rsJson.API_KeySummaryImgUrl = api_Data[i].KeySummaryImgUrl;
    rsJson.API_pdpUrl = api_Data[i].pdpUrl;
    rsJson.API_originPdpUrl = api_Data[i].originPdpUrl;
    rsJson.API_fmyChip1 = api_Data[i].fmyChipList;
    rsJson.API_fmyChip2 = api_Data[i].fmyChipList2;
    if(api_Data[i].fmyChipList2 == null) rsJson.API_fmyChip2 = "";

    // pf scrapping data
    rsJson.PF_NUM = "";
    rsJson.PF_URL = "";
    rsJson.PF_SKU = "";
    rsJson.PF_DISPLAYNAME = "";
    rsJson.PF_COLOR = "";
    rsJson.PF_MEMORY = "";
    rsJson.PF_PRICE_PROMOTION = "";
    rsJson.PF_PRICE_SAVE = "";
    rsJson.PF_PRICE_ORIGINAL = "";
    rsJson.PF_TIERED_MIN = "";
    rsJson.PF_TIERED_PRICE = "";
    rsJson.PF_CTA_1_STOCK = "";
    rsJson.PF_CTA_1_URL = "";
    rsJson.PF_CTA_2_STOCK = "";
    rsJson.PF_CTA_2_URL = "";
}

async function Compare_Excel(arrTestData, site){
   
    await arrTestData.forEach(function(value, i) {

        rsJson = new Object(); 

        rsJson.site = site; 
        rsJson.testTotal = "";

        // only API 처리 
        if(value.test_data.result == "only API"){ 
            rsJson.testonlyAPI = "N/A";    
            rsJson.testonlyAPIComment = "only API";
            rsJson.testSKU ="";
            rsJson.testSKUComment ="";
            rsJson.testDisplayName ="";
            rsJson.testDisplayNameComment ="";
            rsJson.testChip ="";
            rsJson.testChipComment ="";
            rsJson.testpromotionPrice ="";
            rsJson.testpromotionPriceComment ="";
            rsJson.testoriginPrice ="";
            rsJson.testoriginPriceComment ="";
            rsJson.teststock ="";
            rsJson.teststockComment ="";
        }
        else {           
            rsJson.testonlyAPI = "Pass";  
            rsJson.testonlyAPIComment = "";

            // case 1. sku 
            var testResult = testAssert.Assert_Equal("sku", value.api_data.sku, value.scrapping_data.sku,""); 
            rsJson.testSKU = testResult.result; 
            rsJson.testSKUComment = testResult.data.expected + " :: " + testResult.data.actual;

            // case 2. display name 
            testResult = testAssert.Assert_Equal("displayname", value.api_data.displayName, value.scrapping_data.displayName,""); 
            rsJson.testDisplayName =  testResult.result; 
            rsJson.testDisplayNameComment = testResult.data.expected + " :: " + testResult.data.actual;

            // case 3. chip  
            var expected_chipdata = convert.replaceNA(value.api_data.fmyChipList) + convert.replaceNA(value.api_data.fmyChipList2); 
            var actual_chipdata = convert.replaceNA(value.scrapping_data.colorchip) + convert.replaceNA(value.scrapping_data.memorychip); 
            var testResult_chip1  = testAssert.Assert_Equal("chip", expected_chipdata, actual_chipdata,""); 
            
            expected_chipdata = convert.replaceNA(value.api_data.fmyChipList2) + convert.replaceNA(value.api_data.fmyChipList); 
            actual_chipdata = convert.replaceNA(value.scrapping_data.memorychip) + convert.replaceNA(value.scrapping_data.colorchip); 
            var testResult_chip2  = testAssert.Assert_Equal("chip", expected_chipdata, actual_chipdata,""); 

            if(testResult_chip1  == "Fail" && testResult_chip2  == "Fail"){
                rsJson.testChip = testResult_chip1.result; 
                rsJson.testChipComment = testResult_chip1.data.expected + " :: " + testResult_chip1.data.actual;
            }
            else{
                rsJson.testChip = "Pass"; 
                rsJson.testChipComment = testResult_chip1.data.expected + " :: " + testResult_chip1.data.actual;
            }
            
            // case 4. promotionPrice 
            testResult = testAssert.Assert_Equal("promotionPrice", value.api_data.promotionPrice, value.scrapping_data.promotionPrice,""); 
            rsJson.testpromotionPrice =  testResult.result;
            rsJson.testpromotionPriceComment = testResult.data.expected + " :: " + testResult.data.actual;

            // case 5. stock 
            var expected_ctatype = value.api_data.stockCTA; 
            var actual_ctatype = value.scrapping_data.stockCTA; 
            if(expected_ctatype == "learnMore") {
                expected_ctatype = ""; 
            } 
            else if(actual_ctatype == "pre-order") {
                actual_ctatype = "preOrder"; 
            }
            testResult = testAssert.Assert_Equal("stock", expected_ctatype, actual_ctatype,""); 
            rsJson.teststock = testResult.result; 
            rsJson.teststockComment = testResult.data.expected + " :: " + testResult.data.actual;
        }

        // total result 
        if(rsJson.testonlyAPI == "N/A") {
            rsJson.testTotal = "N/A"; 
        }
        else if(rsJson.testSKU == "Pass" && rsJson.testDisplayName == "Pass" && rsJson.testChip == "Pass" && rsJson.testpromotionPrice == "Pass" && rsJson.teststock == "Pass") {
            rsJson.testTotal = "Pass";
        }
        else{
            rsJson.testTotal = "Fail";
        }

   })
}


function parsingTestDataonlyAPI(i,site){
    var row = {
        test_data : {
            result : "only API", 
            site : site
        }, 
        scrapping_data : {
            sku: "",
            displayName : "",
            colorchip : "",
            memorychip :"",
            
            url : "",
            promotionPrice : "",
            originPrice : "",

            stockCTA : ""
        },
        api_data : {
            sku: api_Data[i].modelCode,
            displayName : convert.replaceR(api_Data[i].displayName), 
            fmyChipList : api_Data[i].fmyChipList,
            fmyChipList2 : api_Data[i].fmyChipList2,
            
            url : api_Data[i].pdpUrl,
            promotionPrice :  parseInt(convert.tpRemake(api_Data[i].promotionPriceDisplay)),
            originPrice : parseInt(convert.tpRemake(api_Data[i].priceDisplay)),

            stockCTA : api_Data[i].ctaType // buyNow CTA
        }
    }

    return row; 
}

function parsingTestData(j,n, i, site) {
    var row = {
        test_data : {
            result : "pass", 
            site : site
        }, 
        scrapping_data : {
            sku: pf_Data[j].value[n].PF_SKU,
            displayName : convert.replaceR(pf_Data[j].value[n].PF_DISPLAYNAME), 
            colorchip : pf_Data[j].value[n].PF_COLOR,
            memorychip : pf_Data[j].value[n].PF_MEMORY,
            
            url : pf_Data[j].value[n].PF_URL,
            promotionPrice : convert.tpRemake(pf_Data[j].value[n].PF_PRICE_PROMOTION),
            originPrice : convert.tpRemake(pf_Data[j].value[n].PF_PRICE_ORIGINAL),

            stockCTA : pf_Data[j].value[n].CTA_1_STOCK, // buyNow CTA
        },
        api_data : {
            sku: api_Data[i].modelCode,
            displayName : convert.replaceR(api_Data[i].displayName), 
            fmyChipList : api_Data[i].fmyChipList,
            fmyChipList2 : api_Data[i].fmyChipList2,
            
            url : api_Data[i].pdpUrl,
            promotionPrice :  convert.tpRemake(api_Data[i].promotionPriceDisplay),
            originPrice : convert.tpRemake(api_Data[i].priceDisplay),

            stockCTA : api_Data[i].ctaType // buyNow CTA
        }
    }

    return row; 
}

async function task_excel_fail() {
    const workBook = xlsx.utils.book_new();
  
    
    rsData = new Array(); 
    rsJson = new Object(); 

    pf_Buffer = fs.readFileSync(savePath + 'SearchAPI_PF(Guest)_Report.json');
    pf_String = pf_Buffer.toString();
    pf_Data = JSON.parse(pf_String);

    console.log(pf_Data.length); 

    parsingFailData(pf_Data); 


    // Creat Excel Sheet
    var workSheet = xlsx.utils.json_to_sheet(rsData);
    xlsx.utils.book_append_sheet(workBook, workSheet, "Fail_Data");
    xlsx.writeFile(workBook, savePath + "SearchAPI_PF(Guest)_Report_Fail.xlsx");
    console.log("Excel Result File Saved!");
}


async function parsingFailData(pf_Data){
   
    await pf_Data.forEach(function(value) {

        //console.log(value.testTotal, value.testSKU); 

        if(value.testTotal == "Fail"){

            rsJson = new Object(); 

            rsJson.site = value.site; 
            rsJson.IssueType = ""; 
            rsJson.testTotal = value.testTotal; 
            rsJson.testonlyAPI = value.testonlyAPI;
            rsJson.testonlyAPIComment = value.testonlyAPIComment;
            rsJson.testSKU = value.testSKU;
            rsJson.testSKUComment = value.testSKUComment;
            rsJson.testDisplayName = value.testDisplayName;
            rsJson.testDisplayNameComment = value.testDisplayNameComment; 
            rsJson.testChip = value.testChip;
            rsJson.testChipComment = value.testChipComment;
            rsJson.testpromotionPrice = value.testpromotionPrice;
            rsJson.testpromotionPriceComment = value.testpromotionPriceComment;
            rsJson.teststock = value.teststock; 
            rsJson.teststockComment = value.teststockComment; 
            rsJson.API_familyRecord = value.API_familyRecord; 
            rsJson.API_diplayName = value.API_diplayName; 
            rsJson.API_modelCode = value.API_modelCode; 
            rsJson.pviTypeName = value.pviTypeName; 
            rsJson.API_pviSubtypeName = value.API_pviSubtypeName; 
            rsJson.API_ctaType = value.API_ctaType; 
            rsJson.API_smbPromotionPriceDisplay = value.API_smbPromotionPriceDisplay; 
            rsJson.API_taxExPriceDisplay = value.API_taxExPriceDisplay; 
            rsJson.API_promotionPriceDisplay = value.API_promotionPriceDisplay; 
            rsJson.API_priceDisplay = value.API_priceDisplay; 
            rsJson.API_saveText = value.API_saveText; 
            rsJson.API_taxExTieredPriceDisplay = value.API_taxExTieredPriceDisplay; 
            rsJson.API_tieredPriceDisplay = value.API_tieredPriceDisplay; 
            rsJson.API_marketingpdpYN = value.API_marketingpdpYN; 
            rsJson.API_tradeIn = value.API_tradeIn; 
            rsJson.API_KeySummaryTitle = value.API_KeySummaryTitle; 
            rsJson.API_KeySummaryImgUrl = value.API_KeySummaryImgUrl; 
            rsJson.API_pdpUrl = value.API_pdpUrl; 
            rsJson.API_originPdpUrl = value.API_originPdpUrl; 
            rsJson.API_fmyChip1 = value.API_fmyChip1; 
            rsJson.API_fmyChip2 = value.API_fmyChip2; 
            rsJson.PF_NUM = value.PF_NUM; 
            rsJson.PF_URL = value.PF_URL; 
            rsJson.PF_SKU = value.PF_SKU; 
            rsJson.PF_DISPLAYNAME = value.PF_DISPLAYNAME; 
            rsJson.PF_COLOR = value.PF_COLOR; 
            rsJson.PF_MEMORY = value.PF_MEMORY; 
            rsJson.PF_PRICE_PROMOTION = value.PF_PRICE_PROMOTION; 
            rsJson.PF_PRICE_SAVE = value.PF_PRICE_SAVE; 
            rsJson.PF_PRICE_ORIGINAL = value.PF_PRICE_ORIGINAL; 
            rsJson.PF_TIERED_MIN = value.PF_TIERED_MIN; 
            rsJson.PF_TIERED_PRICE = value.PF_TIERED_PRICE; 
            rsJson.PF_CTA_1_STOCK = value.PF_CTA_1_STOCK;
            rsJson.PF_CTA_1_URL = value.PF_CTA_1_URL;
            rsJson.PF_CTA_2_STOCK = value.PF_CTA_2_STOCK; 
            rsJson.PF_CTA_2_URL = value.PF_CTA_2_URL; 

            rsData.push(rsJson);
        }
   })
}



