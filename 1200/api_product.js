/***********************************************************************
 
    PD API Request Process
    Process : S28_1203_rq.js >> api_product.js
    Writer  : JK
    Data    : 2022-07-06

    사용방법
    1. 공유네트워크 폴더 날짜 확인
    2. data/당일 날짜(2024-02-22)/Search_API_Result폴더 확인
    3. 폴더 안에 Search_API_국가별(lv등).json 파일이 있는지 확인
    4. config.js >> Path 경로 확인
    5. 1200 터미널 열고 api_product 실행

    실행결과 예시
    {
        "Site": "cl",
        "SKU": "SM-F731BZEKLTL",
        "exVatTieredPrices_value": "",
        "exVatTieredPrices_minQuantity": "",
        "TieredPrices_value": "",
        "TieredPrices_minQuantity": "",
        "price_formattedValue": ""
    }
    및 result/PD_API_Result 안에 엑셀이 저장됬는지 확인
 
 ***********************************************************************/
const xlsx = require('xlsx');
const fs = require('fs');
const { getPDAPI } = require('../lib/getPDAPI.js');
const { getCurrentDate } = require('../lib/getDate.js');
const { searchAPIPath, productsave, productreport } = require('../config/config.js');

var at = 0;
var today = getCurrentDate();

// Check Directory
const dir = fs.existsSync(productreport);
if (!dir) fs.mkdirSync(productreport);
const api = fs.existsSync(productsave);
if (!api) fs.mkdirSync(productsave);

// Save in NAS
// const todayNas = fs.existsSync("Y:/smb/type_2/hardlaunch/data/" + today + "_data");
// if(!todayNas) fs.mkdirSync("Y:/smb/type_2/hardlaunch/data/" + today + "_data");
// const nas = fs.existsSync("Y:/smb/type_2/hardlaunch/data/" + today + "_data/SearchAPI_Result");
// if(!nas) fs.mkdirSync("Y:/smb/type_2/hardlaunch/data/" + today + "_data/SearchAPI_Result");

// Loading Search API Data
// var filePath = "Y:/smb/2024smb/sit/data/2024-01-23/Search_API_Result/"
var filePath = searchAPIPath;
    
fs.readdir(filePath, function (err, files) {
    if (err) {
        console.log("Error reading directory", err);
        return;
    }

    files.forEach(file => {
        if (file.endsWith('.json')) {
            fs.readFile(`${filePath}\\${file}`, 'utf8', (error, jsonFile) => {
                if (error) {
                    console.log(`Error reading file ${file}`, error);
                    return;
                }
                var jsonData = JSON.parse(jsonFile);
                var promiseList = new Array();

                for (var b = 0; b < jsonData.length; b++) {
                    var sSKU = jsonData[b].modelCode;
                    var sitecode = jsonData[0].sitecode;
                    var api_temp = getPDAPI(sSKU, sitecode);
                    if (api_temp != "") promiseList.push(api_temp);
                }

                Promise.all(promiseList).then((data) => {
                    data = data.reduce(function (acc, cur) {
                        return acc.concat(cur);
                    });
                    data = data.reduce(function (acc, cur) {
                        return acc.concat(cur);
                    });

                    const result = JSON.stringify(data, null, 2);
                    var cur_sc = data[0].Site;

                    // Creat Json File
                    fs.writeFileSync(productsave + 'PD_API_' + cur_sc + '.json', result);
                    console.log("PD_API_" + cur_sc + "_JSON File Saved!");

                    // Creat Excel File
                    const workBook = xlsx.utils.book_new();
                    var workSheet = xlsx.utils.json_to_sheet(data);
                    xlsx.utils.book_append_sheet(workBook, workSheet, cur_sc);
                    xlsx.writeFile(workBook, productreport + "PD_API_" + cur_sc + '.xlsx');

                });
            });
        }
    });
});
