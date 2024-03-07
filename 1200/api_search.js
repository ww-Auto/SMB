/***********************************************************************
 
    searchAPI Request Process
    Writer  : JK
    Data    : 2022-04-06

    실행방법
    1. bulk와 product처럼 config.js에서 경로 및 날짜 확인
    2. main >> api_remote.js에서 실행(벌크와 같음)

    실행 결과 예시
    {
        "sitecode": "cl",
        "APIType": "01010000",
        "familyRecord": 1,
        "displayName": "Galaxy Z Flip5",
        "modelCode": "SM-F731BZEKLTL",
        "pviTypeName": null,
        "pviSubtypeName": null,
        "ctaType": "learnMore",
        "smbPromotionPriceDisplay": "",
        "taxExPriceDisplay": "",
        "promotionPriceDisplay": "",
        "priceDisplay": "",
        "saveText": "",
        "marketingpdpYN": "N",
        "tradeIn": null,
        "KeySummaryTitle": "",
        "KeySummaryImgUrl": "",
        "pdpUrl": "/cl/business/smartphones/galaxy-z/galaxy-z-flip5-for-business-sm-f731bzekltl/",
        "originPdpUrl": "/cl/business/smartphones/galaxy-z/galaxy-z-flip5-for-business-sm-f731bzekltl/",
        "fmyChipList": "Cream",
        "fmyChipOptionName1": "cream",
        "fmyChipList2": "512 GB ",
        "fmyChipOptionName2": "512 gb ",
        "tieredPriceDisplay": "",
        "exTieredPriceDisplay": ""
    }

    mj 추가 : PD Api를 같이 돌려서 티어드가 있으면 아래 형태의 json 형식이 저장 된다
    엑셀에는 표시되지 않는다 >> 추가 필요
    "tieredPrice": {
      "Site": "lv",
      "SKU": "SM-G525FZKDEEE",
      "exVatTieredPrices_value": "644.63 €/619.83 €/578.51 €/",
      "exVatTieredPrices_minQuantity": "1/4/7/",
      "TieredPrices_value": "780.00 €/750.00 €/700.00 €/",
      "TieredPrices_minQuantity": "1/4/7/",
      "price_formattedValue": "800.00 €"
    }
 
 ***********************************************************************/

const fs = require('fs');
const xlsx = require('xlsx');
const { get_API } = require('../lib/getSearchAPI.js');
const { sitecode, APItype, searchsave } = require('../config/config.js');
const { getCurrentDate } = require('../lib/getDate.js');

var today = getCurrentDate();

// Check Directory
const savePath = searchsave; 
const dir = fs.existsSync(savePath);
if(!dir) fs.mkdirSync(savePath);

// Save in NAS
// const todayNas = fs.existsSync("Y:/smb/type_2/hardlaunch/data/" + today + "_data");
// if(!todayNas) fs.mkdirSync("Y:/smb/type_2/hardlaunch/data/" + today + "_data");
// const nas = fs.existsSync("Y:/smb/type_2/hardlaunch/data/" + today + "_data/SearchAPI_Result");
// if(!nas) fs.mkdirSync("Y:/smb/type_2/hardlaunch/data/" + today + "_data/SearchAPI_Result");

async function processSite(site) {
    let promiseList = [];
    for (let at = 0; at < APItype.length; at++) {
        let apiCall = get_API(APItype[at], site);

        if (apiCall) {
            promiseList.push(apiCall);
        }
    }

    try {
        let data = await Promise.all(promiseList);
        return data.flat(Infinity);
    } catch (error) {
        console.error(`Error processing site ${site}:`, error);
        return []; // 오류가 발생한 경우 빈 배열을 반환합니다.
    }
}

let allData = []; // 전체 데이터를 저장할 배열
async function processAllSites() {
    for (const site of sitecode) {

        let data = await processSite(site);
        if (data.length > 0) {
            const result = JSON.stringify(data, null, 2);
            let cur_sc = site; // site 변수를 직접 사용합니다.

            allData.push(...data); // 전체 데이터 배열에 결과 추가

            // JSON 파일 저장
            fs.writeFileSync(savePath + `Search_API_${cur_sc}.json`, result);
            console.log(`${savePath} : SearchAPI_${cur_sc}_JSON File Saved!`);

            // 엑셀 파일 저장
            let workBook = xlsx.utils.book_new();
            let workSheet = xlsx.utils.json_to_sheet(data);
            xlsx.utils.book_append_sheet(workBook, workSheet, cur_sc);
            xlsx.writeFile(workBook, savePath + `SearchAPI_${cur_sc}.xlsx`);
        }

        // 전체 데이터를 한 엑셀 파일로 저장
        if (allData.length > 0) {
            let workBook = xlsx.utils.book_new();
            let workSheet = xlsx.utils.json_to_sheet(allData);
            xlsx.utils.book_append_sheet(workBook, workSheet, 'AllData');
            xlsx.writeFile(workBook, savePath + '/AllSitesData.xlsx');
        }
    }
}

processAllSites();

/*
// main
for(var site = 0; site < sitecode.length; site++) {
    var promiseList = [];
    for(var at = 0; at < APItype.length; at++) {
        var api_temp = get_API(APItype[at], sitecode[site]);
        if(api_temp != "")  promiseList.push(api_temp);
    }

    Promise.all(promiseList).then((data) => {
        const workBook = xlsx.utils.book_new();

        data = data.reduce(function(acc,cur) {
            return acc.concat(cur);     
        });
        
        data = data.reduce(function(acc,cur) {
            return acc.concat(cur);     
        });

        const result = JSON.stringify(data, null, 2);
        var cur_sc = data[0].sitecode;

        // Creat Json File
        fs.writeFileSync('../result/Search_API_Result/Search_API_' + cur_sc + '.json', result);
        //fs.writeFileSync('Y:/smb/type_2/hardlaunch/data/' + today + '_data/SearchAPI_Result/Search_API_' + cur_sc + '.json', result);
        console.log("SearchAPI_" + cur_sc + "_JSON File Saved!");

        // Creat Excel File
        var workSheet = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(workBook, workSheet, cur_sc);
        xlsx.writeFile(workBook, "../result/SearchAPI_" + cur_sc + ".xlsx");
    });
}
*/
