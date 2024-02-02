/***********************************************************************
 
    Merge Process
    Process : S28_1201_cmp.js
    Writer  : JK
    Data    : 2022-04-07
 
 ***********************************************************************/

////////////////////// Base Variable //////////////////////
import fs from "../lib/fs";
import xlsx from "xlsx";
var check = false;
var result;
var comment;
var rsData = new Array();
var rsJson = new Object();
var api_Buffer;
var api_String;
var api_Data;
var sele_Buffer;
var sele_Data;
var pd_Buffer;
var pd_String;
var pd_Data;


var siteCode = [ "at", "ca", "ca_fr", "dk", "es", "fi", "id", "it", "my", "no", "se", "th", "vn" ];

task("guest");
task("include");
task("exclude");

// Main Process
async function task(mode) {
    const workBook_Guest = xlsx.utils.book_new();
    const workBook_Include = xlsx.utils.book_new();
    const workBook_Exclude = xlsx.utils.book_new();

    for(var t = 0; t < siteCode.length; t++) {
        rsJson = new Object();
        rsData = new Array();
        SKU_List = new Array();

        // Get PF API Result Data
        api_Buffer = fs.readFileSync('./PF_API_Result/PF_API_' + siteCode[t] + '.json');
        api_String = api_Buffer.toString();
        api_Data = JSON.parse(api_String);

        // Get PF Selenium Result Data
        var SC = siteCode[t] + "_" + mode;
        sele_Buffer = xlsx.readFile("./Selenium_Result/PPC_" + SC + ".xlsx");
        sele_Data = xlsx.utils.sheet_to_json(sele_Buffer.Sheets[SC]);

        // Get PD API Result Data
        pd_Buffer = fs.readFileSync('./PD_API_Result/PD_API_' +siteCode[t] + '.json');
        pd_String = pd_Buffer.toString();
        pd_Data = JSON.parse(pd_String);

        for(var i = 0; i < api_Data.length; i++) {
            SKU_List.push(api_Data[i].modelCode);

        }





        // -------------------220420 임시 변경------------------------
        // Find SKU to Mapping in Selenium Data
        for(var n = 0; n < sele_Data.length; n++) {
            check = false;
            result = "";
            comment = "";

            // Mapping to API Data
            for(var i = 0; i < api_Data.length; i++) {
                var url = sele_Data[n].PF_URL;
                var type = api_Data[i].pviSubtypeName;
                if(api_Data[i].modelCode == sele_Data[n].PF_SKU) {  
                    if(url.includes(type.toLowerCase()) && api_Data[i].pviTypeName == "Mobile") { // Checking duplicate SKU in other category
                        for(var u = 0; u < pd_Data.length; u++) {
                            if(sele_Data[n].PF_SKU == pd_Data[u].SKU) {
                                // console.log("Find Mapping...");
                                compare(i, n, u, mode, siteCode[t]);
                                check = true;
                                break;
                            }
                        }
                        
                    } else {
                        for(var u = 0; u < pd_Data.length; u++) {
                            if(sele_Data[n].PF_SKU == pd_Data[u].SKU) {
                                // console.log("Find Mapping...");
                                compare(i, n, u, mode, siteCode[t]);
                                check = true;
                                break;
                            }
                        }
                    }
                }
            }

            if(check == false) { // Mapping Failed SKU (OnlyAPI)
                // console.log("OnlyAPI");
                write_Onlyapi(n);
            }
        }
        // ---------------------------------------------------------

        /* If you want JSON File, active this area
        // Create JSON Data File
        const merge = JSON.stringify(rsData);
        fs.writeFileSync('Compare_.json', merge);
        console.log("JSON File Saved!");
        */

        // Creat Excel Sheet
        var workSheet = xlsx.utils.json_to_sheet(rsData);
        xlsx.utils.book_append_sheet(workBook, workSheet, siteCode[t] + "_" + mode);
    }

    xlsx.writeFile(workBook, "Total_Result_" + mode + ".xlsx");
    console.log(mode + " Result File Saved!");
}

/***********************************************************************
 
    Function : Compare to API Data and Selenium Data
    Process : compare(i, n, u, mode)
    Writer  : JK
    Data    : 2022-04-07
 
 ***********************************************************************/
function compare(i, n, u, mode, site) {
    var tg = 0;
    // Compare SKU
    if(api_Data[i].modelCode != sele_Data[n].PF_SKU) {
        comment += "| SKU ";
        tg++;
    }
    // Compare Display Name
    if(replaceBlank(api_Data[i].displayName) != replaceR(sele_Data[n].PF_Display_Name)) {
        comment += "| Display ";
        tg++;
    }
    // Compare Chip Option 1
    if(api_Data[i].fmyChipList != null && api_Data[i].fmyChipList != sele_Data[n].PF_COLOR && api_Data[i].fmyChipList2 != sele_Data[n].PF_COLOR) {
        comment += "| Chip1 ";
        tg++;
    }
    // Compare Chip Option 2 (if it exists)
    if(api_Data[i].fmyChipList == null && api_Data[i].fmyChipList2 != null && sele_Data[n].PF_COLOR != null && sele_Data[n].PF_MEMORY != null) {
        comment += "| Chip1 ";
        tg++;
    }
    if(api_Data[i].fmyChipList2 != null && api_Data[i].fmyChipList2 != sele_Data[n].PF_COLOR && api_Data[i].fmyChipList2 != sele_Data[n].PF_MEMORY) {
        comment += "| Chip2 ";
        tg++;
    }
    if(api_Data[i].fmyChipList != null && api_Data[i].fmyChipList2 == null && sele_Data[n].PF_COLOR != null && sele_Data[n].PF_MEMORY != null) {
        comment += "| Chip2 ";
        tg++;
    }
    // Compare Promotion Price
    if(mode == "guest" && api_Data[i].promotionPriceDisplay != replaceNA(sele_Data[n].PF_Promotion_Price)) {
        comment += "| PF_Promotion_Price[ " + api_Data[i].promotionPriceDisplay + " :: " + replaceNA(sele_Data[n].PF_Promotion_Price) + " ] ";
        tg++;
    }
    else if(mode == "include") {
        if(api_Data[i].smbPromotionPriceDisplay != "" && api_Data[i].smbPromotionPriceDisplay != replaceNA(sele_Data[n].PF_Promotion_Price)) {
            comment += "| PF_Promotion_Price[ " + api_Data[i].smbPromotionPriceDisplay + " :: " + replaceNA(sele_Data[n].PF_Promotion_Price) + " ] ";
            tg++;
        }
        else if(api_Data[i].smbPromotionPriceDisplay == "" && api_Data[i].tieredPriceDisplay != "" && api_Data[i].tieredPriceDisplay != replaceNA(sele_Data[n].PF_Promotion_Price)) {
            comment += "| PF_Promotion_Price[ " + api_Data[i].tieredPriceDisplay + " :: " + replaceNA(sele_Data[n].PF_Promotion_Price) + " ] ";
            tg++;
        }
        else if(api_Data[i].smbPromotionPriceDisplay == "" && api_Data[i].tieredPriceDisplay == "" && api_Data[i].promotionPriceDisplay != "" && api_Data[i].promotionPriceDisplay != replaceNA(sele_Data[n].PF_Promotion_Price)) {
            comment += "| PF_Promotion_Price[ " + api_Data[i].promotionPriceDisplay + " :: " + replaceNA(sele_Data[n].PF_Promotion_Price) + " ] ";
            tg++;
        }
    }
    else if(mode == "exclude") {
        if(site == "dk" && api_Data[i].promotionPriceDisplay != replaceNA(sele_Data[n].PF_Promotion_Price)) {
            comment += "| PF_Promotion_Price[ " + api_Data[i].promotionPriceDisplay + " :: " + replaceNA(sele_Data[n].PF_Promotion_Price) + " ] ";
            tg++;
        }
        else if (site != "dk" && api_Data[i].taxExPriceDisplay != replaceNA(sele_Data[n].PF_Promotion_Price)){
            comment += "| PF_Promotion_Price[ " + api_Data[i].taxExPriceDisplay + " :: " + replaceNA(sele_Data[n].PF_Promotion_Price) + " ] ";
            tg++;
        }
    }
    // Compare Display Price (only include mode)
    if(mode == "include" && api_Data[i].smbPromotionPriceDisplay != "" && saveRemake(api_Data[i].priceDisplay) != saveRemake(sele_Data[n].PF_Price)) {
        comment += "| PF_Price[ " + api_Data[i].priceDisplay + " :: " + replaceNA(sele_Data[n].PF_Price) + " ] ";
        tg++;
    }
    // Compare Save Price (only include mode)
    if(mode == "include" && sele_Data[n].PF_Save_Price != "N/A" && api_Data[i].smbPromotionPriceDisplay != "") {
        var PF_Save = parseInt(saveRemake(sele_Data[n].PF_Save_Price));
        var API_price = parseInt(saveRemake(api_Data[i].priceDisplay));
        var API_minus = parseInt(saveRemake(api_Data[i].smbPromotionPriceDisplay));

        if(API_price - API_minus != PF_Save) {
            comment += "| PF_Save_Price[ " + (API_price - API_minus) + " :: " + PF_Save + " ] ";
            tg++;
        }
    }
    // Compare PD Type in CTA 1
    if(sele_Data[n].CTA_1_PD_Type != "" && PDType(i, site) != sele_Data[n].CTA_1_PD_Type){
        comment += "| CTA_1_PD_Type_Mismatch[ " + PDType(i, site) + " :: " + sele_Data[n].CTA_1_PD_Type + " ] ";
        tg++;
    }
    // Compare PD, Cart Price according to Stock
    if(api_Data[i].ctaType == "lowStock" || api_Data[i].ctaType == "inStock") {
        if(sele_Data[n].CTA_1_Stock != "inStock") {
            comment += "| CTA1_Mismatch[ " + api_Data[i].ctaType + " :: " + sele_Data[n].CTA_1_Stock + " ] ";
            tg++;
        }
        if(sele_Data[n].CTA_1_PD_Type == "MKT" || sele_Data[n].CTA_1_PD_Type == "PCD"){
            comment += "| Go_to_MKT/PCD(CTA1) "
            tg++;
        }
        if(sele_Data[n].CTA_1_PD_Type != "MKT" && sele_Data[n].CTA_1_PD_Type != "PCD" && api_Data[i].promotionPriceDisplay != cartRemake(sele_Data[n].CTA_1_Cart_Price)) {
            comment += "| CTA_1_Cart_Price[ " + api_Data[i].promotionPriceDisplay + " :: " + cartRemake(sele_Data[n].CTA_1_Cart_Price) + " ] ";
            tg++;
        }
        if(sele_Data[n].CTA_1_PD_Type != "MKT" && sele_Data[n].CTA_1_PD_Type != "PCD" && api_Data[i].promotionPriceDisplay != replaceNA(sele_Data[n].CTA_1_PD_Promotion_Price)) {
            comment += "| CTA_1_PD_Promotion_Price[ " + api_Data[i].promotionPriceDisplay + " :: " + replaceNA(sele_Data[n].CTA_1_PD_Promotion_Price) + " ] ";
            tg++;
        }
        if(sele_Data[n].CTA_1_PD_Type == "FEATURE" && api_Data[i].promotionPriceDisplay != replaceNA(sele_Data[n].CTA_1_Feature_PD_Promotion_Price)) {
            comment += "| CTA_1_Feature_PD_Promotion_Price[ " + api_Data[i].promotionPriceDisplay + " :: " + replaceNA(sele_Data[n].CTA_1_Feature_PD_Promotion_Price) + " ] ";
            tg++;
        }
        if(api_Data[i].pviTypeName == "Mobile" && sele_Data[n].CTA_2_PD_Type == "MKT" || sele_Data[n].CTA_2_PD_Type == "PCD"){
            comment += "| Go_to_MKT/PCD(CTA2) "
            tg++;
        }
        else if(api_Data[i].pviTypeName == "Mobile" && sele_Data[n].CTA_2_PD_Type != "" && sele_Data[n].CTA_2_PD_Type != "FEATURE"){
            comment += "| CTA_2_PD_Type_Mismatch[ " + sele_Data[n].CTA_2_PD_Type + " ] ";
            tg++;
        }
        if(api_Data[i].pviTypeName == "Mobile" && sele_Data[n].CTA_2_PD_Type != "MKT" && sele_Data[n].CTA_2_PD_Type != "PCD" && replaceNA(api_Data[i].promotionPriceDisplay) != cartRemake(sele_Data[n].CTA_2_Cart_Price)) {
            comment += "| CTA_2_Cart_Price[ " + api_Data[i].promotionPriceDisplay + " :: " + cartRemake(sele_Data[n].CTA_2_Cart_Price) + " ] ";
            tg++;
        }
        if(api_Data[i].pviTypeName == "Mobile" && sele_Data[n].CTA_2_PD_Type != "MKT" && sele_Data[n].CTA_2_PD_Type != "PCD" && api_Data[i].promotionPriceDisplay != replaceNA(sele_Data[n].CTA_2_PD_Promotion_Price)) {
            comment += "| CTA_2_PD_Promotion_Price[ " + api_Data[i].promotionPriceDisplay + " :: " + replaceNA(sele_Data[n].CTA_2_PD_Promotion_Price) + " ] ";
            tg++;
        }
        if(sele_Data[n].CTA_2_PD_Type == "FEATURE" && api_Data[i].promotionPriceDisplay != replaceNA(sele_Data[n].CTA_2_Feature_PD_Promotion_Price)) {
            comment += "| CTA_2_Feature_PD_Promotion_Price[ " + api_Data[i].promotionPriceDisplay + " :: " + replaceNA(sele_Data[n].CTA_2_Feature_PD_Promotion_Price) + " ] ";
            tg++;
        }
    }
    else if(api_Data[i].ctaType == "learnMore") {
        if(sele_Data[n].CTA_1_Stock != undefined) {
            comment += "| CTA1_Mismatch[ " + api_Data[i].ctaType + " :: " + sele_Data[n].CTA_1_Stock + " ] ";
            tg++;
        }
        if(api_Data[i].pviTypeName == "Mobile" && sele_Data[n].CTA_2_PD_Type == "MKT" || sele_Data[n].CTA_2_PD_Type == "PCD"){
            comment += "| Go_to_MKT/PCD(CTA2) "
            tg++;
        }
    }
    else if(api_Data[i].ctaType == "outOfStock") {
        if(sele_Data[n].CTA_1_Stock != "outOfStock") {
            comment += "| CTA1_Mismatch[ " + api_Data[i].ctaType + " :: " + sele_Data[n].CTA_1_Stock + " ] ";
            tg++;
        }
        if(sele_Data[n].CTA_1_PD_Type == "MKT" || sele_Data[n].CTA_1_PD_Type == "PCD"){
            comment += "| Go_to_MKT/PCD(CTA1) "
            tg++;
        }
        if(sele_Data[n].CTA_2_PD_Type == "MKT" || sele_Data[n].CTA_2_PD_Type == "PCD"){
            comment += "| Go_to_MKT/PCD(CTA2) "
            tg++;
        }
        else if(api_Data[i].pviTypeName == "Mobile" && sele_Data[n].CTA_2_PD_Type != "FEATURE"){
            comment += "| CTA_2_PD_Type_Mismatch[ " + sele_Data[n].CTA_2_PD_Type + " ] ";
            tg++;
        }
        else if(api_Data[i].pviTypeName != "Mobile" && sele_Data[n].CTA_2_PD_Type != "STANDARD"){
            comment += "| CTA_2_PD_Type_Mismatch[ " + sele_Data[n].CTA_2_PD_Type + " ] ";
            tg++;
        }
        if(sele_Data[n].CTA_2_PD_Type != "MKT" && sele_Data[n].CTA_2_PD_Type != "PCD" && api_Data[i].promotionPriceDisplay != replaceNA(sele_Data[n].CTA_2_PD_Promotion_Price)) {
            comment += "| CTA_2_PD_Promotion_Price[ " + api_Data[i].promotionPriceDisplay + " :: " + replaceNA(sele_Data[n].CTA_2_PD_Promotion_Price) + " ] ";
            tg++;
        }
        if(sele_Data[n].CTA_2_PD_Type == "FEATURE" && api_Data[i].promotionPriceDisplay != replaceNA(sele_Data[n].CTA_2_Feature_PD_Promotion_Price)) {
            comment += "| CTA_2_Feature_PD_Promotion_Price[ " + api_Data[i].promotionPriceDisplay + " :: " + replaceNA(sele_Data[n].CTA_2_Feature_PD_Promotion_Price) + " ] ";
            tg++;
        }
    }
    // Compare Selenium Tiered <-> PD API Tiered
    if(mode != "guest" && replaceNull(pd_Data[u].TieredPrices_value) != "" && pd_Data[u].TieredPrices_minQuantity != "1/") {
        if(tieredRemake(sele_Data[n].PF_Tiered_Min) != pd_Data[u].TieredPrices_minQuantity && ((pd_Data[u].TieredPrices_minQuantity).charAt(0) != "1" && (pd_Data[u].TieredPrices_minQuantity).charAt(1) != "/")) {
            comment += "| PF_Tiered_Mismatch[ " + tieredRemake(sele_Data[n].PF_Tiered_Min) + " :: " + pd_Data[u].TieredPrices_minQuantity + " ] ";
            tg++;
        }
        if(sele_Data[n].CTA_1_PD_Type == "STANDARD" && tieredRemake(sele_Data[n].CTA_1_PD_Tiered_Min) != pd_Data[u].TieredPrices_minQuantity) {
            comment += "| PD_Tiered_Mismatch[ " + tieredRemake(sele_Data[n].CTA_1_PD_Tiered_Min) + " :: " + pd_Data[u].TieredPrices_minQuantity + " ] ";
            tg++;
        }
        else if(sele_Data[n].CTA_1_PD_Type != "STANDARD" && sele_Data[n].CTA_2_PD_Type != "MKT" && sele_Data[n].CTA_2_PD_Type != "PCD" && tieredRemake(sele_Data[n].CTA_2_PD_Tiered_Min) != pd_Data[u].TieredPrices_minQuantity) {
            comment += "| PD_Tiered_Mismatch[ " + tieredRemake(sele_Data[n].CTA_2_PD_Tiered_Min) + " :: " + pd_Data[u].TieredPrices_minQuantity + " ] ";
            tg++;
        }
        if(tpRemake(sele_Data[n].PF_Tiered_Price) != replaceNull(pd_Data[u].TieredPrices_value) && ((pd_Data[u].TieredPrices_minQuantity).charAt(0) != "1" && (pd_Data[u].TieredPrices_minQuantity).charAt(1) != "/")) {
            comment += "| PF_Tiered_Price_Mismatch[ " + tpRemake(sele_Data[n].PF_Tiered_Price) + " :: " + replaceNull(pd_Data[u].TieredPrices_value) + " ] ";
            tg++;
        }
        if(sele_Data[n].CTA_1_PD_Type == "STANDARD" && tpRemake(sele_Data[n].CTA_1_PD_Tiered_Price) != replaceNull(pd_Data[u].TieredPrices_value)) {
            comment += "| PD_Tiered_Price_Mismatch[ " + tpRemake(sele_Data[n].CTA_1_PD_Tiered_Price) + " :: " + replaceNull(pd_Data[u].TieredPrices_value) + " ] ";
            tg++;
        }
        else if(sele_Data[n].CTA_1_PD_Type != "STANDARD" && sele_Data[n].CTA_2_PD_Type != "MKT" && sele_Data[n].CTA_2_PD_Type != "PCD" && tpRemake(sele_Data[n].CTA_2_PD_Tiered_Price) != replaceNull(pd_Data[u].TieredPrices_value)) {
            comment += "| PD_Tiered_Price_Mismatch[ " + tpRemake(sele_Data[n].CTA_2_PD_Tiered_Price) + " :: " + replaceNull(pd_Data[u].TieredPrices_value) + " ] ";
            tg++;
        }
    }
    
    // Total Result
    if(tg == 0) {
        result = "Pass";
    } else {
        result = "Fail";
    }

    write_Result(i, n, u);

}

/***********************************************************************
 
    Function : Writing Result Data to JSON
    Process : write_Result(i, n, u)
    Writer  : JK
    Data    : 2022-04-07
 
 ***********************************************************************/
function write_Result(i, n, u) {
    rsJson = new Object();
    // Writing API Data
    rsJson.API_familyRecord = api_Data[i].familyRecord;
    rsJson.API_diplayName = replaceBlank(api_Data[i].displayName);
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

    // Writing Selenium Data
    rsJson.PF_URL = sele_Data[n].PF_URL;
    rsJson.PF_SKU = sele_Data[n].PF_SKU;
    rsJson.PF_Display_Name = replaceR(sele_Data[n].PF_Display_Name);
    rsJson.PF_COLOR = sele_Data[n].PF_COLOR;
    rsJson.PF_MEMORY = sele_Data[n].PF_MEMORY;
    rsJson.PF_Promotion_Price = sele_Data[n].PF_Promotion_Price;
    rsJson.PF_Price = sele_Data[n].PF_Price;
    rsJson.PF_Save_Price = sele_Data[n].PF_Save_Price;
    rsJson.PF_Tiered_Min = tieredRemake(sele_Data[n].PF_Tiered_Min);
    rsJson.PF_Tiered_Price = tpRemake(sele_Data[n].PF_Tiered_Price);
    rsJson.CTA_1_Stock = sele_Data[n].CTA_1_Stock;
    rsJson.CTA_1_URL = sele_Data[n].CTA_1_URL;
    rsJson.CTA_1_PD_Type = sele_Data[n].CTA_1_PD_Type;
    rsJson.CTA_1_Feature_PD_Promotion_Price = sele_Data[n].CTA_1_Feature_PD_Promotion_Price;
    rsJson.CTA_1_Feature_PD_Price = sele_Data[n].CTA_1_Feature_PD_Price;
    rsJson.CTA_1_Feature_PD_Save_Price = sele_Data[n].CTA_1_Feature_PD_Save_Price;
    rsJson.CTA_1_PD_URL = sele_Data[n].CTA_1_PD_URL;
    rsJson.CTA_1_PD_URL_STATUS = sele_Data[n].CTA_1_PD_URL_STATUS;
    rsJson.CTA_1_PD_Tiered_Min = tieredRemake(sele_Data[n].CTA_1_PD_Tiered_Min);
    rsJson.CTA_1_PD_Tiered_Price = tpRemake(sele_Data[n].CTA_1_PD_Tiered_Price);
    rsJson.CTA_1_PD_Promotion_Price = sele_Data[n].CTA_1_PD_Promotion_Price;
    rsJson.CTA_1_PD_Price = sele_Data[n].CTA_1_PD_Price;
    rsJson.CTA_1_PD_Save_Price = sele_Data[n].CTA_1_PD_Save_Price;
    rsJson.CTA_1_Cart_Price = cartRemake(sele_Data[n].CTA_1_Cart_Price);
    rsJson.CTA_2_Stock = sele_Data[n].CTA_2_Stock;
    rsJson.CTA_2_URL = sele_Data[n].CTA_2_URL;
    rsJson.CTA_2_PD_Type = sele_Data[n].CTA_2_PD_Type;
    rsJson.CTA_2_Feature_PD_Promotion_Price = sele_Data[n].CTA_2_Feature_PD_Promotion_Price;
    rsJson.CTA_2_Feature_PD_Price = sele_Data[n].CTA_2_Feature_PD_Price;
    rsJson.CTA_2_Feature_PD_Save_Price = sele_Data[n].CTA_2_Feature_PD_Save_Price;
    rsJson.CTA_2_PD_URL = sele_Data[n].CTA_2_PD_URL;
    rsJson.CTA_2_PD_URL_STATUS = sele_Data[n].CTA_2_PD_URL_STATUS;
    rsJson.CTA_2_PD_Tiered_Min = sele_Data[n].CTA_2_PD_Tiered_Min;
    rsJson.CTA_2_PD_Tiered_Price = sele_Data[n].CTA_2_PD_Tiered_Price;
    rsJson.CTA_2_PD_Promotion_Price = sele_Data[n].CTA_2_PD_Promotion_Price;
    rsJson.CTA_2_PD_Price = sele_Data[n].CTA_2_PD_Price;
    rsJson.CTA_2_PD_Save_Price = sele_Data[n].CTA_2_PD_Save_Price;
    rsJson.CTA_2_Cart_Price = cartRemake(sele_Data[n].CTA_2_Cart_Price);
    rsJson.TieredPrices_Value = replaceNull(pd_Data[u].TieredPrices_value);
    rsJson.TieredPrices_minQuantity = pd_Data[u].TieredPrices_minQuantity;

    // Writing Compare Result Data
    rsJson.Total_Result = result;
    rsJson.Comment = comment;

    rsData.push(rsJson);
    // console.log("Push OK...");
}

/***********************************************************************
 
    Function : Writing OnlyAPI Data to JSON
    Process : write_Onlyapi(i)
    Writer  : JK
    Data    : 2022-04-07
 
 ***********************************************************************/
function write_Onlyapi(i) {
    rsJson = new Object();
    // Writing API Data
    rsJson.API_familyRecord = api_Data[i].familyRecord;
    rsJson.API_diplayName = replaceBlank(api_Data[i].displayName);
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
    rsJson.CTA_1_Stock = "";
    rsJson.CTA_1_URL = "";
    rsJson.CTA_1_PD_Type = "";
    rsJson.CTA_1_Feature_PD_Promotion_Price = "";
    rsJson.CTA_1_Feature_PD_Price = "";
    rsJson.CTA_1_Feature_PD_Save_Price = "";
    rsJson.CTA_1_PD_URL = "";
    rsJson.CTA_1_PD_URL_STATUS = "";
    rsJson.CTA_1_PD_Tiered_Min = "";
    rsJson.CTA_1_PD_Tiered_Price = "";
    rsJson.CTA_1_PD_Promotion_Price = "";
    rsJson.CTA_1_PD_Price = "";
    rsJson.CTA_1_PD_Save_Price = "";
    rsJson.CTA_1_Cart_Price = "";
    rsJson.CTA_2_Stock = "";
    rsJson.CTA_2_URL = "";
    rsJson.CTA_2_PD_Type = "";
    rsJson.CTA_2_Feature_PD_Promotion_Price = "";
    rsJson.CTA_2_Feature_PD_Price = "";
    rsJson.CTA_2_Feature_PD_Save_Price = "";
    rsJson.CTA_2_PD_URL = "";
    rsJson.CTA_2_PD_URL_STATUS = "";
    rsJson.CTA_2_PD_Tiered_Min = "";
    rsJson.CTA_2_PD_Tiered_Price = "";
    rsJson.CTA_2_PD_Promotion_Price = "";
    rsJson.CTA_2_PD_Price = "";
    rsJson.CTA_2_PD_Save_Price = "";
    rsJson.CTA_2_Cart_Price = "";
    rsJson.TieredPrices_Value = "";
    rsJson.TieredPrices_minQuantity = "";

    rsJson.Total_Result = "N/A";
    rsJson.Comment = "OnlyAPI"
    
    rsData.push(rsJson);
    // console.log("OnlyAPI Push OK...");
}

/***********************************************************************
 
    Function : Convert N/A Price and Delete 00A0
    Process : replaceNA(tempString)
    Writer  : JK
    Data    : 2022-04-12
 
 ***********************************************************************/
// Find 00A0 and N/A in Price
function replaceNA(price) {
    if(price == undefined) price = "";
    price = price.replaceAll(" ", " ");
    return price.replace("N/A", "");
}

/***********************************************************************
 
    Function : Check PD Type
    Process : PDType(i, site)
    Writer  : JK
    Data    : 2022-04-19
 
 ***********************************************************************/
// Check PD Type
function PDType(i, site) {
    if(api_Data[i].ctaType == "inStock" || api_Data[i].ctaType == "lowStock") {
        var url = api_Data[i].pdpUrl;
        var model = api_Data[i].modelCode;
        model = model.replace("/","-");
        model = model.toLowerCase();
        console.log("/" + site + "/business/smartphones/");
        if(url.includes("/" + site + "/business/smartphones/")) {
            if(url == "/" + site + "/business/smartphones/") {
                return "PCD"; 
            }
            else if(url == "/" + site + "/business/smartphones/all-smartphones/") {
                return "PF";
            }
            else if(url.includes(model)) {
                return "FEATURE";
            }
            return "MKT";
        }
        else if(url.includes("/" + site + "/business/tablets/")) {
            if(url == "/" + site + "/business/tablets/") {
                return "PCD"; 
            }
            else if(url == "/" + site + "/business/tablets/all-tablets/") {
                return "PF";
            }
            else if(url.includes(model)) {
                return "FEATURE";
            }
            return "MKT";
        }
        else if(url.includes("/" + site + "/business/watches/")) {
            if(url == "/" + site + "/business/watches/") {
                return "PCD"; 
            }
            else if(url == "/" + site + "/business/watches/all-watches/") {
                return "PF";
            }
            else if(url.includes(model)) {
                return "FEATURE";
            }
            return "MKT";
        }
        else {
            if(url.includes(model)) {
                return "STANDARD";
            }
            return "NOT PD";
        }
    }
    else if(api_Data[i].ctaType == "outOfStock") {
        return "STOCKALERT";
    }
    else if(api_Data[i].ctaType == "preOrder") {
        return "CART";
    }
}

/***********************************************************************
 
    Function : Delete newline in Display Name
    Process : replaceR(tempString)
    Writer  : JK
    Data    : 2022-04-19
 
 ***********************************************************************/
// Delete newline
function replaceR(tempString) {
    return tempString.replace(/(\r\n|\n|\r)/gm, "  ");
}

/***********************************************************************
 
    Function : Delete Blank in Display Name
    Process : replaceBlank(tempString)
    Writer  : JK
    Data    : 2022-04-18
 
 ***********************************************************************/
// Find blank at the end 
function replaceBlank(tempString) {
    tempString = tempString.replace(/ $/, '');
    return tempString.replace(/ $/, '');
}

/***********************************************************************
 
    Function : Convert Tiered for Match
    Process : tieredRemake(tiered)
    Writer  : JK
    Data    : 2022-04-20
 
 ***********************************************************************/
// Convert Tiered
function tieredRemake(tiered) {
    if(tiered == undefined) tiered = "";
    tiered = tiered.replace(/(\r\n|\n|\r)/gm, "");
    tiered = tiered.replace(/[^\w\-/]+/g, "");
    tiered = tiered.replace(/[a-z ]+/gi, "");

    var rsDash = new Array();
    var rsSlash = new Array();
    var PF_Dash = 0;
    var PF_Slash = 0;
    var string_Temp = "";
    var PF_Dash_Temp = tiered.indexOf('-');
    var PF_Slash_Temp = tiered.indexOf('/');

    while(PF_Dash_Temp !== -1) {
        rsDash[PF_Dash] = PF_Dash_Temp;
        PF_Dash++; 
        PF_Dash_Temp = tiered.indexOf('-', PF_Dash_Temp + 1);  
    }
    while(PF_Slash_Temp !== -1) {
        rsSlash[PF_Slash] = PF_Slash_Temp;
        PF_Slash++;
        PF_Slash_Temp = tiered.indexOf('/', PF_Slash_Temp + 1);
    }

    if(rsSlash.length == rsDash.length) {
        for(var u = rsDash.length; u > 0; u--) {
            string_Temp = tiered.substring(rsSlash[u-1]);
            tiered = tiered.substring(0, rsDash[u-1]);
            tiered = tiered + string_Temp;
        }
    }
    else {
        for(var u = rsDash.length; u > 0; u--) {
            string_Temp = tiered.substring(rsSlash[u]);
            tiered = tiered.substring(0, rsDash[u-1]);
            tiered = tiered + string_Temp;
        }
    }

    if(tiered != "") {
        tiered = tiered + "/";
    }
    
    return tiered;
}

/***********************************************************************
 
    Function : Convert Tiered Price for Match
    Process : tpRemake(price)
    Writer  : JK
    Data    : 2022-04-20
 
 ***********************************************************************/
// Convert Tiered Price
function tpRemake(price) {
    if(price == undefined) price = "";
    price = price.replace(/(\r\n|\n|\r)/gm, "");
    price = price.replace(/[a-zA-Z  ]+/g, "");
    if(price != "") {
        price = price + "/";
    }
    return price;
}

/***********************************************************************
 
    Function : Delete Blank for Null
    Process : replaceNull(tempString)
    Writer  : JK
    Data    : 2022-04-20
 
 ***********************************************************************/
// Delete Blank for Null 
function replaceNull(tempString) {
    if(tempString == undefined) tempString = "";
    tempString = tempString.replaceAll(" ", "");
    return tempString.replaceAll(" ", "");
}

/***********************************************************************
 
    Function : Convert Save Price for Match
    Process : tpRemake(price)
    Writer  : JK
    Data    : 2022-04-25
 
 ***********************************************************************/
// Convert Save Price
function saveRemake(price) {
    if(price == undefined) price = "";
    if(price == "N/A") price = "";
    price = price.replace(/(\r\n|\n|\r)/gm, "");
    price = price.replace(/[^\w\-/]+/g, "");
    price = price.replace(/[a-zA-Z  ,.]+/g, "");

    return price;
}

/***********************************************************************
 
    Function : Convert Cart Price for Match
    Process : tpRemake(price)
    Writer  : JK
    Data    : 2022-04-26
 
 ***********************************************************************/
// Convert Cart Price
function cartRemake(price) {
    if(price == undefined) price = "";
    if(price == "N/A") price = "";
    price = replaceNA(price);

    var line_index = price.indexOf('\n');

    price = price.substring(0, line_index);
    return price;
}