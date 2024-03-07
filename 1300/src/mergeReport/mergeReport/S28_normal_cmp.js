/***********************************************************************
 
    normal_PD Process Type3.ver
    Process : S28_normal_cmp.js

    사용법
    1. cluster_PD 데이터 출력이 끝나면 사용
    2. config.js에 저장되는 위치 확인 후 readFileSync부분에 저장되는 코드 부분을 확인
    3. mergeReport 터미널을 연 후 node S28_normal_cmp Guest 엔터
        (PD는 데이터가 총 3개의 값이 나오므로 Guest, Include, Exclude를 나눠서 확인 후 출력)
        예시) node S28_normal_cmp Include, node S28_normal_cmp Exclude
    4. 엑셀이 저장되는 result폴더에서 엑셀 내용 확인(총 3개 엑셀 결과 확인)
 
 ***********************************************************************/

////////////////////// Base Variable //////////////////////
const fs = require('fs');
const xlsx = require('xlsx-js-style');
const convert = require('../../../lib/convertString.js');
const testAssert = require('../../../lib/testAssert.js');
const { excIndex } = require('../../../lib/excIndex.js');
const { sitecode, siteInEx, searchAPIPath, nasPath, report } = require('../../../config/config.js');

var check = false;
var rsData = new Array();
var failData = new Array();
var rsJson = new Object();
var smrInfo = new Array();
var smrJson = new Object();
var prodInfo = new Array();
var prodJson = new Object();
var pfPrice = new Array();
var pfJson = new Object();
var buynowInfo = new Array();
var buynowJson = new Object();
var learnInfo = new Array();
var learnJson = new Object();
var cartInfo = new Array();
var cartJson = new Object();
var tieredInfo = new Array();
var tieredJson = new Object();
var api_Buffer;
var api_String;
var api_Data;
var apiPD_Buffer;
var apiPD_String;
var apiPD_Data;
var pf_Buffer;
var pf_String;
var pf_Data;


var guest_SC = sitecode;
var include_SC = siteInEx;
var exclude_SC = siteInEx;

//await task("Guest");  
// await task("Include");
//await task("Exclude");

(async() => {
    // await task("Guest");
    await task("Include");
    // await task("Exclude");
})();

// Main Process
async function task(mode) {
    const workBook = xlsx.utils.book_new();
    failData = new Array();
    smrInfo = new Array();
    prodInfo = new Array();
    pfPrice = new Array();
    buynowInfo = new Array();
    learnInfo = new Array();
    cartInfo = new Array();
    tieredInfo = new Array();
    rsJson = new Object();
    rsData = new Array();

    if(mode == "Guest") var siteCode = guest_SC;
    else if(mode == "Include") var siteCode = include_SC;
    else if(mode == "Exclude") var siteCode = exclude_SC;

    for(var t = 0; t < siteCode.length; t++) {
        
        // Get Search, PD API Result Data
        api_Buffer = fs.readFileSync(searchAPIPath + 'Search_API_' + siteCode[t] + '.json');
        //api_Buffer = fs.readFileSync('../result/Search_API_Result/Search_API_' + siteCode[t] + '.json');
        api_String = api_Buffer.toString();
        api_Data = JSON.parse(api_String);
        console.log("search api");

        // Get Crawling Data
        pf_Buffer = fs.readFileSync(nasPath + "PD_" + mode + "/" + siteCode[t] + '_' + mode + '_true_PD.json');
        //pf_Buffer = fs.readFileSync('../result/PF_Result/' + siteCode[t] + '_' + mode +'_PD_output.json');
        pf_String = pf_Buffer.toString();
        pf_Data = JSON.parse(pf_String);
        console.log("pf_Data");
        

        // Find SKU to Mapping in Crawling Data 
        for(var i = 0; i < api_Data.length; i++) {
            check = false;

            // Mapping to API Data
            for(var n = 0; n < pf_Data.length; n++) {
                if(api_Data[i].modelCode == pf_Data[n].SKU) {
                    // console.log("Find Mapping...");
                    compare_excel(i, n, mode, siteCode[t]);
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
    xlsx.utils.book_append_sheet(workBook, {},"Crawling_Products_Summary");  
    var ws9 = xlsx.utils.sheet_add_json(workBook.Sheets.Crawling_Products_Summary, smrInfo, { origin : "A2"});
    var prodStCol;
    var prodStRow;
    try {
        prodStCol = Object.keys(smrInfo[0]).length;
        prodStRow = Object.keys(smrInfo).length;

        for(var n = 65; n < 65 + prodStCol; n++) {
            for(var m = 1; m < prodStRow + 3; m++) {
                var t = excIndex(n);
                var p = String(m);
                
                // Header
                if(m == 1 && n == 65) ws9[t+p] = {t: 's', v: 'PF Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 77) ws9[t+p] = {t: 's', v: 'LearnMore PD Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "E0E0E0"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 86) ws9[t+p] = {t: 's', v: 'Cart Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "99FFCC"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 2 && n >= 65 && n < 77) ws9[t+p] = {t: 's', v: ws9[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 77 && n < 86) ws9[t+p] = {t: 's', v: ws9[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "E0E0E0"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 86) ws9[t+p] = {t: 's', v: ws9[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "99FFCC"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                
                // Data
                else {
                    try {
                        ws9[t+p] = {t: 's', v: ws9[t+p].v, s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    } catch(e) {
                        ws9[t+p] = {t: 's', v: '', s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    }
                }
            }       
        }

        ws9["!merges"] = [{s: {r:0, c:0} , e: {r:0, c:11}}, {s: {r:0, c:12} , e: {r:0, c:20}}, {s: {r:0, c:21} , e: {r:0, c:21}}];
    } catch(e) {

    }


    xlsx.utils.book_append_sheet(workBook, {},"Product_Basic_Info_Fail");  
    var ws = xlsx.utils.sheet_add_json(workBook.Sheets.Product_Basic_Info_Fail, prodInfo, { origin : "A2"});
    var prodStCol;
    var prodStRow;
    try {
        prodStCol = Object.keys(prodInfo[0]).length;
        prodStRow = Object.keys(prodInfo).length;

        for(var n = 65; n < 65 + prodStCol; n++) {
            for(var m = 1; m < prodStRow + 3; m++) {
                var t = excIndex(n);
                var p = String(m);
                
                // Header
                if(m == 1 && n == 65) ws[t+p] = {t: 's', v: 'Test Case Result', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 75) ws[t+p] = {t: 's', v: 'PF Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 81) ws[t+p] = {t: 's', v: 'Search API Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 2 && n >= 65 && n < 75) ws[t+p] = {t: 's', v: ws[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 75 && n < 81) ws[t+p] = {t: 's', v: ws[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 81) ws[t+p] = {t: 's', v: ws[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                
                // Data
                else {
                    try {
                        ws[t+p] = {t: 's', v: ws[t+p].v, s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    } catch(e) {
                        ws[t+p] = {t: 's', v: '', s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    }
                }
            }       
        }

        ws["!merges"] = [{s: {r:0, c:0} , e: {r:0, c:9}}, {s: {r:0, c:10} , e: {r:0, c:15}}, {s: {r:0, c:16} , e: {r:0, c:23}}];
    } catch(e) {

    }
    

    xlsx.utils.book_append_sheet(workBook, {},"PF_Price_Fail");
    var ws2 = xlsx.utils.sheet_add_json(workBook.Sheets.PF_Price_Fail, pfPrice, { origin : "A2"});
    var prodStCol;
    var prodStRow;

    try{
        prodStCol = Object.keys(pfPrice[0]).length;
        prodStRow = Object.keys(pfPrice).length;

        for(var n = 65; n < 65 + prodStCol; n++) {
            for(var m = 1; m < prodStRow + 3; m++) {
                var t = excIndex(n);
                var p = String(m);
    
                // Header
                if(m == 1 && n == 65) ws2[t+p] = {t: 's', v: 'Test Case Result', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 73) ws2[t+p] = {t: 's', v: 'PF Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 78) ws2[t+p] = {t: 's', v: 'Search API Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 2 && n >= 65 && n < 73) ws2[t+p] = {t: 's', v: ws2[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 73 && n < 78) ws2[t+p] = {t: 's', v: ws2[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 78) ws2[t+p] = {t: 's', v: ws2[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                
                // Data
                else {
                    try {
                        ws2[t+p] = {t: 's', v: ws2[t+p].v, s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    } catch(e) {
                        ws2[t+p] = {t: 's', v: '', s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    }
                }
            }       
        }
    
        ws2["!merges"] = [{s: {r:0, c:0} , e: {r:0, c:7}}, {s: {r:0, c:8} , e: {r:0, c:12}}, {s: {r:0, c:13} , e: {r:0, c:25}}];
    } catch(e) {

    }


    try{
        xlsx.utils.book_append_sheet(workBook, {},"BuyNow_CTA_Info_Fail");  
        var ws3 = xlsx.utils.sheet_add_json(workBook.Sheets.BuyNow_CTA_Info_Fail, buynowInfo, { origin : "A2"});
        var prodStCol = Object.keys(buynowInfo[0]).length;
        var prodStRow = Object.keys(buynowInfo).length;
        
        for(var n = 65; n < 65 + prodStCol; n++) {
            for(var m = 1; m < prodStRow + 3; m++) {
                var t = excIndex(n);
                var p = String(m);

                // Header
                if(m == 1 && n == 65) ws3[t+p] = {t: 's', v: 'Test Case Result', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 77) ws3[t+p] = {t: 's', v: 'PF Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 79) ws3[t+p] = {t: 's', v: 'BuyNow PD Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 83) ws3[t+p] = {t: 's', v: 'Search API Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 2 && n >= 65 && n < 77) ws3[t+p] = {t: 's', v: ws3[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 77 && n < 79) ws3[t+p] = {t: 's', v: ws3[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 79 && n < 83) ws3[t+p] = {t: 's', v: ws3[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 83) ws3[t+p] = {t: 's', v: ws3[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                
                // Data
                else {
                    try {
                        ws3[t+p] = {t: 's', v: ws3[t+p].v, s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    } catch(e) {
                        ws3[t+p] = {t: 's', v: '', s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    }
                }
            }       
        }

        ws3["!merges"] = [{s: {r:0, c:0} , e: {r:0, c:11}}, {s: {r:0, c:12} , e: {r:0, c:13}}, {s: {r:0, c:14} , e: {r:0, c:17}}, {s: {r:0, c:18} , e: {r:0, c:30}}];
    } catch(e){

    }

    xlsx.utils.book_append_sheet(workBook, {},"LearnMore_CTA_Info_Fail");  
    var ws4 = xlsx.utils.sheet_add_json(workBook.Sheets.LearnMore_CTA_Info_Fail, learnInfo, { origin : "A2"});
    var prodStCol = Object.keys(learnInfo[0]).length;
    var prodStRow = Object.keys(learnInfo).length;
    
    for(var n = 65; n < 65 + prodStCol; n++) {
        for(var m = 1; m < prodStRow + 3; m++) {
            var t = excIndex(n);
            var p = String(m);

            // Header
            if(m == 1 && n == 65) ws4[t+p] = {t: 's', v: 'Test Case Result', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 79) ws4[t+p] = {t: 's', v: 'PF Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 81) ws4[t+p] = {t: 's', v: 'LearnMore PD Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 85) ws4[t+p] = {t: 's', v: 'Search API Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 2 && n >= 65 && n < 79) ws4[t+p] = {t: 's', v: ws4[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 79 && n < 81) ws4[t+p] = {t: 's', v: ws4[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 81 && n < 85) ws4[t+p] = {t: 's', v: ws4[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 85) ws4[t+p] = {t: 's', v: ws4[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            
            // Data
            else {
                try {
                    ws4[t+p] = {t: 's', v: ws4[t+p].v, s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                } catch(e) {
                    ws4[t+p] = {t: 's', v: '', s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                }
            }
        }       
    }

    ws4["!merges"] = [{s: {r:0, c:0} , e: {r:0, c:13}}, {s: {r:0, c:14} , e: {r:0, c:15}}, {s: {r:0, c:16} , e: {r:0, c:19}}, {s: {r:0, c:20} , e: {r:0, c:32}}];


    try{
        xlsx.utils.book_append_sheet(workBook, {},"Tiered_Price_Fail");  
        var ws8 = xlsx.utils.sheet_add_json(workBook.Sheets.Tiered_Price_Fail, tieredInfo, { origin : "A2"});
        var prodStCol = Object.keys(tieredInfo[0]).length;
        var prodStRow = Object.keys(tieredInfo).length;
        
        for(var n = 65; n < 65 + prodStCol; n++) {
            for(var m = 1; m < prodStRow + 3; m++) {
                var t = excIndex(n);
                var p = String(m);

                // Header
                if(m == 1 && n == 65) ws8[t+p] = {t: 's', v: 'Test Case Result', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 75) ws8[t+p] = {t: 's', v: 'PF Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 83) ws8[t+p] = {t: 's', v: 'PD Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 86) ws8[t+p] = {t: 's', v: 'Search API Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 2 && n >= 65 && n < 75) ws8[t+p] = {t: 's', v: ws8[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 75 && n < 83) ws8[t+p] = {t: 's', v: ws8[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 83 && n < 86) ws8[t+p] = {t: 's', v: ws8[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 86) ws8[t+p] = {t: 's', v: ws8[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                
                // Data
                else {
                    try {
                        ws8[t+p] = {t: 's', v: ws8[t+p].v, s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    } catch(e) {
                        ws8[t+p] = {t: 's', v: '', s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    }
                }
            }       
        }

        ws8["!merges"] = [{s: {r:0, c:0} , e: {r:0, c:9}}, {s: {r:0, c:10} , e: {r:0, c:17}}, {s: {r:0, c:18} , e: {r:0, c:20}}, {s: {r:0, c:21} , e: {r:0, c:30}}];
    }catch(e){

    }


    try{
        xlsx.utils.book_append_sheet(workBook, {},"Cart_Info_Fail");  
        var ws5 = xlsx.utils.sheet_add_json(workBook.Sheets.Cart_Info_Fail, cartInfo, { origin : "A2"});
        var prodStCol = Object.keys(cartInfo[0]).length;
        var prodStRow = Object.keys(cartInfo).length;
        
        for(var n = 65; n < 65 + prodStCol; n++) {
            for(var m = 1; m < prodStRow + 3; m++) {
                var t = excIndex(n);
                var p = String(m);

                // Header
                if(m == 1 && n == 65) ws5[t+p] = {t: 's', v: 'Test Case Result', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 71) ws5[t+p] = {t: 's', v: 'Cart Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 1 && n == 76) ws5[t+p] = {t: 's', v: 'Search API Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}}}};
                else if(m == 2 && n >= 65 && n < 71) ws5[t+p] = {t: 's', v: ws5[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 71 && n < 76) ws5[t+p] = {t: 's', v: ws5[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                else if(m == 2 && n >= 76) ws5[t+p] = {t: 's', v: ws5[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                
                // Data
                else {
                    try {
                        ws5[t+p] = {t: 's', v: ws5[t+p].v, s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    } catch(e) {
                        ws5[t+p] = {t: 's', v: '', s: {border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
                    }
                }
            }       
        }

        ws5["!merges"] = [{s: {r:0, c:0} , e: {r:0, c:5}}, {s: {r:0, c:6} , e: {r:0, c:10}}, {s: {r:0, c:11} , e: {r:0, c:22}}];
    }catch(e){

    }

    xlsx.utils.book_append_sheet(workBook, {},"All_Fail_Raw");  
    var ws6 = xlsx.utils.sheet_add_json(workBook.Sheets.All_Fail_Raw, failData, { origin : "A2"});
    var prodStCol = Object.keys(failData[0]).length;
    var prodStRow = Object.keys(failData).length;
    
    for(var n = 65; n < 65 + prodStCol; n++) {
        for(var m = 1; m < prodStRow + 3; m++) {
            var t = excIndex(n);
            var p = String(m);

            // Header
            if(m == 1 && n == 65) ws6[t+p] = {t: 's', v: 'Test Case Result', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 109) ws6[t+p] = {t: 's', v: 'Search API Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 130) ws6[t+p] = {t: 's', v: 'PF Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 140) ws6[t+p] = {t: 's', v: 'BuyNow Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 152) ws6[t+p] = {t: 's', v: 'LearnMore Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCD28"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 164) ws6[t+p] = {t: 's', v: 'Cart Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "d2d2d2"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 2 && n >= 65 && n < 109) ws6[t+p] = {t: 's', v: ws6[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 109 && n < 130) ws6[t+p] = {t: 's', v: ws6[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 130 && n < 140) ws6[t+p] = {t: 's', v: ws6[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 140 && n < 152) ws6[t+p] = {t: 's', v: ws6[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 152 && n < 164) ws6[t+p] = {t: 's', v: ws6[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCD28"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 164) ws6[t+p] = {t: 's', v: ws6[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "d2d2d2"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            
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

    ws6["!merges"] = [{s: {r:0, c:0} , e: {r:0, c:43}}, {s: {r:0, c:44} , e: {r:0, c:64}}, {s: {r:0, c:65} , e: {r:0, c:74}}, {s: {r:0, c:75} , e: {r:0, c:86}}, {s: {r:0, c:87} , e: {r:0, c:98}}, {s: {r:0, c:99} , e: {r:0, c:101}}];



    xlsx.utils.book_append_sheet(workBook, {},"All_Raw_Data");  
    var ws7 = xlsx.utils.sheet_add_json(workBook.Sheets.All_Raw_Data, rsData, { origin : "A2"});
    var prodStCol = Object.keys(failData[0]).length;
    var prodStRow = Object.keys(failData).length;
    
    for(var n = 65; n < 65 + prodStCol; n++) {
        for(var m = 1; m < prodStRow + 3; m++) {
            var t = excIndex(n);
            var p = String(m);

            // Header
            if(m == 1 && n == 65) ws7[t+p] = {t: 's', v: 'Test Case Result', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 109) ws7[t+p] = {t: 's', v: 'Search API Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 130) ws7[t+p] = {t: 's', v: 'PF Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 140) ws7[t+p] = {t: 's', v: 'BuyNow Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 152) ws7[t+p] = {t: 's', v: 'LearnMore Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCD28"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 1 && n == 164) ws7[t+p] = {t: 's', v: 'Cart Page Data', s: {font: {bold: true}, fill: {fgColor: {rgb: "d2d2d2"}}, border: {bottom: {style: "thin"}}}};
            else if(m == 2 && n >= 65 && n < 109) ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFFF33"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 109 && n < 130) ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCFFE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 130 && n < 140) ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "CCE5FF"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 140 && n < 152) ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCCE5"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 152 && n < 164) ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "FFCD28"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            else if(m == 2 && n >= 164) ws7[t+p] = {t: 's', v: ws7[t+p].v, s: {font: {bold: true}, fill: {fgColor: {rgb: "d2d2d2"}}, border: {bottom: {style: "thin"}, right: {style: "thin"}}}};
            
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
    ws7["!merges"] = [{s: {r:0, c:0} , e: {r:0, c:43}}, {s: {r:0, c:44} , e: {r:0, c:64}}, {s: {r:0, c:65} , e: {r:0, c:74}}, {s: {r:0, c:75} , e: {r:0, c:86}}, {s: {r:0, c:87} , e: {r:0, c:98}}, {s: {r:0, c:99} , e: {r:0, c:101}}];


    xlsx.writeFile(workBook, report + "Total_Result_" + mode + ".xlsx");
    console.log(mode + " Result File Saved!");
}

function compare_excel(i, n, mode, site) {

    rsJson = new Object();
    smrJson = new Object();
    prodJson = new Object();
    pfJson = new Object();
    buynowJson = new Object();
    learnJson = new Object();
    cartJson = new Object();
    tieredJson = new Object();

    var testResult;
    var totalFailCnt = 0;

    rsJson.SiteCode = site;
    smrJson.SiteCode = site;
    prodJson.SiteCode = site;
    pfJson.SiteCode = site;
    buynowJson.SiteCode = site;
    learnJson.SiteCode = site;
    cartJson.SiteCode = site;
    tieredJson.SiteCode = site;

    // testcase total result
    rsJson.testTotal = "Pass";
    prodJson.TC_Total = "Pass";
    var ProdFailCnt = 0;
    pfJson.TC_Total = "Pass";
    var PfFailCnt = 0;
    buynowJson.TC_Total = "Pass";
    var BNFailCnt = 0;
    learnJson.TC_Total = "Pass";
    var LMFailCnt = 0;
    cartJson.TC_Total = "Pass";
    var CartFailCnt = 0;
    tieredJson.TC_Total = "Pass";
    var TieredFailCnt = 0;

    // SKU
    testResult = testAssert.Assert_Equal("SKU", api_Data[i].modelCode, pf_Data[n].SKU,"",""); 
    if(testResult.result == "Fail") { totalFailCnt++; ProdFailCnt++; }
    rsJson.SKU = testResult.result;
    rsJson.SKU_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    prodJson.SKU_Match = testResult.result;
    prodJson.SKU_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    
    // Display_Name
    testResult = testAssert.Assert_Equal("Display_Name", convert.replaceBr(api_Data[i].displayName), convert.replaceR(pf_Data[n].PF_DISPLAYNAME),"",""); 
    if(testResult.result == "Fail") { totalFailCnt++; ProdFailCnt++; }
    rsJson.Display_Name = testResult.result;
    rsJson.Display_Name_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    prodJson.Display_Name_Match = testResult.result;
    prodJson.Display_Name_Comment = testResult.data.expected + " :: " + testResult.data.actual;

    // Chip_Option
    var expectedChip = [api_Data[i].fmyChipList + convert.removeU200(api_Data[i].fmyChipList2), convert.removeU200(api_Data[i].fmyChipList2) + api_Data[i].fmyChipList];
    var actualChip = pf_Data[n].PF_COLOR + convert.removeU200(pf_Data[n].PF_MEMORY);
     
    testResult = testAssert.Assert_Equal_ExpArray("Chip_Option", expectedChip, actualChip,"","");
    if(testResult.data.expected == undefined) testResult.data.expected = api_Data[i].fmyChipList + convert.removeU200(api_Data[i].fmyChipList2);
    
    if(testResult.result == "Fail") { totalFailCnt++; ProdFailCnt++; }
    rsJson.Chip_Option = testResult.result; 
    rsJson.Chip_Option_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    prodJson.Chip_Option_Match = testResult.result;
    prodJson.Chip_Option_Comment = testResult.data.expected + " :: " + testResult.data.actual;

    // PF Price 관련
    var exp_PromotionPrice = "";
    var exp_PromotionPrices = new Array(); 
    var act_PromotionPrice = ""; 

    var exp_OriginPrice = ""; 
    var act_OriginPrice = ""; 

    var exp_SavePrice = ""; 
    var act_SavePrice = ""; 

    if(mode == "Guest"){
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
        
    }
    else if(mode == "Include"){
        exp_PromotionPrices = [convert.Comma(api_Data[i].smbPromotionPriceDisplay), convert.Comma(api_Data[i].promotionPriceDisplay)]; 
        
        exp_OriginPrice = api_Data[i].priceDisplay; 
        act_OriginPrice = convert.replaceNA(pf_Data[n].PF_PRICE_ORIGINAL); 

        if(api_Data[i].priceDisplay != "" && api_Data[i].smbPromotionPriceDisplay != "" && api_Data[i].saveText == "") {
            exp_SavePrice = parseInt(convert.saveRemake(api_Data[i].priceDisplay)) - parseInt(convert.saveRemake(api_Data[i].smbPromotionPriceDisplay));
            act_SavePrice = parseInt(convert.saveRemake(pf_Data[n].PF_PRICE_ORIGINAL)) - parseInt(convert.saveRemake(pf_Data[n].PF_PRICE_PROMOTION));      
        } else {
            exp_SavePrice = api_Data[i].saveText;
            act_SavePrice = convert.saveRemake(pf_Data[n].PF_PRICE_SAVE);
        }
    
    }
    else if(mode == "Exclude") {  
        exp_PromotionPrice = api_Data[i].taxExPriceDisplay;

        exp_OriginPrice = api_Data[i].priceDisplay; 
        act_OriginPrice = convert.replaceNA(pf_Data[n].PF_PRICE_ORIGINAL); 

        if(api_Data[i].priceDisplay != "" && api_Data[i].smbPromotionPriceDisplay != "" && api_Data[i].saveText == "") {
            exp_SavePrice = parseInt(convert.saveRemake(api_Data[i].priceDisplay)) - parseInt(convert.saveRemake(api_Data[i].smbPromotionPriceDisplay));
            act_SavePrice = convert.saveRemake(pf_Data[n].PF_PRICE_SAVE);       
        } else {
            exp_SavePrice = api_Data[i].saveText;
            act_SavePrice = convert.saveRemake(pf_Data[n].PF_PRICE_SAVE);
        }    
    }

    // PromotionPrice 
    act_PromotionPrice = convert.replaceNA(pf_Data[n].PF_PRICE_PROMOTION);
    if(mode != "Exclude") {testResult = testAssert.Assert_Equal_ExpArray("PromotionPrice", exp_PromotionPrices, act_PromotionPrice,"",""); }
    else { testResult = testAssert.Assert_Equal("PromotionPrice", api_Data[i].taxExPriceDisplay, act_PromotionPrice,"",""); }
    if(testResult.result == "Fail") { totalFailCnt++; PfFailCnt++; }
    rsJson.PromotionPrice = testResult.result; 
    rsJson.PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    pfJson.PromotionPrice_Match = testResult.result;
    pfJson.PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    exp_PromotionPrice = testResult.data.expected;

    // OriginPrice
    if(exp_SavePrice != "") {
        testResult = testAssert.Assert_Equal("OriginPrice", exp_OriginPrice, act_OriginPrice,"","");  
        if(testResult.result == "Fail") { totalFailCnt++; PfFailCnt++; }
        rsJson.OriginPrice_Match = testResult.result; 
        rsJson.OriginPrice_Comment = (testResult.data.expected).toString() + " :: " + (testResult.data.actual).toString();
        pfJson.OriginPrice_Match = testResult.result;
        pfJson.OriginPrice_Comment = (testResult.data.expected).toString() + " :: " + (testResult.data.actual).toString();

        // SavePrice 
        testResult = testAssert.Assert_Equal("SavePrice", exp_SavePrice, act_SavePrice,"","");
        if(testResult.result == "Fail") { totalFailCnt++; PfFailCnt++; }
        rsJson.SavePrice_Match = testResult.result; 
        rsJson.SavePrice_Comment = (testResult.data.expected).toString() + " :: " + (testResult.data.actual).toString();
        pfJson.SavePrice_Match = testResult.result;
        pfJson.SavePrice_Comment = (testResult.data.expected).toString() + " :: " + (testResult.data.actual).toString();

    } else {
        rsJson.OriginPrice_Match = "N/A";
        rsJson.OriginPrice_Comment = "N/A";
        rsJson.SavePrice_Match = "N/A";
        rsJson.SavePrice_Comment = "N/A";
        pfJson.OriginPrice_Match = "N/A";
        pfJson.OriginPrice_Comment = "N/A";
        pfJson.SavePrice_Match = "N/A";
        pfJson.SavePrice_Comment = "N/A";
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
    
    if(testResult.result == "Fail") { totalFailCnt++; ProdFailCnt++; BNFailCnt++; LMFailCnt++; CartFailCnt++; }
    rsJson.Stock = testResult.result;
    prodJson.Stock_Match = testResult.result;
    buynowJson.Stock_Match = testResult.result;
    learnJson.Stock_Match = testResult.result;
    cartJson.Stock_Match = testResult.result;
    rsJson.Stock_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    prodJson.Stock_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    buynowJson.Stock_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    learnJson.Stock_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    cartJson.Stock_Comment = testResult.data.expected + " :: " + testResult.data.actual;

    // BuyNowCTA_PDType
    var exp_BuyNowCTA_PDType = "";
    if(testResult.data.expected == "inStock") exp_BuyNowCTA_PDType = "STANDARD";
    if(testResult.data.expected == "inStock" && api_Data[i].pviTypeName == "Mobile") exp_BuyNowCTA_PDType = "FEATURE";
    var act_BuyNowCTA_PDType = pf_Data[n].BUY_NOW_PD_TYPE;

    if(testResult.data.expected != "inStock") {
        rsJson.BuyNowCTA_PDType = "N/A";
        rsJson.BuyNowCTA_PDType_Comment = "N/A";
        buynowJson.BuyNowCTA_PDType = "N/A";
        buynowJson.BuyNowCTA_PDType_Comment = "N/A";
    }
    else {
        testResult = testAssert.Assert_Equal("BuyNowCTA_PDType", exp_BuyNowCTA_PDType, act_BuyNowCTA_PDType,"","");
        if(testResult.result == "Fail") { totalFailCnt++; BNFailCnt++; }
        rsJson.BuyNowCTA_PDType = testResult.result;
        buynowJson.BuyNowCTA_PDType = testResult.result;
        rsJson.BuyNowCTA_PDType_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        buynowJson.BuyNowCTA_PDType_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    }

    //BuyNow_BC_PromotionPrice
    var exp_BuyNow_BC_PromotionPrice = ""; 
    var act_BuyNow_BC_PromotionPrice = "";

    var exp_Cart_PromotionPrice = [convert.replaceBlank(api_Data[i].smbPromotionPriceDisplay), convert.replaceBlank(api_Data[i].promotionPriceDisplay)];
    var act_Cart_PromotionPrice = "";

    if((act_Stock == "inStock" || act_Stock == "preOrder") && (act_BuyNowCTA_PDType != "MKT" && act_BuyNowCTA_PDType != "PCD" && act_BuyNowCTA_PDType != "OTHER" && act_BuyNowCTA_PDType != "404")){ 
        exp_BuyNow_BC_PromotionPrice = exp_PromotionPrice;
        act_BuyNow_BC_PromotionPrice = convert.replace00A0(pf_Data[n].BUY_NOW_BC_Promotion_Price);

        if(act_Stock == "inStock") {
            testResult = testAssert.Assert_Equal("BuyNow_PromotionPrice", exp_BuyNow_BC_PromotionPrice, act_BuyNow_BC_PromotionPrice,"","");        
            if(testResult.result == "Fail") { totalFailCnt++; BNFailCnt++; }
            rsJson.BuyNow_BC_PromotionPrice = testResult.result; 
            rsJson.BuyNow_BC_PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
            buynowJson.BuyNow_BC_PromotionPrice = testResult.result; 
            buynowJson.BuyNow_BC_PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

            var exp_BuyNow_BC_OriginPrice = api_Data[i].priceDisplay;
            var act_BuyNow_BC_OriginPrice = pf_Data[n].BUY_NOW_BC_Original_Price;

            if(api_Data[i].promotionPriceDisplay != exp_BuyNow_BC_OriginPrice) {
                testResult = testAssert.Assert_Equal("BuyNow_OriginPrice", exp_BuyNow_BC_OriginPrice, act_BuyNow_BC_OriginPrice,"","");        
                if(testResult.result == "Fail") { totalFailCnt++; BNFailCnt++; }
                rsJson.BuyNow_BC_OriginPrice = testResult.result; 
                rsJson.BuyNow_BC_OriginPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
                buynowJson.BuyNow_BC_OriginPrice = testResult.result; 
                buynowJson.BuyNow_BC_OriginPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

                var exp_BuyNow_BC_SavePrice = api_Data[i].saveText;
                var act_BuyNow_BC_SavePrice = pf_Data[n].BUY_NOW_BC_Save_Price;

                testResult = testAssert.Assert_Equal("BuyNow_SavePrice", exp_BuyNow_BC_SavePrice, act_BuyNow_BC_SavePrice,"","");        
                if(testResult.result == "Fail") { totalFailCnt++; BNFailCnt++; }
                rsJson.BuyNow_BC_SavePrice = testResult.result; 
                rsJson.BuyNow_BC_SavePrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
                buynowJson.BuyNow_BC_SavePrice = testResult.result; 
                buynowJson.BuyNow_BC_SavePrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

            } else {
                rsJson.BuyNow_BC_OriginPrice = "N/A";
                rsJson.BuyNow_BC_OriginPrice_Comment = "N/A";
                rsJson.BuyNow_BC_SavePrice = "N/A";
                rsJson.BuyNow_BC_SavePrice_Comment = "N/A";
                buynowJson.BuyNow_BC_OriginPrice = "N/A";
                buynowJson.BuyNow_BC_OriginPrice_Comment = "N/A";
                buynowJson.BuyNow_BC_SavePrice = "N/A";
                buynowJson.BuyNow_BC_SavePrice_Comment = "N/A";
            }          
        }
        else {
            rsJson.BuyNow_BC_PromotionPrice = "N/A";
            rsJson.BuyNow_BC_PromotionPrice_Comment = "N/A";
            rsJson.BuyNow_BC_OriginPrice = "N/A";
            rsJson.BuyNow_BC_OriginPrice_Comment = "N/A";
            rsJson.BuyNow_BC_SavePrice = "N/A";
            rsJson.BuyNow_BC_SavePrice_Comment = "N/A";
            buynowJson.BuyNow_BC_PromotionPrice = "N/A";
            buynowJson.BuyNow_BC_PromotionPrice_Comment = "N/A";
            buynowJson.BuyNow_BC_OriginPrice = "N/A";
            buynowJson.BuyNow_BC_OriginPrice_Comment = "N/A";
            buynowJson.BuyNow_BC_SavePrice = "N/A";
            buynowJson.BuyNow_BC_SavePrice_Comment = "N/A";
        }

        // cart는 항상 include 가격
        act_Cart_PromotionPrice = convert.cartRemake(pf_Data[n].Cart_Price);

        if(mode != "Entire") {
            testResult = testAssert.Assert_Equal_ExpArray("Cart_PromotionPrice", exp_Cart_PromotionPrice, act_Cart_PromotionPrice,"","");
            if(testResult.data.expected == undefined) testResult.data.expected = "X";
             
            if(testResult.result == "Fail") { totalFailCnt++; CartFailCnt++; }
            rsJson.Cart_PromotionPrice = testResult.result;
            rsJson.Cart_PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
            cartJson.Cart_PromotionPrice = testResult.result;
            cartJson.Cart_PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        }
    }
    else {
        rsJson.BuyNow_BC_PromotionPrice = "N/A";
        rsJson.BuyNow_BC_PromotionPrice_Comment = "N/A";
        rsJson.BuyNow_BC_OriginPrice = "N/A";
        rsJson.BuyNow_BC_OriginPrice_Comment = "N/A";
        rsJson.BuyNow_BC_SavePrice = "N/A";
        rsJson.BuyNow_BC_SavePrice_Comment = "N/A";
        rsJson.Cart_PromotionPrice = "N/A";
        rsJson.Cart_PromotionPrice_Comment = "N/A";
        buynowJson.BuyNow_BC_PromotionPrice = "N/A";
        buynowJson.BuyNow_BC_PromotionPrice_Comment = "N/A";
        buynowJson.BuyNow_BC_OriginPrice = "N/A";
        buynowJson.BuyNow_BC_OriginPrice_Comment = "N/A";
        buynowJson.BuyNow_BC_SavePrice = "N/A";
        buynowJson.BuyNow_BC_SavePrice_Comment = "N/A";
        cartJson.Cart_PromotionPrice = "N/A";
        cartJson.Cart_PromotionPrice_Comment = "N/A";
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
        learnJson.LearnMoreCTA_PDType = "N/A";
        learnJson.LearnMoreCTA_PDType_Comment = "N/A";
    }
    else {
        testResult = testAssert.Assert_Equal("LearnMoreCTA_PDType", exp_LearnMoreCTA_PDType, act_LearnMoreCTA_PDType,"",""); 

        if(act_LearnMoreCTA_PDType == "MKT" || act_LearnMoreCTA_PDType == "PCD") {       
            totalFailCnt++;
            LMFailCnt++;
            rsJson.LearnMoreCTA_PDType = "Fail";
            rsJson.LearnMoreCTA_PDType_Comment = testResult.data.expected + " :: " + testResult.data.actual;
            learnJson.LearnMoreCTA_PDType = "Fail";
            learnJson.LearnMoreCTA_PDType_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        }
        else {       
            if(testResult.result == "Fail") { totalFailCnt++; LMFailCnt++; }
            rsJson.LearnMoreCTA_PDType = testResult.result;
            rsJson.LearnMoreCTA_PDType_Comment = testResult.data.expected + " :: " + testResult.data.actual;
            learnJson.LearnMoreCTA_PDType = testResult.result;
            learnJson.LearnMoreCTA_PDType_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        }
    }


    // Feature_PromotionPrice
    var exp_Feature_PromotionPrice = ""; 
    var act_Feature_PromotionPrice = ""; 

    if((exp_LearnMoreCTA_PDType == "FEATURE" && act_LearnMoreCTA_PDType == "FEATURE") && rsJson.LearnMoreCTA_PDType != "N/A"){
        exp_Feature_PromotionPrice = exp_PromotionPrice;
        act_Feature_PromotionPrice = convert.replaceNA(pf_Data[n].LEARN_MORE_FEATURE_Promotion_Price);

        testResult = testAssert.Assert_Equal("Feature_PromotionPrice", exp_Feature_PromotionPrice, act_Feature_PromotionPrice,"","");    
        if(testResult.result == "Fail") { totalFailCnt++; LMFailCnt++; }
        rsJson.Feture_Promotion = testResult.result;
        rsJson.Feture_Promotion_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        learnJson.Feture_Promotion = testResult.result;
        learnJson.Feture_Promotion_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    } else {
        rsJson.Feture_Promotion = "N/A";
        rsJson.Feture_Promotion_Comment = "N/A";
        learnJson.Feture_Promotion = "N/A";
        learnJson.Feture_Promotion_Comment = "N/A";
    }

    //LearnMore_BC_PromotionPrice
    var exp_LearnMore_BC_PromotionPrice = ""; 
    var act_LearnMore_BC_PromotionPrice = "";

    if((exp_Stock == "inStock" || exp_Stock == "outOfStock") && (act_LearnMoreCTA_PDType != "PCD" && act_LearnMoreCTA_PDType != "MKT" && act_LearnMoreCTA_PDType != "OTHER" && act_LearnMoreCTA_PDType != "") && rsJson.LearnMoreCTA_PDType != "N/A"){ 
        exp_LearnMore_BC_PromotionPrice = exp_PromotionPrice;
        act_LearnMore_BC_PromotionPrice = convert.replaceNA(pf_Data[n].LEARN_MORE_BC_Promotion_Price);
    
        testResult = testAssert.Assert_Equal("LearnMore_BC_PromotionPrice", exp_LearnMore_BC_PromotionPrice, act_LearnMore_BC_PromotionPrice,"","");     
        if(testResult.result == "Fail") { totalFailCnt++; LMFailCnt++; }
        rsJson.LearnMore_BC_PromotionPrice = testResult.result; 
        rsJson.LearnMore_BC_PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        learnJson.LearnMore_BC_PromotionPrice = testResult.result; 
        learnJson.LearnMore_BC_PromotionPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

        var exp_LearnMore_BC_OriginPrice = api_Data[i].priceDisplay;
        var act_LearnMore_BC_OriginPrice = pf_Data[n].LEARN_MORE_BC_Original_Price;

        if(api_Data[i].promotionPriceDisplay != exp_LearnMore_BC_OriginPrice) {
            testResult = testAssert.Assert_Equal("LearnMore_BC_OriginPrice", exp_LearnMore_BC_OriginPrice, act_LearnMore_BC_OriginPrice,"","");     
            if(testResult.result == "Fail") { totalFailCnt++; LMFailCnt++; }
            rsJson.LearnMore_BC_OriginPrice = testResult.result; 
            rsJson.LearnMore_BC_OriginPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
            learnJson.LearnMore_BC_OriginPrice = testResult.result; 
            learnJson.LearnMore_BC_OriginPrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

            var exp_LearnMore_BC_SavePrice = api_Data[i].saveText;
            var act_LearnMore_BC_SavePrice = pf_Data[n].LEARN_MORE_BC_Save_Price;

            testResult = testAssert.Assert_Equal("LearnMore_BC_SavePrice", exp_LearnMore_BC_SavePrice, act_LearnMore_BC_SavePrice,"","");     
            if(testResult.result == "Fail") { totalFailCnt++; LMFailCnt++; }
            rsJson.LearnMore_BC_SavePrice = testResult.result; 
            rsJson.LearnMore_BC_SavePrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;
            learnJson.LearnMore_BC_SavePrice = testResult.result; 
            learnJson.LearnMore_BC_SavePrice_Comment = testResult.data.expected + " :: " + testResult.data.actual;

        } else {
            rsJson.LearnMore_BC_OriginPrice = "N/A";
            rsJson.LearnMore_BC_OriginPrice_Comment = "N/A";
            rsJson.LearnMore_BC_SavePrice = "N/A";
            rsJson.LearnMore_BC_SavePrice_Comment = "N/A";
            learnJson.LearnMore_BC_OriginPrice = "N/A";
            learnJson.LearnMore_BC_OriginPrice_Comment = "N/A";
            learnJson.LearnMore_BC_SavePrice = "N/A";
            learnJson.LearnMore_BC_SavePrice_Comment = "N/A";
        }
        
        
        if(act_Stock == "inStock" && api_Data[i].pviTypeName != "Mobile") {
            rsJson.LearnMore_BC_PromotionPrice = "N/A";
            rsJson.LearnMore_BC_PromotionPrice_Comment = "N/A";
            rsJson.LearnMore_BC_OriginPrice = "N/A";
            rsJson.LearnMore_BC_OriginPrice_Comment = "N/A";
            rsJson.LearnMore_BC_SavePrice = "N/A";
            rsJson.LearnMore_BC_SavePrice_Comment = "N/A";
            learnJson.LearnMore_BC_PromotionPrice = "N/A";
            learnJson.LearnMore_BC_PromotionPrice_Comment = "N/A";
            learnJson.LearnMore_BC_OriginPrice = "N/A";
            learnJson.LearnMore_BC_OriginPrice_Comment = "N/A";
            learnJson.LearnMore_BC_SavePrice = "N/A";
            learnJson.LearnMore_BC_SavePrice_Comment = "N/A";
        }

    } else {
        rsJson.LearnMore_BC_PromotionPrice = "N/A";
        rsJson.LearnMore_BC_PromotionPrice_Comment = "N/A";
        rsJson.LearnMore_BC_OriginPrice = "N/A";
        rsJson.LearnMore_BC_OriginPrice_Comment = "N/A";
        rsJson.LearnMore_BC_SavePrice = "N/A";
        rsJson.LearnMore_BC_SavePrice_Comment = "N/A";
        learnJson.LearnMore_BC_PromotionPrice = "N/A";
        learnJson.LearnMore_BC_PromotionPrice_Comment = "N/A";
        learnJson.LearnMore_BC_OriginPrice = "N/A";
        learnJson.LearnMore_BC_OriginPrice_Comment = "N/A";
        learnJson.LearnMore_BC_SavePrice = "N/A";
        learnJson.LearnMore_BC_SavePrice_Comment = "N/A";
    }

    // PF Tiered Price
    var exp_pfTiered_Quantity = ""; 
    var act_pfTiered_Quantity = "";
    var exp_pfTiered_Price = ""; 
    var act_pfTiered_Price = "";
    var trdTemp = "";
    var extrdTemp = "";
    var trg = false;

    try {
        trdTemp = api_Data[i].tieredPrice.TieredPrices_minQuantity;
    } catch(e) {
    }
    try {
        extrdTemp = api_Data[i].tieredPrice.exVatTieredPrices_minQuantity;
    } catch(e) {
    }
    
    if(mode == "Include" && (trdTemp.charAt(0) == "1" && trdTemp.charAt(1) == "/") && trdTemp.length != 2) {
    
        exp_pfTiered_Quantity = trdTemp;
        act_pfTiered_Quantity = convert.tieredRemake(pf_Data[n].PF_TIERED_MIN);

        exp_pfTiered_Price = convert.tpRemake(api_Data[i].tieredPrice.TieredPrices_value);
        act_pfTiered_Price = convert.tpRemake(pf_Data[n].PF_TIERED_PRICE);
        trg = true;
        
    }
    else if(mode == "Exclude" && (convert.tieredRemake(extrdTemp).charAt(0) == "1" && convert.tieredRemake(extrdTemp).charAt(1) == "/") && convert.tieredRemake(extrdTemp).length != 2){
        
        exp_pfTiered_Quantity = convert.tieredRemake(extrdTemp);
        act_pfTiered_Quantity = convert.tieredRemake(pf_Data[n].PF_TIERED_MIN);

        exp_pfTiered_Price = convert.tpRemake(api_Data[i].tieredPrice.exVatTieredPrices_value);
        act_pfTiered_Price = convert.tpRemake(pf_Data[n].PF_TIERED_PRICE);
        trg = true;
        
    }

    if(trg) {

        // PF_Tiered_Quantity
        testResult = testAssert.Assert_Equal("PF_Tiered_Quantity", exp_pfTiered_Quantity, act_pfTiered_Quantity,"","");     
        if(testResult.result == "Fail") { totalFailCnt++; TieredFailCnt++; }
        rsJson.PF_Tiered_Quantity = testResult.result;
        rsJson.PF_Tiered_Quantity_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        tieredJson.PF_Tiered_Quantity = testResult.result;
        tieredJson.PF_Tiered_Quantity_Comment = testResult.data.expected + " :: " + testResult.data.actual;

        // PF_Tiered_Price
        testResult = testAssert.Assert_Equal("PF_Tiered_Price_Match", exp_pfTiered_Price, act_pfTiered_Price,"","");    
        if(testResult.result == "Fail") { totalFailCnt++; TieredFailCnt++; }
        rsJson.PF_Tiered_Price_Match = testResult.result;
        rsJson.PF_Tiered_Price_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        tieredJson.PF_Tiered_Price_Match = testResult.result;
        tieredJson.PF_Tiered_Price_Comment = testResult.data.expected + " :: " + testResult.data.actual;

    } else {
        rsJson.PF_Tiered_Quantity = "N/A";
        rsJson.PF_Tiered_Quantity_Comment = "N/A";
        rsJson.PF_Tiered_Price_Match = "N/A";
        rsJson.PF_Tiered_Price_Comment = "N/A";
        tieredJson.PF_Tiered_Quantity = "N/A";
        tieredJson.PF_Tiered_Quantity_Comment = "N/A";
        tieredJson.PF_Tiered_Price_Match = "N/A";
        tieredJson.PF_Tiered_Price_Comment = "N/A";
    }

    // PD Tiered Price
    var exp_pdTiered_Quantity = ""; 
    var act_pdTiered_Quantity = "";
    var exp_pdTiered_Price = ""; 
    var act_pdTiered_Price = "";
    var trdTemp = "";
    var extrdTemp = "";
    var prcTemp = "";
    var exprcTemp = "";

    try{
        trdTemp = api_Data[i].tieredPrice.TieredPrices_minQuantity;
    } catch(e){
    }
    try{
        extrdTemp = api_Data[i].tieredPrice.exVatTieredPrices_minQuantity;
    } catch(e){
    }
    try{
        prcTemp = api_Data[i].tieredPrice.TieredPrices_value;
    } catch(e){
    }
    try{
        exprcTemp = api_Data[i].tieredPrice.exVatTieredPrices_value;
    } catch(e){
    }

    if(rsJson.BuyNowCTA_PDType == "Pass" || rsJson.LearnMoreCTA_PDType == "Pass"){
        if(mode == "Include"){
            exp_pdTiered_Quantity = convert.tieredRemake(trdTemp);
            if(exp_pdTiered_Quantity == "1/") exp_pdTiered_Quantity = "";
            act_pdTiered_Quantity = convert.tieredRemake(pf_Data[n].PD_Tiered_Min); 

            exp_pdTiered_Price = convert.tpRemake(prcTemp);
            if(exp_pdTiered_Quantity == "1/") exp_pdTiered_Price = "";
            act_pdTiered_Price = convert.tpRemake(pf_Data[n].PD_Tiered_Price);
        }
        else if(mode == "Exclude"){
            exp_pdTiered_Quantity = convert.tieredRemake(extrdTemp);
            if(exp_pdTiered_Quantity == "1/") exp_pdTiered_Quantity = "";
            act_pdTiered_Quantity = convert.tieredRemake(pf_Data[n].PD_Tiered_Min); 

            exp_pdTiered_Price = convert.tpRemake(exprcTemp);
            if(exp_pdTiered_Quantity == "1/") exp_pdTiered_Price = "";
            act_pdTiered_Price = convert.tpRemake(pf_Data[n].PD_Tiered_Price);
        }

        // PD_Tiered_Quantity
        testResult = testAssert.Assert_Equal("PD_Tiered_Quantity", exp_pdTiered_Quantity, act_pdTiered_Quantity,"","");  
        if(testResult.result == "Fail") { totalFailCnt++; TieredFailCnt++; }
        rsJson.PD_Tiered_Quantity = testResult.result; 
        rsJson.PD_Tiered_Quantity_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        tieredJson.PD_Tiered_Quantity = testResult.result; 
        tieredJson.PD_Tiered_Quantity_Comment = testResult.data.expected + " :: " + testResult.data.actual;

        // PD_Tiered_Price
        testResult = testAssert.Assert_Equal("PD_Tiered_Price_Match", exp_pdTiered_Price, act_pdTiered_Price,"","");      
        if(testResult.result == "Fail") { totalFailCnt++; TieredFailCnt++; }
        rsJson.PD_Tiered_Price_Match = testResult.result;
        rsJson.PD_Tiered_Price_Comment = testResult.data.expected + " :: " + testResult.data.actual;
        tieredJson.PD_Tiered_Price_Match = testResult.result;
        tieredJson.PD_Tiered_Price_Comment = testResult.data.expected + " :: " + testResult.data.actual;
    }
    else {
        rsJson.PD_Tiered_Quantity = "N/A";;
        rsJson.PD_Tiered_Quantity_Comment = "N/A";
        rsJson.PD_Tiered_Price_Match = "N/A";
        rsJson.PD_Tiered_Price_Comment = "N/A";
        tieredJson.PD_Tiered_Quantity = "N/A";;
        tieredJson.PD_Tiered_Quantity_Comment = "N/A";
        tieredJson.PD_Tiered_Price_Match = "N/A";
        tieredJson.PD_Tiered_Price_Comment = "N/A";
    }

    // totalResult
    var ttr = true;
    var ttr = true;
    var pdtr = true;
    var pftr = true;
    var bntr = true;
    var lmtr = true;
    var cttr = true;
    var titr = true;

    if(totalFailCnt > 0){
        rsJson.testTotal = "Fail";
        ttr = false;
    }
    if(ProdFailCnt > 0) {prodJson.TC_Total = "Fail"; pdtr = false;}
    if(PfFailCnt > 0) {pfJson.TC_Total = "Fail"; pftr = false;}
    if(BNFailCnt > 0) {buynowJson.TC_Total = "Fail"; bntr = false;}
    if(LMFailCnt > 0) {learnJson.TC_Total = "Fail"; lmtr = false;}
    if(CartFailCnt > 0) {cartJson.TC_Total = "Fail"; cttr = false;}
    if(TieredFailCnt > 0) {tieredJson.TC_Total = "Fail"; titr = false;}

    if(pf_Data[n].Comment == "OnlyAPI") write_Onlyapi(site, n);

    else write_Result(i, n, mode, ttr, pdtr, pftr, bntr, lmtr, cttr, titr);
}


/***********************************************************************
 
    Function : Writing Result Data to JSON
    Process : write_Result(i, n)
    Writer  : JK
    Data    : 2022-04-07
 
 ***********************************************************************/
function write_Result(i, n, mode, checkt, checkpd, checkpf, checkbn, checklm, checkct, checktr) {

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
        rsJson.API_PDtaxExTieredPrice = api_Data[i].tieredPrice.exVatTieredPrices_value;
    }catch(e){
        rsJson.API_PDtaxExTieredPrice = "";
    }
    try{
        rsJson.API_PDtieredPrice = api_Data[i].tieredPrice.TieredPrices_value;
    }catch(e){
        rsJson.API_PDtieredPrice = "";
    }
    try{
    rsJson.API_PDtieredPriceQuantity = api_Data[i].tieredPrice.TieredPrices_minQuantity;
    }catch(e){
        rsJson.API_PDtieredPriceQuantity = "";
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


    smrJson.PF_URL = pf_Data[n].PF_URL;
    smrJson.PF_SKU = pf_Data[n].SKU;
    smrJson.PF_Display_Name = pf_Data[n].PF_DISPLAYNAME;
    smrJson.PF_COLOR = pf_Data[n].PF_COLOR;
    smrJson.PF_MEMORY = pf_Data[n].PF_MEMORY;
    smrJson.PF_Promotion_Price = pf_Data[n].PF_PRICE_PROMOTION;
    smrJson.PF_Price = pf_Data[n].PF_PRICE_ORIGINAL;
    smrJson.PF_Save_Price = pf_Data[n].PF_PRICE_SAVE;
    smrJson.PF_Tiered_Min = pf_Data[n].PF_TIERED_MIN;
    smrJson.PF_Tiered_Price = pf_Data[n].PF_TIERED_PRICE;
    smrJson.BuyNowCTA_Stock = pf_Data[n].BUY_NOW_CTA_STOCK;
    smrJson.LearnMoreCTA_URL = convert.replace00A0(pf_Data[n].LEARN_MORE_CTA_URL);
    smrJson.LearnMoreCTA_Feature_PD_Promotion_Price = pf_Data[n].LEARN_MORE_FEATURE_Promotion_Price;
    smrJson.LearnMoreCTA_Feature_PD_Price = pf_Data[n].LEARN_MORE_FEATURE_Original_Price;
    smrJson.LearnMoreCTA_Feature_PD_Save_Price = pf_Data[n].LEARN_MORE_FEATURE_Save_Price;
    smrJson.LearnMoreCTA_PD_Promotion_Price = pf_Data[n].LEARN_MORE_BC_Promotion_Price;
    smrJson.LearnMoreCTA_PD_Price = pf_Data[n].LEARN_MORE_BC_Original_Price;
    smrJson.LearnMoreCTA_PD_Save_Price = pf_Data[n].LEARN_MORE_BC_Save_Price;
    smrJson.LearnMoreCTA_PD_Tiered_Min = pf_Data[n].PD_Tiered_Min;
    smrJson.LearnMoreCTA_PD_Tiered_Price = pf_Data[n].PD_Tiered_Price;
    smrJson.Cart_Price = pf_Data[n].Cart_Price;


    prodJson.PF_URL = pf_Data[n].PF_URL;
    prodJson.PF_SKU = pf_Data[n].SKU;
    prodJson.PF_Display_Name = pf_Data[n].PF_DISPLAYNAME;
    prodJson.PF_COLOR = pf_Data[n].PF_COLOR;
    prodJson.PF_MEMORY = pf_Data[n].PF_MEMORY;
    prodJson.PF_Stock = pf_Data[n].BUY_NOW_CTA_STOCK;

    pfJson.PF_URL = pf_Data[n].PF_URL;
    pfJson.PF_Stock = pf_Data[n].BUY_NOW_CTA_STOCK;
    pfJson.PF_PromotionPrice = pf_Data[n].PF_PRICE_PROMOTION;
    pfJson.PF_OriginalPrice = pf_Data[n].PF_PRICE_ORIGINAL;
    pfJson.PF_Save_Price = pf_Data[n].PF_PRICE_SAVE;

    buynowJson.PF_URL = pf_Data[n].PF_URL;
    buynowJson.PF_Stock = pf_Data[n].BUY_NOW_CTA_STOCK;  
    buynowJson.BuyNow_PD_URL = pf_Data[n].BUY_NOW_CTA_URL;
    if(pf_Data[n].BUY_NOW_CTA_URL == null) buynowJson.BuyNow_PD_URL = "";
    buynowJson.BuyNowPD_PromotionPrice = pf_Data[n].BUY_NOW_BC_Promotion_Price;
    buynowJson.BuyNowPD_OriginalPrice = pf_Data[n].BUY_NOW_BC_Original_Price;
    buynowJson.BuyNowPD_Save_Price = pf_Data[n].BUY_NOW_BC_Save_Price;

    learnJson.PF_URL = pf_Data[n].PF_URL; 
    learnJson.PF_Stock = pf_Data[n].LEARN_MORE_CTA_STOCK;
    learnJson.LearnMore_PD_URL = convert.replace00A0(pf_Data[n].LEARN_MORE_CTA_URL);
    learnJson.LearnMorePD_PromotionPrice = pf_Data[n].LEARN_MORE_BC_Promotion_Price;
    learnJson.LearnMorePD_OriginalPrice = pf_Data[n].LEARN_MORE_BC_Original_Price;
    learnJson.LearnMorePD_Save_Price = pf_Data[n].LEARN_MORE_BC_Save_Price;

    cartJson.PF_URL = pf_Data[n].PF_URL; 
    cartJson.PF_Stock = pf_Data[n].BUY_NOW_CTA_STOCK;
    cartJson.PD_URL = pf_Data[n].BUY_NOW_CTA_URL;
    if(pf_Data[n].BUY_NOW_CTA_URL == null || pf_Data[n].BUY_NOW_CTA_URL == "javascript:;") cartJson.PD_URL = convert.replace00A0(pf_Data[n].LEARN_MORE_CTA_URL); 
    cartJson.Cart_Price = pf_Data[n].Cart_Price;
    cartJson.Cart_Quantity = pf_Data[n].Cart_Quantity;

    tieredJson.PF_URL = pf_Data[n].PF_URL;
    tieredJson.PF_SKU = pf_Data[n].SKU;
    tieredJson.PF_Display_Name = pf_Data[n].PF_DISPLAYNAME;
    tieredJson.PF_Stock = pf_Data[n].BUY_NOW_CTA_STOCK;
    tieredJson.PF_COLOR = pf_Data[n].PF_COLOR;
    tieredJson.PF_MEMORY = pf_Data[n].PF_MEMORY;
    tieredJson.PF_Tiered_Min = pf_Data[n].PF_TIERED_MIN;
    tieredJson.PF_Tiered_Price = pf_Data[n].PF_TIERED_PRICE;
    tieredJson.PD_URL = pf_Data[n].BUY_NOW_CTA_URL;
    if(pf_Data[n].BUY_NOW_CTA_URL == null) tieredJson.PD_URL = convert.replace00A0(pf_Data[n].LEARN_MORE_CTA_URL);
    tieredJson.PD_Tiered_Min = pf_Data[n].PD_Tiered_Min;
    tieredJson.PD_Tiered_Price = pf_Data[n].PD_Tiered_Price;

    prodJson.API_familyRecord = api_Data[i].familyRecord;
    prodJson.API_diplayName = api_Data[i].displayName;
    prodJson.API_modelCode = api_Data[i].modelCode;
    prodJson.pviTypeName = api_Data[i].pviTypeName;
    prodJson.API_pviSubtypeName = api_Data[i].pviSubtypeName;
    prodJson.API_ctaType = api_Data[i].ctaType;
    prodJson.API_fmyChip1 = api_Data[i].fmyChipList;
    prodJson.API_fmyChip2 = api_Data[i].fmyChipList2;
    if(api_Data[i].fmyChipList2 == null) prodJson.API_fmyChip2 = "";

    pfJson.API_familyRecord = api_Data[i].familyRecord;
    pfJson.API_diplayName = api_Data[i].displayName;
    pfJson.API_modelCode = api_Data[i].modelCode;
    pfJson.pviTypeName = api_Data[i].pviTypeName;
    pfJson.API_pviSubtypeName = api_Data[i].pviSubtypeName;
    pfJson.API_ctaType = api_Data[i].ctaType;
    pfJson.API_fmyChip1 = api_Data[i].fmyChipList;
    pfJson.API_fmyChip2 = api_Data[i].fmyChipList2;
    if(api_Data[i].fmyChipList2 == null) pfJson.API_fmyChip2 = "";
    pfJson.API_promotionPriceDisplay = api_Data[i].promotionPriceDisplay;
    pfJson.API_smbPromotionPriceDisplay = api_Data[i].smbPromotionPriceDisplay;
    pfJson.API_PriceDisplay = api_Data[i].priceDisplay;
    pfJson.API_taxExPriceDisplay = api_Data[i].taxExPriceDisplay;
    pfJson.API_savePrice = api_Data[i].saveText;

    buynowJson.API_familyRecord = api_Data[i].familyRecord;
    buynowJson.API_diplayName = api_Data[i].displayName;
    buynowJson.API_modelCode = api_Data[i].modelCode;
    buynowJson.pviTypeName = api_Data[i].pviTypeName;
    buynowJson.API_pviSubtypeName = api_Data[i].pviSubtypeName;
    buynowJson.API_ctaType = api_Data[i].ctaType;
    buynowJson.API_fmyChip1 = api_Data[i].fmyChipList;
    buynowJson.API_fmyChip2 = api_Data[i].fmyChipList2;
    if(api_Data[i].fmyChipList2 == null) buynowJson.API_fmyChip2 = "";
    buynowJson.API_promotionPriceDisplay = api_Data[i].promotionPriceDisplay;
    buynowJson.API_smbPromotionPriceDisplay = api_Data[i].smbPromotionPriceDisplay;
    buynowJson.API_priceDisplay = api_Data[i].priceDisplay;
    buynowJson.API_taxExpriceDisplay = api_Data[i].taxExPriceDisplay;
    buynowJson.API_savePrice = api_Data[i].saveText;

    learnJson.API_familyRecord = api_Data[i].familyRecord;
    learnJson.API_diplayName = api_Data[i].displayName;
    learnJson.API_modelCode = api_Data[i].modelCode;
    learnJson.pviTypeName = api_Data[i].pviTypeName;
    learnJson.API_pviSubtypeName = api_Data[i].pviSubtypeName;
    learnJson.API_ctaType = api_Data[i].ctaType;
    learnJson.API_fmyChip1 = api_Data[i].fmyChipList;
    learnJson.API_fmyChip2 = api_Data[i].fmyChipList2;
    if(api_Data[i].fmyChipList2 == null) learnJson.API_fmyChip2 = "";
    learnJson.API_promotionPriceDisplay = api_Data[i].promotionPriceDisplay;
    learnJson.API_smbPromotionPriceDisplay = api_Data[i].smbPromotionPriceDisplay;
    learnJson.API_priceDisplay = api_Data[i].priceDisplay;
    learnJson.API_taxExpriceDisplay = api_Data[i].taxExPriceDisplay;
    learnJson.API_savePrice = api_Data[i].saveText;

    cartJson.API_familyRecord = api_Data[i].familyRecord;
    cartJson.API_diplayName = api_Data[i].displayName;
    cartJson.API_modelCode = api_Data[i].modelCode;
    cartJson.pviTypeName = api_Data[i].pviTypeName;
    cartJson.API_pviSubtypeName = api_Data[i].pviSubtypeName;
    cartJson.API_ctaType = api_Data[i].ctaType;
    cartJson.API_fmyChip1 = api_Data[i].fmyChipList;
    cartJson.API_fmyChip2 = api_Data[i].fmyChipList2;
    if(api_Data[i].fmyChipList2 == null) cartJson.API_fmyChip2 = "";
    cartJson.API_promotionPriceDisplay = api_Data[i].promotionPriceDisplay;
    cartJson.API_smbPromotionPriceDisplay = api_Data[i].smbPromotionPriceDisplay;
    cartJson.API_priceDisplay = api_Data[i].priceDisplay;
    cartJson.API_savePrice = api_Data[i].saveText;

    tieredJson.API_familyRecord = api_Data[i].familyRecord;
    tieredJson.API_diplayName = api_Data[i].displayName;
    tieredJson.API_modelCode = api_Data[i].modelCode;
    tieredJson.pviTypeName = api_Data[i].pviTypeName;
    tieredJson.API_pviSubtypeName = api_Data[i].pviSubtypeName;
    tieredJson.API_ctaType = api_Data[i].ctaType;
    tieredJson.API_fmyChip1 = api_Data[i].fmyChipList;
    tieredJson.API_fmyChip2 = api_Data[i].fmyChipList2;
    if(mode == "Include") {
        try{
            tieredJson.API_TieredQuantity = api_Data[i].tieredPrice.TieredPrices_minQuantity;
        }catch(e){
            tieredJson.API_TieredQuantity = "";
        }
        try{
            tieredJson.API_TieredPrice = api_Data[i].tieredPrice.TieredPrices_value;
        }catch(e){
            tieredJson.API_TieredPrice = "";
        } 
    }
    else if(mode == "Exclude") {
        try{
            tieredJson.API_TieredQuantity = api_Data[i].tieredPrice.exVatTieredPrices_minQuantity;
        }catch(e){
            tieredJson.API_TieredQuantity = "";
        }
        try{
            tieredJson.API_TieredPrice = api_Data[i].tieredPrice.exVatTieredPrices_value;
        }catch(e){
            tieredJson.API_TieredPrice = "";
        }    
    }
    

    rsData.push(rsJson);
    if(!checkpd) prodInfo.push(prodJson);
    smrInfo.push(smrJson);
    if(!checkpf) pfPrice.push(pfJson);
    if(!checkbn) buynowInfo.push(buynowJson);
    if(!checklm) learnInfo.push(learnJson);
    if(!checkct && mode != "Entire") cartInfo.push(cartJson);
    if(!checktr) tieredInfo.push(tieredJson);
    if(!checkt) failData.push(rsJson);
    // console.log("Push OK...");
}

/***********************************************************************
 
    Function : Writing OnlyAPI Data to JSON
    Process : write_Onlyapi(i)
    Writer  : JK
    Data    : 2022-04-07
 
 ***********************************************************************/
function write_Onlyapi(sitecode, i) {
    rsJson = new Object();
    // testcase
    rsJson.SiteCode = sitecode;
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
    rsJson.SavePrice_Match = "N/A";
    rsJson.SavePrice_Comment = "N/A";
    rsJson.Stock = "N/A";
    rsJson.Stock_Comment = "N/A";
    rsJson.BuyNowCTA_PDType = "N/A";
    rsJson.BuyNowCTA_PDType_Comment = "N/A";
    rsJson.BuyNow_BC_PromotionPrice = "N/A";
    rsJson.BuyNow_BC_PromotionPrice_Comment = "N/A";
    rsJson.BuyNow_BC_OriginPrice = "N/A";
    rsJson.BuyNow_BC_OriginPrice_Comment= "N/A";
    rsJson.BuyNow_BC_SavePrice= "N/A";
    rsJson.BuyNow_BC_SavePrice_Comment= "N/A";
    rsJson.Cart_PromotionPrice = "N/A";
    rsJson.Cart_PromotionPrice_Comment = "N/A";
    rsJson.LearnMoreCTA_PDType = "N/A";
    rsJson.LearnMoreCTA_PDType_Comment = "N/A";
    rsJson.Feture_Promotion = "N/A";
    rsJson.Feture_Promotion_Comment = "N/A";
    rsJson.LearnMore_BC_PromotionPrice = "N/A";
    rsJson.LearnMore_BC_PromotionPrice_Comment = "N/A";
    rsJson.LearnMore_BC_OriginPrice= "N/A";
    rsJson.LearnMore_BC_OriginPrice_Comment= "N/A";
    rsJson.LearnMore_BC_SavePrice= "N/A";
    rsJson.LearnMore_BC_SavePrice_Comment= "N/A";
    rsJson.PF_Tiered_Quantity = "N/A";
    rsJson.PF_Tiered_Quantity_Comment = "N/A";
    rsJson.PF_Tiered_Price = "N/A";
    rsJson.PF_Tiered_Price_Comment = "N/A";
    rsJson.PD_Tiered_Quantity = "N/A";
    rsJson.PD_Tiered_Quantity_Comment = "N/A";
    rsJson.PD_Tiered_Price_Match = "N/A";
    rsJson.PD_Tiered_Price_Comment = "N/A";
    

    // Writing API Data
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
        rsJson.API_PDtaxExTieredPrice = api_Data[i].tieredPrice.exVatTieredPrices_value;
    }catch(e){
        rsJson.API_PDtaxExTieredPrice = "";
    }
    try{
        rsJson.API_PDtieredPrice = api_Data[i].tieredPrice.TieredPrices_value;
    }catch(e){
        rsJson.API_PDtieredPrice = "";
    }
    try{
    rsJson.API_PDtieredPriceQuantity = api_Data[i].tieredPrice.TieredPrices_minQuantity;
    }catch(e){
        rsJson.API_PDtieredPriceQuantity = "";
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
