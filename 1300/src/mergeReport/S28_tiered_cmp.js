/***********************************************************************
 
    PD API - Tiered Price Crawling Data Matching Process
    Process : S28_tiered_cmp.js

    사용법(개별사용시)
    1. crawling_tiered.js 데이터 출력과정이 끝났을 때 엑셀만 따로 출력해보고 싶을때 사용
    2. main >> tiered_remote 사용 안하고 개별로 데이터를 출력했을 시 사용
    3. config.js에 저장되는 위치 확인 후 readFileSync부분에 저장되는 코드 부분을 확인
    4. mergeReport 터미널을 연 후 node S28_tiered_cmp 엔터
    5. 엑셀이 저장되는 result폴더에서 엑셀 내용 확인
 
 ***********************************************************************/

////////////////////// Base Variable //////////////////////
const fs = require('fs');
const xlsx = require('xlsx');
const convert = require('../../../lib/convertString.js');
const { siteTi, searchAPIPath, tieredPath, report } = require('../../../config/config.js');

var result;
var rsData = new Array();
var failData = new Array();
var rsJson = new Object();
var api_Buffer;
var api_String;
var api_Data;
var tiered_Buffer;
var tiered_String;
var tiered_Data;

///////////////////////////////////////////////////////////
var siteCode = siteTi;


// Main Process
const workBook = xlsx.utils.book_new();

for(var t = 0; t < siteCode.length; t++) {
    rsJson = new Object();

    // Get Search API Result Data
    api_Buffer = fs.readFileSync(searchAPIPath + 'Search_API_' + siteCode[t] + '.json');
    api_String = api_Buffer.toString();
    api_Data = JSON.parse(api_String);
    // console.log("Get API");

    // Get Tiered Data
    tiered_Buffer = fs.readFileSync(tieredPath + siteCode[t] + '_tieredData.json');
    tiered_String = tiered_Buffer.toString();
    tiered_Data = JSON.parse(tiered_String);
    // console.log("Get Crolling");

    // Find Modelcode to Mapping in PD API Data
    tiered_Data.filter(tiered => {
        var check = false;
        api_Data.forEach(search => {  
            if(tiered.SKU == search.modelCode) {
                compare(siteCode[t], tiered, search);             
                check = true;
            }
        });
        if(check = false){
            write_Onlyapi(siteCode[t], search);
        }
    });
}

// Creat Excel File
var workSheet = xlsx.utils.json_to_sheet(failData);
xlsx.utils.book_append_sheet(workBook, workSheet, "Fail Data");
var workSheet = xlsx.utils.json_to_sheet(rsData);
xlsx.utils.book_append_sheet(workBook, workSheet, "All Row Data");

xlsx.writeFile(workBook, report + "Tiered_Check_Result.xlsx");
console.log("Tiered Price Check Result File Saved!");


/***********************************************************************
 
    Function : Check Tiered Price
    Process : compare(site, tiered, search)
    Writer  : JK
    Data    : 2022-09-27
 
 ***********************************************************************/
function compare(site, tiered, search) {
    rsJson = new Object();

    var testResult;
    var totalFailCnt = 0;
    rsJson.sitecode = site;
    rsJson.totalResult = "Pass";
    rsJson.Include_Tiered_1_Min = "";
    rsJson.Include_Tiered_1_Min_Comment = "";
    rsJson.Include_Tiered_1_Max = "";
    rsJson.Include_Tiered_1_Max_Comment = "";
    rsJson.Include_Tiered_2_Min = "";
    rsJson.Include_Tiered_2_Min_Comment = "";
    rsJson.Include_Tiered_2_Max = "";
    rsJson.Include_Tiered_2_Max_Comment = "";
    rsJson.Include_Tiered_3_Min = "";
    rsJson.Include_Tiered_3_Min_Comment = "";
    rsJson.Include_Tiered_3_Max = "";
    rsJson.Include_Tiered_3_Max_Comment = "";
    rsJson.Include_Tiered_4_Min = "";
    rsJson.Include_Tiered_4_Min_Comment = "";
    rsJson.Include_Tiered_4_Max = "";
    rsJson.Include_Tiered_4_Max_Comment = "";
    rsJson.Include_Tiered_5_Min = "";
    rsJson.Include_Tiered_5_Min_Comment = "";
    rsJson.Include_Tiered_5_Max = "";
    rsJson.Include_Tiered_5_Max_Comment = "";
    rsJson.Include_Tiered_6_Min = "";
    rsJson.Include_Tiered_6_Min_Comment = "";
    rsJson.Include_Tiered_6_Max = "";
    rsJson.Include_Tiered_6_Max_Comment = "";
    

    if(tiered.Include == undefined) tiered.Include = '';
    if(tiered.Exclude == undefined) tiered.Exclude = '';
    
    // Check Include Tiered Price
    if(tiered.Include != "Other Page Type" && tiered.Stock != "stock alert" && tiered.Include != "") {
        for(var i=0; i < tiered.Include.length; i++) {
            var testResult = chekckTiered(tiered.Include[i], tiered.Include[i]);
            if(testResult.Minresult == "Fail" || testResult.Maxresult == "Fail") totalFailCnt++;
            i++;
            rsJson["Include_Tiered_" + i + "_Min" ] = testResult.Minresult;
            rsJson["Include_Tiered_" + i + "_Min_Comment"] = testResult.Mincomment;
            rsJson["Include_Tiered_" + i + "_Max" ] = testResult.Maxresult;
            rsJson["Include_Tiered_" + i + "_Max_Comment"] = testResult.Maxcomment;

            if(search.tieredPrice.TieredPrices_value == ""){
                totalFailCnt++;
                var t = i-1;
                rsJson["Include_Tiered_" + i + "_Min" ] = "Fail";
                rsJson["Include_Tiered_" + i + "_Min_Comment"] = "Not Exist API Data :: " + parseInt(convert.FnkrNum(tiered.Include[t].minCartPrice)) / parseInt(convert.FnkrNum(tiered.Include[t].minCartCount));
                rsJson["Include_Tiered_" + i + "_Max" ] = "Fail";
                rsJson["Include_Tiered_" + i + "_Max_Comment"] = "Not Exist API Data :: " + parseInt(convert.FnkrNum(tiered.Include[t].maxCartPrice)) / parseInt(convert.FnkrNum(tiered.Include[t].maxCartCount));
            }
            i--;
        }
    } else if(tiered.Include == "Other Page Type"){
        totalFailCnt++;
        rsJson["Include_Tiered_1_Min"] = "N/A";
        rsJson["Include_Tiered_1_Min_Comment"] = "Other Page Type";
        rsJson["Include_Tiered_1_Max"] = "N/A";
        rsJson["Include_Tiered_1_Max_Comment"] = "Other Page Type";
    } else if(tiered.Stock == "stock alert"){
        rsJson["Include_Tiered_1_Min"] = "N/A";
        rsJson["Include_Tiered_1_Min_Comment"] = "outOfStock";
        rsJson["Include_Tiered_1_Max"] = "N/A";
        rsJson["Include_Tiered_1_Max_Comment"] = "outOfStock";
    } else if(tiered.Include == "") {
        totalFailCnt++;
        rsJson["Include_Tiered_1_Min"] = "Fail";
        rsJson["Include_Tiered_1_Min_Comment"] = "Not exist Tiered Price in PD Page";
        rsJson["Include_Tiered_1_Max"] = "Fail";
        rsJson["Include_Tiered_1_Max_Comment"] = "Not exist Tiered Price in PD Page";
    }

    rsJson.Exclude_Tiered_1_Min = "";
    rsJson.Exclude_Tiered_1_Min_Comment = "";
    rsJson.Exclude_Tiered_1_Max = "";
    rsJson.Exclude_Tiered_1_Max_Comment = "";
    rsJson.Exclude_Tiered_2_Min = "";
    rsJson.Exclude_Tiered_2_Min_Comment = "";
    rsJson.Exclude_Tiered_2_Max = "";
    rsJson.Exclude_Tiered_2_Max_Comment = "";
    rsJson.Exclude_Tiered_3_Min = "";
    rsJson.Exclude_Tiered_3_Min_Comment = "";
    rsJson.Exclude_Tiered_3_Max = "";
    rsJson.Exclude_Tiered_3_Max_Comment = "";
    rsJson.Exclude_Tiered_4_Min = "";
    rsJson.Exclude_Tiered_4_Min_Comment = "";
    rsJson.Exclude_Tiered_4_Max = "";
    rsJson.Exclude_Tiered_4_Max_Comment = "";
    rsJson.Exclude_Tiered_5_Min = "";
    rsJson.Exclude_Tiered_5_Min_Comment = "";
    rsJson.Exclude_Tiered_5_Max = "";
    rsJson.Exclude_Tiered_5_Max_Comment = "";
    rsJson.Exclude_Tiered_6_Min = "";
    rsJson.Exclude_Tiered_6_Min_Comment = "";
    rsJson.Exclude_Tiered_6_Max = "";
    rsJson.Exclude_Tiered_6_Max_Comment = "";

    // Check Exclude Tiered Price
    if(tiered.Exclude != "Other Page Type" && tiered.Stock != "stock alert" && tiered.Include != "") {
        for(var i=0; i < tiered.Exclude.length; i++) {
            var testResult = chekckTiered(tiered.Include[i], tiered.Exclude[i]);
            if(testResult.Minresult == "Fail" || testResult.Maxresult == "Fail") totalFailCnt++;
            i++;
            rsJson["Exclude_Tiered_" + i + "_Min" ] = testResult.Minresult;
            rsJson["Exclude_Tiered_" + i + "_Min_Comment"] = testResult.Mincomment;
            rsJson["Exclude_Tiered_" + i + "_Max" ] = testResult.Maxresult;
            rsJson["Exclude_Tiered_" + i + "_Max_Comment"] = testResult.Maxcomment;

            if(search.tieredPrice.exVatTieredPrices_value == ""){
                totalFailCnt++;
                var t = i-1;
                rsJson["Exclude_Tiered_" + i + "_Min" ] = "Fail";
                rsJson["Exclude_Tiered_" + i + "_Min_Comment"] = "Not Exist API Data :: " + parseInt(convert.FnkrNum(tiered.Exclude[t].minCartPrice)) / parseInt(convert.FnkrNum(tiered.Exclude[t].minCartCount));
                rsJson["Exclude_Tiered_" + i + "_Max" ] = "Fail";
                rsJson["Exclude_Tiered_" + i + "_Max_Comment"] = "Not Exist API Data :: " + parseInt(convert.FnkrNum(tiered.Exclude[t].maxCartPrice)) / parseInt(convert.FnkrNum(tiered.Exclude[t].maxCartCount));
            }
            i--;
        }
    } else if(tiered.Exclude == "Other Page Type"){
        totalFailCnt++;
        rsJson["Exclude_Tiered_1_Min"] = "N/A";
        rsJson["Exclude_Tiered_1_Min_Comment"] = "Other Page Type";
        rsJson["Exclude_Tiered_1_Max"] = "N/A";
        rsJson["Exclude_Tiered_1_Max_Comment"] = "Other Page Type";
    } else if(tiered.Stock == "stock alert"){
        rsJson["Exclude_Tiered_1_Min"] = "N/A";
        rsJson["Exclude_Tiered_1_Min_Comment"] = "outOfStock";
        rsJson["Exclude_Tiered_1_Max"] = "N/A";
        rsJson["Exclude_Tiered_1_Max_Comment"] = "outOfStock";
    } else if(tiered.Include == "") {
        totalFailCnt++;
        rsJson["Exclude_Tiered_1_Min"] = "Fail";
        rsJson["Exclude_Tiered_1_Min_Comment"] = "Not exist Tiered Price in PD Page";
        rsJson["Exclude_Tiered_1_Max"] = "Fail";
        rsJson["Exclude_Tiered_1_Max_Comment"] = "Not exist Tiered Price in PD Page";
    }

    // Total Result
    if(totalFailCnt == 0) {
        result = "Pass";
    } else {
        result = "Fail";
        rsJson.totalResult = "Fail";
    }

    write_Result(tiered, search, result);

}

/***********************************************************************
 
    Function : Writing Result Data to JSON
    Process : write_Result(tiered, search, result)
    Writer  : JK
    Data    : 2022-05-17
 
 ***********************************************************************/
function write_Result(tiered, search, result) {

    // Writing Search API Data
    rsJson.API_diplayName = search.displayName;
    rsJson.API_modelCode = search.modelCode;
    try{
        rsJson.API_Include_TieredQauntity = search.tieredPrice.TieredPrices_minQuantity;
    } catch(e) {
        rsJson.API_Include_TieredQauntity = "";
    }
    try{
        rsJson.API_Include_TieredPrice = search.tieredPrice.TieredPrices_value;
    } catch(e) {
        rsJson.API_Include_TieredPrice = "";
    }
    try{
        rsJson.API_Exclude_TieredQauntity = search.tieredPrice.exVatTieredPrices_minQuantity;
    } catch(e) {
        rsJson.API_Exclude_TieredQauntity = "";
    }
    try{
        rsJson.API_Exclude_TieredPrice = search.tieredPrice.exVatTieredPrices_value;
    } catch(e) {
        rsJson.API_Exclude_TieredPrice = "";
    }
    
    // Writing Crawling Data
    rsJson.PD_SKU = tiered.SKU;
    rsJson.PD_URL = tiered.PDURL
    rsJson.Stock = tiered.Stock;
    
    var tempInQuan = "";
    var tempInPric = "";
    var tempExQuan = "";
    var tempExPric = "";
    
    for(var i = 0; i < tiered.Include.length; i++) {
        try{
            tempInQuan = tempInQuan + tiered.Include[i].range + "/";
            tempInPric = tempInPric + convert.BnkrNum(tiered.Include[i].price) + "/";
        }catch(e){
            tempInQuan = "";
            tempInPric = "";
        }
        
    }
    for(var i = 0; i < tiered.Exclude.length; i++) {
        try{
            tempExQuan = tempExQuan + tiered.Exclude[i].range + "/";
            tempExPric = tempExPric + convert.BnkrNum(tiered.Exclude[i].price) + "/";
        }catch(e){
            tempExQuan = "";
            tempExPric = "";
        }
        
    }

    rsJson.PD_Include_Tiered_Quantity = tempInQuan;
    rsJson.PD_Include_Tiered_Price = tempInPric;
    rsJson.PD_Exclude_Tiered_Quantity = tempExQuan;
    rsJson.PD_Exclude_Tiered_Price = tempExPric;

    rsData.push(rsJson);
    if(result=="Fail") failData.push(rsJson);

}

/***********************************************************************
 
    Function : Writing OnlyAPI Data to JSON
    Process : write_Onlyapi(i)
    Writer  : JK
    Data    : 2022-04-07
 
 ***********************************************************************/
function write_Onlyapi(site, search) {
    rsJson = new Object();

    rsJson.sitecode = site;
    rsJson.totalResult = "N/A";

    rsJson.API_diplayName = search.displayName;
    rsJson.API_modelCode = search.modelCode;
    
    rsData.push(rsJson);
    // console.log("OnlyAPI Push OK...");
}


function chekckTiered(setP, tiered) {
    var res = {Minresult: "", Mincomment: "", Maxresult: "", Maxcomment: ""};
    var AvgPrice = parseInt(convert.BnkrNum(setP.price));
    var Com = tiered.comment;

    var MinAvgPrice = parseInt(convert.FnkrNum(tiered.minCartPrice)) / parseInt(convert.FnkrNum(tiered.minCartCount));
    var MaxAvgPrice = parseInt(convert.FnkrNum(tiered.maxCartPrice)) / parseInt(convert.FnkrNum(tiered.maxCartCount));

    if(tiered.minCartPrice == "") {
        res.Minresult = "N/A";
        res.Mincomment = tiered.minCount + " :: " + Com;
    }
    else if(MinAvgPrice == AvgPrice) {
        res.Minresult = "Pass";
        res.Mincomment = AvgPrice + "(" + setP.minCount + ") :: " + MinAvgPrice + "(" + tiered.minCartCount + ")";
    } else {
        res.Minresult = "Fail";
        res.Mincomment = AvgPrice + "(" + setP.minCount + ") :: " + MinAvgPrice + "(" + tiered.minCartCount + ")";
    }

    if(tiered.maxCartPrice == "") {
        res.Maxresult = "N/A";
        res.Maxcomment = tiered.maxCount + " :: " + Com;
    }
    else if(MaxAvgPrice == AvgPrice) {
        res.Maxresult = "Pass";
        res.Maxcomment = AvgPrice + "(" + setP.maxCount + ") :: " + MaxAvgPrice + "(" + tiered.maxCartCount + ")";
    } else {
        res.Maxresult = "Fail";
        res.Maxcomment = AvgPrice + "(" + setP.maxCount + ") :: " + MaxAvgPrice + "(" + tiered.maxCartCount + ")";
    }


    return res;

}