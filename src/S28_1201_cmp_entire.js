/***********************************************************************
 
    Entire Data Merge Process Type3.ver
    Process : S28_1201_cmp_entire.js
    Writer  : JK
    Data    : 2022-10-06
 
 ***********************************************************************/

////////////////////// Base Variable //////////////////////
import fs from "fs";
import xlsx from "xlsx-js-style";
import * as convert from '../lib/convertString.js';
import * as testAssert from '../lib/testAssert.js';
import { excIndex } from "../lib/excIndex.js";

var check = false;
var rsData = new Array();
var failData = new Array();
var failJson = new Object();
var rsJson = new Object();
var api_Buffer;
var api_String;
var api_Data;
var pf_Buffer;
var pf_String;
var pf_Data;

var entire_SC =  ["eg", "pl", "pt", "sa", "sa_en", "sg"];

await task();

// Main Process
async function task() {
    const workBook = xlsx.utils.book_new();
    failData = new Array();
    failJson = new Object();
    rsJson = new Object();
    rsData = new Array();
    
    var siteCode = entire_SC;

    for(var t = 0; t < siteCode.length; t++) {
        
        // Get Search, PD API Result Data
        api_Buffer = fs.readFileSync('../result/Search_API_Result/Search_API_' + siteCode[t] + '.json');
        api_String = api_Buffer.toString();
        api_Data = JSON.parse(api_String);

        // Get Crawling Data
        pf_Buffer = fs.readFileSync('../result/PF_Result/' + siteCode[t] + '_Entire_PD_output.json');
        pf_String = pf_Buffer.toString();
        pf_Data = JSON.parse(pf_String);

        // Find SKU to Mapping in Crawling Data 
        for(var i = 0; i < api_Data.length; i++) {
            check = false;

            // Mapping to API Data
            for(var n = 0; n < pf_Data.length; n++) {
                if(api_Data[i].modelCode == pf_Data[n].SKU) {
                    // console.log("Find Mapping...");
                    compare_excel(i, n, siteCode[t]);
                    check = true;
                    break;                         
                }
            }

            // Mapping Failed SKU (OnlyAPI)
            if(check == false) { 
                // console.log("OnlyAPI");
                write_Onlyapi(siteCode[t], i);
            }
        }

        /* If you want JSON File, active this area
        // Create JSON Data File
        const merge = JSON.stringify(rsData);
        fs.writeFileSync('Compare_.json', merge);
        console.log("JSON File Saved!");
        */
    }

    // Creat Excel Sheet
    try {
        xlsx.utils.book_append_sheet(workBook, {},"All_Fail_Row");  
        var ws6 = xlsx.utils.sheet_add_json(workBook.Sheets.All_Fail_Row, failData, { origin : "A2"});
        var prodStCol = Object.keys(failData[0]).length;
        var prodStRow = Object.keys(failData).length;
            
        for(var n = 65; n < 65 + prodStCol; n++) {
            for(var m = 1; m < prodStRow + 3; m++) {
                var t = excIndex(n);
                var p = String(m);

                // Header
                if(m == 1 && n == 65) ws6[t+p] = {t: 's', v: 'Test Case Result', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 80) ws6[t+p] = {t: 's', v: 'PF Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 89) ws6[t+p] = {t: 's', v: 'Feature PD Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 94) ws6[t+p] = {t: 's', v: 'BC Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 97) ws6[t+p] = {t: 's', v: 'Cart Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCD28"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 2 && n >= 65 && n < 80) ws6[t+p] = {t: 's', v: ws6[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 80 && n < 89) ws6[t+p] = {t: 's', v: ws6[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 89 && n < 94) ws6[t+p] = {t: 's', v: ws6[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 94 && n < 97) ws6[t+p] = {t: 's', v: ws6[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 97) ws6[t+p] = {t: 's', v: ws6[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCD28"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                
                // Data
                else {
                    try {
                        ws6[t+p] = {t: 's', v: ws6[t+p].v, s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    } catch(e) {
                        ws6[t+p] = {t: 's', v: '', s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    }
                }
            }       
        }

        ws6["!merges"] = [{s: {r:0, c:0} , e: {r:0, c:14}}, {s: {r:0, c:15} , e: {r:0, c:23}}, {s: {r:0, c:24} , e: {r:0, c:28}}, {s: {r:0, c:29} , e: {r:0, c:31}}, {s: {r:0, c:32} , e: {r:0, c:32}}];
    } catch (e) {

    }
    

    


    xlsx.utils.book_append_sheet(workBook, {},"All_Row_Data");  
    var ws7 = xlsx.utils.sheet_add_json(workBook.Sheets.All_Row_Data, rsData, { origin : "A2"});
    var prodStCol = Object.keys(rsData[0]).length;
    var prodStRow = Object.keys(rsData).length;
    
    for(var n = 65; n < 65 + prodStCol; n++) {
        for(var m = 1; m < prodStRow + 3; m++) {
            var t = excIndex(n);
            var p = String(m);

            // Header
            if(m == 1 && n == 65) ws7[t+p] = {t: 's', v: 'Test Case Result', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 103) ws7[t+p] = {t: 's', v: 'Search API Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 124) ws7[t+p] = {t: 's', v: 'PF Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 134) ws7[t+p] = {t: 's', v: 'BuyNow Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 146) ws7[t+p] = {t: 's', v: 'LearnMore Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCD28"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 158) ws7[t+p] = {t: 's', v: 'Cart Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "d2d2d2"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 2 && n >= 65 && n < 103) ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 103 && n < 124) ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 124 && n < 134) ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 134 && n < 146) ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 146 && n < 158) ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCD28"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 158) ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "d2d2d2"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            
            // Data
            else {
                try {
                    ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                } catch(e) {
                    ws7[t+p] = {t: 's', v: '', s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                }
            }
        }       
    }

    ws7["!merges"] = [{s: {r:0, c:0} , e: {r:0, c:37}}, {s: {r:0, c:38} , e: {r:0, c:58}}, {s: {r:0, c:59} , e: {r:0, c:68}}, {s: {r:0, c:69} , e: {r:0, c:80}}, {s: {r:0, c:81} , e: {r:0, c:92}}, {s: {r:0, c:93} , e: {r:0, c:95}}];

    xlsx.writeFile(workBook, "../result/Total_Result_Entire.xlsx");
    console.log("Entire Result File Saved!");
}

function compare_excel(i, n, site) {

    rsJson = new Object();
    failJson = new Object();
    rsJson.SiteCode = site;
    failJson.SiteCode = site; 

    var testResult;
    var totalFailCnt = 0;
    
    // testcase total result
    rsJson.testTotal = "Pass";
    failJson.testTotal = "Pass";
    failJson.Comment = "";

    // SKU
    testResult = testAssert.Assert_Equal("SKU", api_Data[i].modelCode, pf_Data[n].SKU,"",""); 
    rsJson.SKU = testResult.result;
    rsJson.SKU_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    
    // Display_Name
    testResult = testAssert.Assert_Equal("Display_Name", convert.replaceBr(api_Data[i].displayName), convert.replaceR(pf_Data[n].PF_DISPLAYNAME),"",""); 
    rsJson.Display_Name = testResult.result;
    rsJson.Display_Name_Comment = testResult.data.expected + " :: " + testResult.data.actual;

    // Chip_Option
    var expectedChip = [api_Data[i].fmyChipList + convert.removeU200(api_Data[i].fmyChipList2), convert.removeU200(api_Data[i].fmyChipList2) + api_Data[i].fmyChipList];
    var actualChip = pf_Data[n].PF_COLOR + convert.removeU200(pf_Data[n].PF_MEMORY);
     
    testResult = testAssert.Assert_Equal_ExpArray("Chip_Option", expectedChip, actualChip,"","");
    if(testResult.data.expected == undefined) testResult.data.expected = api_Data[i].fmyChipList + convert.removeU200(api_Data[i].fmyChipList2);
    
    rsJson.Chip_Option = testResult.result; 
    rsJson.Chip_Option_Comment = testResult.data.expected + " :: " + testResult.data.actual;

    // PF Price 관련
    var exp_PromotionPrice = "";
    var exp_PromotionPrices = new Array(); 
    var act_PromotionPrice = ""; 

    var exp_OriginPrice = ""; 
    var act_OriginPrice = ""; 

    var exp_SavePrice = ""; 
    var act_SavePrice = ""; 

    exp_PromotionPrices = [api_Data[i].promotionPriceDisplay];

    exp_OriginPrice = api_Data[i].priceDisplay; 
    act_OriginPrice = convert.replaceNA(pf_Data[n].PF_PRICE_ORIGINAL);

    if(api_Data[i].priceDisplay != "" && api_Data[i].smbPromotionPriceDisplay != "" && api_Data[i].saveText == "") {
        exp_SavePrice = parseInt(convert.saveRemake(api_Data[i].priceDisplay)) - parseInt(convert.saveRemake(api_Data[i].promotionPriceDisplay));
        act_SavePrice = parseInt(convert.saveRemake(pf_Data[n].PF_PRICE_ORIGINAL)) - parseInt(convert.saveRemake(pf_Data[n].PF_PRICE_PROMOTION));
    } else {
        exp_SavePrice = api_Data[i].saveText;
        act_SavePrice = convert.saveRemake(pf_Data[n].PF_PRICE_SAVE);
    }
        
    
    // PromotionPrice 
    act_PromotionPrice = convert.replaceNA(pf_Data[n].PF_PRICE_PROMOTION);
    testResult = testAssert.Assert_Equal_ExpArray("PromotionPrice", exp_PromotionPrices, act_PromotionPrice,"","");
    rsJson.PromotionPrice = testResult.result; 
    rsJson.PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

    exp_PromotionPrice = testResult.data.expected;

    // OriginPrice
    if(exp_SavePrice != "") {
        testResult = testAssert.Assert_Equal("OriginPrice", exp_OriginPrice, act_OriginPrice,"","");  
        rsJson.OriginPrice_Match = testResult.result; 
        rsJson.OriginPrice_Comment = (testResult.data.expected).toString() + " :: " + (testResult.data.actual).toString();

        // SavePrice 
        testResult = testAssert.Assert_Equal("SavePrice", exp_SavePrice, act_SavePrice,"","");
        rsJson.SavePrice_Match = testResult.result; 
        rsJson.SavePrice_Comment = (testResult.data.expected).toString() + " :: " + (testResult.data.actual).toString();

    } else {
        rsJson.OriginPrice_Match = "N/A";
        rsJson.OriginPrice_Comment = "N/A";
        rsJson.SavePrice_Match = "N/A";
        rsJson.SavePrice_Comment = "N/A";
    }
    
    // Stock Check
    var exp_Stock = ""; 
    var act_Stock = pf_Data[n].BUY_NOW_CTA_STOCK; 

    if(api_Data[i].ctaType == "lowStock" || api_Data[i].ctaType == "inStock") { 
        exp_Stock = "inStock";
    }
    else if(api_Data[i].ctaType == "outOfStock") { 
        exp_Stock = "outOfStock"; 
    }
    else if(api_Data[i].ctaType == "preOrder") {
        exp_Stock = "preOrder";
    }
    else if(api_Data[i].ctaType == "learnMore"){ // not stock 
        exp_Stock = undefined;   
    }

    // Stock 
    testResult = testAssert.Assert_Equal("Stock", exp_Stock, act_Stock,"",""); 
    
    rsJson.Stock = testResult.result;
    rsJson.Stock_Comment = testResult.data.expected + " :: " + testResult.data.actual;

    // BuyNowCTA_PDType
    var exp_BuyNowCTA_PDType = "";
    if(testResult.data.expected == "inStock") exp_BuyNowCTA_PDType = "STANDARD";
    if(testResult.data.expected == "inStock" && api_Data[i].pviTypeName == "Mobile") exp_BuyNowCTA_PDType = "FEATURE";
    var act_BuyNowCTA_PDType = pf_Data[n].BUY_NOW_PD_TYPE;

    if(testResult.data.expected != "inStock") {
        rsJson.BuyNowCTA_PDType = "N/A";
        rsJson.BuyNowCTA_PDType_Comment = "N/A";
    }
    else {
        testResult = testAssert.Assert_Equal("BuyNowCTA_PDType", exp_BuyNowCTA_PDType, act_BuyNowCTA_PDType,"","");
        rsJson.BuyNowCTA_PDType = testResult.result;
        rsJson.BuyNowCTA_PDType_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    }

    //BuyNow_BC_PromotionPrice
    var exp_BuyNow_BC_PromotionPrice = ""; 
    var act_BuyNow_BC_PromotionPrice = "";

    if((act_Stock == "inStock" || act_Stock == "preOrder") && (act_BuyNowCTA_PDType != "MKT" && act_BuyNowCTA_PDType != "PCD" && act_BuyNowCTA_PDType != "OTHER" && act_BuyNowCTA_PDType != "404")){ 
        exp_BuyNow_BC_PromotionPrice = exp_PromotionPrice;
        act_BuyNow_BC_PromotionPrice = convert.replace00A0(pf_Data[n].BUY_NOW_BC_Promotion_Price);

        if(act_Stock == "inStock") {
            testResult = testAssert.Assert_Equal("BuyNow_PromotionPrice", exp_BuyNow_BC_PromotionPrice, act_BuyNow_BC_PromotionPrice,"","");        
            rsJson.BuyNow_BC_PromotionPrice = testResult.result; 
            rsJson.BuyNow_BC_PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

            var exp_BuyNow_BC_OriginPrice = api_Data[i].priceDisplay;
            var act_BuyNow_BC_OriginPrice = pf_Data[n].BUY_NOW_BC_Original_Price;

            if(api_Data[i].promotionPriceDisplay != exp_BuyNow_BC_OriginPrice) {
                testResult = testAssert.Assert_Equal("BuyNow_OriginPrice", exp_BuyNow_BC_OriginPrice, act_BuyNow_BC_OriginPrice,"","");        
                rsJson.BuyNow_BC_OriginPrice = testResult.result; 
                rsJson.BuyNow_BC_OriginPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

                var exp_BuyNow_BC_SavePrice = api_Data[i].saveText;
                var act_BuyNow_BC_SavePrice = pf_Data[n].BUY_NOW_BC_Save_Price;

                testResult = testAssert.Assert_Equal("BuyNow_SavePrice", exp_BuyNow_BC_SavePrice, act_BuyNow_BC_SavePrice,"","");        
                rsJson.BuyNow_BC_SavePrice = testResult.result; 
                rsJson.BuyNow_BC_SavePrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

            } else {
                rsJson.BuyNow_BC_OriginPrice = "N/A";
                rsJson.BuyNow_BC_OriginPrice_Comment = "N/A";
                rsJson.BuyNow_BC_SavePrice = "N/A";
                rsJson.BuyNow_BC_SavePrice_Comment = "N/A";
            }          
        }
        else {
            rsJson.BuyNow_BC_PromotionPrice = "N/A";
            rsJson.BuyNow_BC_PromotionPrice_Comment = "N/A";
            rsJson.BuyNow_BC_OriginPrice = "N/A";
            rsJson.BuyNow_BC_OriginPrice_Comment = "N/A";
            rsJson.BuyNow_BC_SavePrice = "N/A";
            rsJson.BuyNow_BC_SavePrice_Comment = "N/A";
        }
    }
    else {
        rsJson.BuyNow_BC_PromotionPrice = "N/A";
        rsJson.BuyNow_BC_PromotionPrice_Comment = "N/A";
        rsJson.BuyNow_BC_OriginPrice = "N/A";
        rsJson.BuyNow_BC_OriginPrice_Comment = "N/A";
        rsJson.BuyNow_BC_SavePrice = "N/A";
        rsJson.BuyNow_BC_SavePrice_Comment = "N/A";
    }

    // LearnMoreCTA
    var exp_LearnMoreCTA_PDType = "STANDARD"; 
    var act_LearnMoreCTA_PDType = pf_Data[n].LEARN_MORE_PD_TYPE; 

    if(api_Data[i].pviTypeName == "Mobile"){
        exp_LearnMoreCTA_PDType = "FEATURE";
    }

    if(exp_Stock == "inStock" && api_Data[i].pviTypeName != "Mobile") {
        rsJson.LearnMoreCTA_PDType = "N/A";
        rsJson.LearnMoreCTA_PDType_Comment = "N/A";
    }
    else {
        testResult = testAssert.Assert_Equal("LearnMoreCTA_PDType", exp_LearnMoreCTA_PDType, act_LearnMoreCTA_PDType,"",""); 

        if(act_LearnMoreCTA_PDType == "MKT" || act_LearnMoreCTA_PDType == "PCD") {       
            rsJson.LearnMoreCTA_PDType = "Fail";
            rsJson.LearnMoreCTA_PDType_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        }
        else { 
            rsJson.LearnMoreCTA_PDType = testResult.result;
            rsJson.LearnMoreCTA_PDType_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        }
    }


    // Entire merge
    var exp_PF_promotion = pf_Data[n].PF_PRICE_PROMOTION;
    var exp_PF_origin = pf_Data[n].PF_PRICE_ORIGINAL;
    var exp_PF_save = pf_Data[n].PF_PRICE_SAVE;

    var act_Feature_promotion = pf_Data[n].LEARN_MORE_FEATURE_Promotion_Price;
    var act_Feature_origin = pf_Data[n].LEARN_MORE_FEATURE_Original_Price;
    var act_Feature_save = pf_Data[n].LEARN_MORE_FEATURE_Save_Price;

    var act_BC_promotion = pf_Data[n].LEARN_MORE_BC_Promotion_Price;
    var act_BC_origin = pf_Data[n].LEARN_MORE_BC_Original_Price;
    var act_BC_save = pf_Data[n].LEARN_MORE_BC_Save_Price;

    if((pf_Data[n].LEARN_MORE_PD_TYPE == "STANDARD" || pf_Data[n].LEARN_MORE_PD_TYPE == "FEATURE") && (site != "pl" && act_Stock != "outOfStock")) {
       if(pf_Data[n].LEARN_MORE_PD_TYPE == "FEATURE") {
            testResult = testAssert.Assert_Entire_Equal("PF-FeaturePD_PromotionPrice", exp_PF_promotion, act_Feature_promotion,"","");
            if(testResult.result == "Fail") totalFailCnt++;
            rsJson.PF_FeaturePD_PromotionPrice = testResult.result; 
            rsJson.PF_FeaturePD_PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
            failJson.PF_FeaturePD_PromotionPrice = testResult.result; 
            failJson.PF_FeaturePD_PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

            testResult = testAssert.Assert_Entire_Equal("PF-FeaturePD_OriginalPrice", exp_PF_origin, act_Feature_origin,"","");
            if(testResult.result == "Fail") totalFailCnt++;
            rsJson.PF_FeaturePD_OriginalPrice = testResult.result; 
            rsJson.PF_FeaturePD_OriginalPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
            failJson.PF_FeaturePD_OriginalPrice = testResult.result; 
            failJson.PF_FeaturePD_OriginalPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

            testResult = testAssert.Assert_Entire_Equal("PF-FeaturePD_SavePrice", exp_PF_save, act_Feature_save,"","");
            if(testResult.result == "Fail") totalFailCnt++;
            rsJson.PF_FeaturePD_SavePrice = testResult.result; 
            rsJson.PF_FeaturePD_SavePrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
            failJson.PF_FeaturePD_SavePrice = testResult.result; 
            failJson.PF_FeaturePD_SavePrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
       } else {
            rsJson.PF_FeaturePD_PromotionPrice = "N/A"; 
            rsJson.PF_FeaturePD_PromotionPrice_Comment = "N/A"; 
            failJson.PF_FeaturePD_PromotionPrice = "N/A"; 
            failJson.PF_FeaturePD_PromotionPrice_Comment = "N/A";
            rsJson.PF_FeaturePD_OriginalPrice = "N/A"; 
            rsJson.PF_FeaturePD_OriginalPrice_Comment = "N/A"; 
            failJson.PF_FeaturePD_OriginalPrice = "N/A"; 
            failJson.PF_FeaturePD_OriginalPrice_Comment = "N/A";
            rsJson.PF_FeaturePD_SavePrice = "N/A"; 
            rsJson.PF_FeaturePD_SavePrice_Comment = "N/A"; 
            failJson.PF_FeaturePD_SavePrice = "N/A"; 
            failJson.PF_FeaturePD_SavePrice_Comment = "N/A"; 
       }
      
        testResult = testAssert.Assert_Entire_Equal("PF-BC_PromotionPrice", exp_PF_promotion, act_BC_promotion,"","");
        if(testResult.result == "Fail") totalFailCnt++;
        rsJson.PF_BC_PromotionPrice = testResult.result; 
        rsJson.PF_BC_PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        failJson.PF_BC_PromotionPrice = testResult.result; 
        failJson.PF_BC_PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

        testResult = testAssert.Assert_Entire_Equal("PF-BC_OriginalPrice", exp_PF_origin, act_BC_origin,"","");
        if(testResult.result == "Fail") totalFailCnt++;
        rsJson.PF_BC_OriginalPrice = testResult.result; 
        rsJson.PF_BC_OriginalPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        failJson.PF_BC_OriginalPrice = testResult.result; 
        failJson.PF_BC_OriginalPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

        testResult = testAssert.Assert_Entire_Equal("PF-BC_SavePrice", exp_PF_save, act_BC_save,"","");
        if(testResult.result == "Fail") totalFailCnt++;
        rsJson.PF_BC_SavePrice = testResult.result; 
        rsJson.PF_BC_SavePrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        failJson.PF_BC_SavePrice = testResult.result; 
        failJson.PF_BC_SavePrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    } else {
        rsJson.PF_FeaturePD_PromotionPrice = "N/A"; 
        rsJson.PF_FeaturePD_PromotionPrice_Comment = "N/A"; 
        failJson.PF_FeaturePD_PromotionPrice = "N/A"; 
        failJson.PF_FeaturePD_PromotionPrice_Comment = "N/A";
        rsJson.PF_FeaturePD_OriginalPrice = "N/A"; 
        rsJson.PF_FeaturePD_OriginalPrice_Comment = "N/A"; 
        failJson.PF_FeaturePD_OriginalPrice = "N/A"; 
        failJson.PF_FeaturePD_OriginalPrice_Comment = "N/A";
        rsJson.PF_FeaturePD_SavePrice = "N/A"; 
        rsJson.PF_FeaturePD_SavePrice_Comment = "N/A"; 
        failJson.PF_FeaturePD_SavePrice = "N/A"; 
        failJson.PF_FeaturePD_SavePrice_Comment = "N/A";
        rsJson.PF_BC_PromotionPrice = "N/A"; 
        rsJson.PF_BC_PromotionPrice_Comment = "N/A"; 
        failJson.PF_BC_PromotionPrice = "N/A"; 
        failJson.PF_BC_PromotionPrice_Comment = "N/A";
        rsJson.PF_BC_OriginalPrice = "N/A"; 
        rsJson.PF_BC_OriginalPrice_Comment = "N/A"; 
        failJson.PF_BC_OriginalPrice = "N/A"; 
        failJson.PF_BC_OriginalPrice_Comment = "N/A";
        rsJson.PF_BC_SavePrice = "N/A"; 
        rsJson.PF_BC_SavePrice_Comment = "N/A"; 
        failJson.PF_BC_SavePrice = "N/A"; 
        failJson.PF_BC_SavePrice_Comment = "N/A"; 
    }

    // totalResult
    var ttr = true;
    if(totalFailCnt > 0){
        rsJson.testTotal = "Fail";
        failJson.testTotal = "Fail";
        ttr = false;
    }

    if(pf_Data[n].Comment == "OnlyAPI") write_Onlyapi(site, n);

    else write_Result(i, n, ttr);
}


/***********************************************************************
 
    Function : Writing Result Data to JSON
    Process : write_Result(i, n)
    Writer  : JK
    Data    : 2022-04-07
 
 ***********************************************************************/
function write_Result(i, n, checkt) {

    // Writing API Data
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
    try{
        rsJson.API_taxExTieredPriceDisplay = api_Data[i].tieredPrice.exVatTieredPrices_value;
    }catch(e){
        rsJson.API_taxExTieredPriceDisplay = "";
    }
    try{
        rsJson.API_tieredPriceDisplay = api_Data[i].tieredPrice.TieredPrices_value;
    }catch(e){
        rsJson.API_tieredPriceDisplay = "";
    }
    rsJson.API_marketingpdpYN = api_Data[i].marketingpdpYN;
    rsJson.API_tradeIn = convert.replace00A0(api_Data[i].tradeIn);
    rsJson.API_KeySummaryTitle = api_Data[i].KeySummaryTitle;
    rsJson.API_KeySummaryImgUrl = api_Data[i].KeySummaryImgUrl;
    rsJson.API_pdpUrl = api_Data[i].pdpUrl;
    rsJson.API_originPdpUrl = api_Data[i].originPdpUrl;
    rsJson.API_fmyChip1 = api_Data[i].fmyChipList;
    rsJson.API_fmyChip2 = api_Data[i].fmyChipList2;
    if(api_Data[i].fmyChipList2 == null) rsJson.API_fmyChip2 = "";

    // Writing Crawling Data
    rsJson.PF_URL = pf_Data[n].PF_URL;
    rsJson.PF_SKU = pf_Data[n].SKU;
    rsJson.PF_Display_Name = pf_Data[n].PF_DISPLAYNAME;
    rsJson.PF_COLOR = pf_Data[n].PF_COLOR;
    rsJson.PF_MEMORY = pf_Data[n].PF_MEMORY;
    rsJson.PF_Promotion_Price = pf_Data[n].PF_PRICE_PROMOTION;
    rsJson.PF_Price = pf_Data[n].PF_PRICE_ORIGINAL;
    rsJson.PF_Save_Price = pf_Data[n].PF_PRICE_SAVE;
    rsJson.PF_Tiered_Min = pf_Data[n].PF_TIERED_MIN;
    rsJson.PF_Tiered_Price = pf_Data[n].PF_TIERED_PRICE;
    rsJson.BuyNowCTA_Stock = pf_Data[n].BUY_NOW_CTA_STOCK;
    rsJson.BuyNowCTA_URL = convert.replace00A0(pf_Data[n].BUY_NOW_CTA_URL);
    rsJson.BuyNowCTA_PD_Type = pf_Data[n].BUY_NOW_PD_TYPE;
    rsJson.BuyNowCTA_Feature_PD_Promotion_Price = pf_Data[n].BUY_NOW_FEATURE_Promotion_Price;
    rsJson.BuyNowCTA_Feature_PD_Price = pf_Data[n].BUY_NOW_FEATURE_Original_Price;
    rsJson.BuyNowCTA_Feature_PD_Save_Price = pf_Data[n].BUY_NOW_FEATURE_Save_Price;
    rsJson.BuyNowCTA_PD_URL = convert.replace00A0(pf_Data[n].BUY_NOW_CTA_URL);
    rsJson.BuyNowCTA_PD_Tiered_Min = pf_Data[n].PD_Tiered_Min;
    rsJson.BuyNowCTA_PD_Tiered_Price = pf_Data[n].PD_Tiered_Price;
    rsJson.BuyNowCTA_PD_Promotion_Price = pf_Data[n].BUY_NOW_BC_Promotion_Price;
    rsJson.BuyNowCTA_PD_Price = pf_Data[n].BUY_NOW_BC_Original_Price;
    rsJson.BuyNowCTA_PD_Save_Price = pf_Data[n].BUY_NOW_BC_Save_Price;
    rsJson.LearnMoreCTA_Stock = pf_Data[n].LEARN_MORE_CTA_STOCK;
    rsJson.LearnMoreCTA_URL = convert.replace00A0(pf_Data[n].LEARN_MORE_CTA_URL);
    rsJson.LearnMoreCTA_PD_Type = pf_Data[n].LEARN_MORE_PD_TYPE;
    rsJson.LearnMoreCTA_Feature_PD_Promotion_Price = pf_Data[n].LEARN_MORE_FEATURE_Promotion_Price;
    rsJson.LearnMoreCTA_Feature_PD_Price = pf_Data[n].LEARN_MORE_FEATURE_Original_Price;
    rsJson.LearnMoreCTA_Feature_PD_Save_Price = pf_Data[n].LEARN_MORE_FEATURE_Save_Price;
    rsJson.LearnMoreCTA_PD_URL = convert.replace00A0(pf_Data[n].LEARN_MORE_CTA_URL);
    rsJson.LearnMoreCTA_PD_Tiered_Min = pf_Data[n].PD_Tiered_Min;
    rsJson.LearnMoreCTA_PD_Tiered_Price = pf_Data[n].PD_Tiered_Price;
    rsJson.LearnMoreCTA_PD_Promotion_Price = pf_Data[n].LEARN_MORE_BC_Promotion_Price;
    rsJson.LearnMoreCTA_PD_Price = pf_Data[n].LEARN_MORE_BC_Original_Price;
    rsJson.LearnMoreCTA_PD_Save_Price = pf_Data[n].LEARN_MORE_BC_Save_Price;
    rsJson.Cart_Price = pf_Data[n].Cart_Price;
    rsJson.TieredPrices_Value = pf_Data[n].TieredPrices_value;
    rsJson.TieredPrices_minQuantity = pf_Data[n].TieredPrices_minQuantity;


    failJson.PF_URL = pf_Data[n].PF_URL;
    failJson.PF_SKU = pf_Data[n].SKU;
    failJson.PF_Display_Name = pf_Data[n].PF_DISPLAYNAME;
    failJson.PF_COLOR = pf_Data[n].PF_COLOR;
    failJson.PF_MEMORY = pf_Data[n].PF_MEMORY;
    failJson.PF_Promotion_Price = pf_Data[n].PF_PRICE_PROMOTION;
    failJson.PF_Price = pf_Data[n].PF_PRICE_ORIGINAL;
    failJson.PF_Save_Price = pf_Data[n].PF_PRICE_SAVE;
    failJson.BuyNowCTA_Stock = pf_Data[n].BUY_NOW_CTA_STOCK;
    failJson.LearnMoreCTA_URL = convert.replace00A0(pf_Data[n].LEARN_MORE_CTA_URL);
    failJson.PD_Type = pf_Data[n].LEARN_MORE_PD_TYPE;
    failJson.Feature_PD_Promotion_Price = pf_Data[n].LEARN_MORE_FEATURE_Promotion_Price;
    failJson.Feature_PD_Original_Price = pf_Data[n].LEARN_MORE_FEATURE_Original_Price;
    failJson.Feature_PD_Save_Price = pf_Data[n].LEARN_MORE_FEATURE_Save_Price;
    failJson.BC_Promotion_Price = pf_Data[n].LEARN_MORE_BC_Promotion_Price;
    failJson.BC_Original_Price = pf_Data[n].LEARN_MORE_BC_Original_Price;
    failJson.BC_Save_Price = pf_Data[n].LEARN_MORE_BC_Save_Price;
    failJson.Cart_Price = pf_Data[n].Cart_Price;

    rsData.push(rsJson);
    if(!checkt) failData.push(failJson);
    // console.log("Push OK...");
}

/***********************************************************************
 
    Function : Writing OnlyAPI Data to JSON
    Process : write_Onlyapi(i)
    Writer  : JK
    Data    : 2022-04-07
 
 ***********************************************************************/
function write_Onlyapi(sitecdoe, i) {
    rsJson = new Object();
    // testcase
    rsJson.SiteCode = sitecdoe;
    rsJson.testTotal = "N/A";
    rsJson.SKU = "N/A";
    rsJson.SKU_Comment = "N/A";
    rsJson.Display_Name = "N/A";
    rsJson.Display_Name_Comment = "N/A";
    rsJson.Chip_Option = "N/A";
    rsJson.Chip_Option_Comment = "N/A";
    rsJson.PromotionPrice = "N/A";
    rsJson.PromotionPrice_Comment = "N/A";
    rsJson.OriginPrice_Match = "N/A";
    rsJson.OriginPrice_Comment = "N/A";
    rsJson.Stock = "N/A";
    rsJson.Stock_Comment = "N/A";
    rsJson.BuyNowCTA_PDType = "N/A";
    rsJson.BuyNowCTA_PDType_Comment = "N/A";
    rsJson.BuyNow_BC_PromotionPrice = "N/A";
    rsJson.BuyNow_BC_PromotionPrice_Comment = "N/A";
    rsJson.LearnMoreCTA_PDType = "N/A";
    rsJson.LearnMoreCTA_PDType_Comment = "N/A";
    

    // Writing API Data
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
    rsJson.API_tradeIn = convert.replace00A0(api_Data[i].tradeIn);
    rsJson.API_KeySummaryTitle = api_Data[i].KeySummaryTitle;
    rsJson.API_KeySummaryImgUrl = api_Data[i].KeySummaryImgUrl;
    rsJson.API_pdpUrl = api_Data[i].pdpUrl;
    rsJson.API_originPdpUrl = api_Data[i].originPdpUrl;
    rsJson.API_fmyChip1 = api_Data[i].fmyChipList;
    rsJson.API_fmyChip2 = api_Data[i].fmyChipList2;
    if(api_Data[i].fmyChipList2 == null) rsJson.API_fmyChip2 = "";

    // Writing Null in Selenium Data
    rsJson.PF_URL = "";
    rsJson.PF_SKU = "";
    rsJson.PF_Display_Name = "";
    rsJson.PF_COLOR = "";
    rsJson.PF_MEMORY = "";
    rsJson.PF_Promotion_Price = "";
    rsJson.PF_Price = "";
    rsJson.PF_Save_Price = "";
    rsJson.PF_Tiered_Min = "";
    rsJson.PF_Tiered_Price = "";
    rsJson.BuyNowCTA_Stock = "";
    rsJson.BuyNowCTA_URL = "";
    rsJson.BuyNowCTA_PD_Type = "";
    rsJson.BuyNowCTA_Feature_PD_Promotion_Price = "";
    rsJson.BuyNowCTA_Feature_PD_Price = "";
    rsJson.BuyNowCTA_Feature_PD_Save_Price = "";
    rsJson.BuyNowCTA_PD_URL = "";
    rsJson.BuyNowCTA_PD_Tiered_Min = "";
    rsJson.BuyNowCTA_PD_Tiered_Price = "";
    rsJson.BuyNowCTA_PD_Promotion_Price = "";
    rsJson.BuyNowCTA_PD_Price = "";
    rsJson.BuyNowCTA_PD_Save_Price = "";
    rsJson.LearnMoreCTA_Stock = "";
    rsJson.LearnMoreCTA_URL = "";
    rsJson.LearnMoreCTA_PD_Type = "";
    rsJson.LearnMoreCTA_Feature_PD_Promotion_Price = "";
    rsJson.LearnMoreCTA_Feature_PD_Price = "";
    rsJson.LearnMoreCTA_Feature_PD_Save_Price = "";
    rsJson.LearnMoreCTA_PD_URL = "";
    rsJson.LearnMoreCTA_PD_Tiered_Min = "";
    rsJson.LearnMoreCTA_PD_Tiered_Price = "";
    rsJson.LearnMoreCTA_PD_Promotion_Price = "";
    rsJson.LearnMoreCTA_PD_Price = "";
    rsJson.LearnMoreCTA_PD_Save_Price = "";
    rsJson.Cart_Price = "";
    rsJson.TieredPrices_Value = "";
    rsJson.TieredPrices_minQuantity = "";

    rsJson.testTotal = "OnlyAPI";
    
    rsData.push(rsJson);
    // console.log("OnlyAPI Push OK...");
}
